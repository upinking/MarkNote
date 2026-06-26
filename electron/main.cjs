const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const crypto = require("node:crypto");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs/promises");

let isQuitting = false;
let lanSyncServer = null;
let lanSyncState = null;
const appIconPath = path.join(__dirname, "../build/icon.png");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 620,
    title: "MarkNote",
    icon: appIconPath,
    backgroundColor: "#f6f7fb",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.on("close", (event) => {
    if (isQuitting || win.isCloseConfirmed) {
      return;
    }

    event.preventDefault();
    win.webContents.send("app:request-close");
  });

  win.loadFile(path.join(__dirname, "../app/index.html"));
}

app.whenReady().then(() => {
  if (process.platform === "darwin" && app.dock) {
    app.dock.setIcon(appIconPath);
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  isQuitting = true;
  stopLanSyncServer();
});

ipcMain.handle("lan-sync:start", async (_event, payload) => {
  stopLanSyncServer();

  const code = String(crypto.randomInt(100000, 1000000));
  const notes = normalizeLanNotes(payload?.notes);
  const server = http.createServer((request, response) => {
    handleLanSyncRequest(request, response, code);
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "0.0.0.0", () => {
      server.off("error", reject);
      resolve();
    });
  });

  const { port } = server.address();
  lanSyncServer = server;
  lanSyncState = {
    code,
    port,
    notes,
    urls: lanSyncUrls(port)
  };

  return lanSyncPublicState();
});

ipcMain.handle("lan-sync:update", async (_event, payload) => {
  if (!lanSyncState) return null;
  lanSyncState.notes = normalizeLanNotes(payload?.notes);
  return lanSyncPublicState();
});

ipcMain.handle("lan-sync:stop", async () => {
  stopLanSyncServer();
  return { running: false };
});

ipcMain.handle("lan-sync:status", async () => lanSyncPublicState());

function normalizeLanNotes(notes = []) {
  return (Array.isArray(notes) ? notes : []).map((note, index) => {
    const now = new Date().toISOString();
    const title = String(note?.title || note?.fileName || `MarkNote-${index + 1}`).slice(0, 120);
    return {
      id: String(note?.id || `note-${index + 1}`),
      title,
      content: String(note?.content || ""),
      fileName: sanitizeFileName(note?.fileName || `${title || "MarkNote"}.md`),
      filePath: String(note?.filePath || ""),
      created_at: note?.created_at || now,
      updated_at: note?.updated_at || now,
      deleted_at: null
    };
  });
}

function lanSyncPublicState() {
  if (!lanSyncState) return { running: false, urls: [], code: "" };
  return {
    running: true,
    urls: lanSyncState.urls,
    code: lanSyncState.code,
    noteCount: lanSyncState.notes.length
  };
}

function lanSyncUrls(port) {
  const urls = [];
  const networks = os.networkInterfaces();
  Object.values(networks).flat().forEach((network) => {
    if (!network || network.family !== "IPv4" || network.internal) return;
    urls.push(`http://${network.address}:${port}`);
  });
  return urls.length ? urls : [`http://127.0.0.1:${port}`];
}

function stopLanSyncServer() {
  if (lanSyncServer) {
    lanSyncServer.close();
  }
  lanSyncServer = null;
  lanSyncState = null;
}

async function handleLanSyncRequest(request, response, code) {
  setCorsHeaders(response);
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  if (url.pathname === "/") {
    sendJson(response, 200, { ok: true, app: "MarkNote", message: "MarkNote LAN sync is running" });
    return;
  }

  const requestCode = url.searchParams.get("code") || request.headers["x-marknote-sync-code"];
  if (requestCode !== code) {
    sendJson(response, 403, { ok: false, error: "同步码不正确" });
    return;
  }

  if (request.method === "GET" && url.pathname === "/notes") {
    sendJson(response, 200, {
      ok: true,
      notes: lanSyncState.notes.map(publicLanNote)
    });
    return;
  }

  const noteMatch = url.pathname.match(/^\/notes\/([^/]+)$/);
  if (request.method === "POST" && noteMatch) {
    await receiveLanNote(request, response, decodeURIComponent(noteMatch[1]));
    return;
  }

  sendJson(response, 404, { ok: false, error: "未找到同步接口" });
}

async function receiveLanNote(request, response, noteId) {
  try {
    const body = await readJsonBody(request);
    const note = lanSyncState.notes.find((item) => item.id === noteId) || {
      id: noteId,
      title: "",
      fileName: "",
      filePath: "",
      created_at: new Date().toISOString()
    };
    const updatedNote = {
      ...note,
      title: String(body?.title || note.title || "未命名笔记").slice(0, 120),
      content: String(body?.content || ""),
      fileName: sanitizeFileName(body?.fileName || note.fileName || `${body?.title || note.title || "未命名笔记"}.md`),
      updated_at: body?.updated_at || new Date().toISOString(),
      deleted_at: null
    };

    if (!updatedNote.filePath) {
      const inboxDir = path.join(app.getPath("documents"), "MarkNote Sync");
      await fs.mkdir(inboxDir, { recursive: true });
      updatedNote.filePath = path.join(inboxDir, updatedNote.fileName);
    }

    await fs.writeFile(updatedNote.filePath, updatedNote.content, "utf8");
    lanSyncState.notes = [
      updatedNote,
      ...lanSyncState.notes.filter((item) => item.id !== updatedNote.id)
    ];

    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send("lan-sync:note-updated", publicLanNote(updatedNote));
    });

    sendJson(response, 200, { ok: true, note: publicLanNote(updatedNote) });
  } catch (error) {
    sendJson(response, 400, { ok: false, error: error?.message || "无法保存手机回传的笔记" });
  }
}

function publicLanNote(note) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    fileName: note.fileName,
    created_at: note.created_at,
    updated_at: note.updated_at,
    deleted_at: note.deleted_at || null
  };
}

function sanitizeFileName(value) {
  const name = String(value || "MarkNote.md").replace(/[\\/:*?"<>|]/g, "-").trim() || "MarkNote.md";
  return path.extname(name) ? name : `${name}.md`;
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type,X-MarkNote-Sync-Code");
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 8 * 1024 * 1024) {
        reject(new Error("笔记太大，无法通过局域网同步"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("手机发送的数据不是有效 JSON"));
      }
    });
    request.on("error", reject);
  });
}

ipcMain.handle("file:open", async () => {
  const result = await dialog.showOpenDialog({
    title: "Open Markdown file",
    filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
    properties: ["openFile"]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const content = await fs.readFile(filePath, "utf8");
  return {
    filePath,
    fileName: path.basename(filePath),
    content
  };
});

ipcMain.handle("file:open-path", async (_event, filePath) => {
  const content = await fs.readFile(filePath, "utf8");
  return {
    filePath,
    fileName: path.basename(filePath),
    content
  };
});

ipcMain.handle("file:save", async (_event, payload) => {
  const content = payload?.content ?? "";
  let filePath = payload?.filePath;

  if (!filePath) {
    const result = await dialog.showSaveDialog({
      title: "Save Markdown file",
      defaultPath: "Untitled.md",
      filters: [{ name: "Markdown", extensions: ["md"] }]
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    filePath = result.filePath;
  }

  await fs.writeFile(filePath, content, "utf8");
  return {
    filePath,
    fileName: path.basename(filePath)
  };
});

ipcMain.handle("file:save-as", async (_event, payload) => {
  const content = payload?.content ?? "";
  const defaultPath = payload?.filePath || payload?.fileName || "Untitled.md";
  const result = await dialog.showSaveDialog({
    title: "Save Markdown file as",
    defaultPath,
    filters: [{ name: "Markdown", extensions: ["md"] }]
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  await fs.writeFile(result.filePath, content, "utf8");
  return {
    filePath: result.filePath,
    fileName: path.basename(result.filePath)
  };
});

ipcMain.handle("file:rename", async (_event, payload) => {
  const filePath = payload?.filePath;
  const originalName = path.basename(filePath || "");
  let newName = String(payload?.newName || "").trim();

  if (!filePath || !newName) {
    return { ok: false, error: "invalid" };
  }

  newName = path.basename(newName);
  if (!path.extname(newName)) {
    newName += path.extname(originalName) || ".md";
  }

  const nextPath = path.join(path.dirname(filePath), newName);
  if (nextPath === filePath) {
    return {
      ok: true,
      filePath,
      fileName: originalName
    };
  }

  try {
    await fs.access(nextPath);
    return { ok: false, error: "exists" };
  } catch {
    await fs.rename(filePath, nextPath);
    return {
      ok: true,
      filePath: nextPath,
      fileName: path.basename(nextPath)
    };
  }
});

ipcMain.handle("file:show-in-folder", async (_event, filePath) => {
  if (!filePath) return false;
  shell.showItemInFolder(filePath);
  return true;
});

ipcMain.handle("file:delete", async (_event, payload) => {
  const filePath = payload?.filePath;
  if (!filePath) return { ok: false };

  await shell.trashItem(filePath);
  return { ok: true };
});

ipcMain.handle("file:export-pdf", async (_event, payload) => {
  const defaultName = path.basename(payload?.fileName || "MarkNote.md", path.extname(payload?.fileName || "MarkNote.md")) + ".pdf";
  const result = await dialog.showSaveDialog({
    title: "Export PDF",
    defaultPath: defaultName,
    filters: [{ name: "PDF", extensions: ["pdf"] }]
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  const cssPath = path.join(__dirname, "../app/styles.css");
  const katexCssPath = path.join(__dirname, "../app/vendor/katex/katex.min.css");
  const css = await fs.readFile(cssPath, "utf8");
  const katexCss = await fs.readFile(katexCssPath, "utf8").catch(() => "");
  const win = new BrowserWindow({
    show: false,
    width: 900,
    height: 1200,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const theme = payload?.theme || "light";
  const content = payload?.html || "";
  const title = payload?.fileName || "MarkNote";
  const html = `<!doctype html>
<html data-theme="${escapeAttribute(theme)}">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      ${css}
      ${katexCss}
      body { min-width: 0; min-height: 0; overflow: visible; background: var(--surface); }
      .markdownPreview { max-width: 760px; padding: 32px 42px; }
      @media print {
        body { background: #fff; }
        .markdownPreview { color: #171b23; }
      }
    </style>
  </head>
  <body>
    <article class="markdownPreview">${content}</article>
  </body>
</html>`;

  try {
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    const pdf = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: "A4",
      margins: {
        marginType: "default"
      }
    });
    await fs.writeFile(result.filePath, pdf);
    return {
      filePath: result.filePath,
      fileName: path.basename(result.filePath)
    };
  } finally {
    win.destroy();
  }
});

ipcMain.handle("file:readme", async () => {
  const readmePath = path.join(__dirname, "../README.md");
  const content = await fs.readFile(readmePath, "utf8");
  return {
    filePath: readmePath,
    fileName: "README.md",
    content
  };
});

ipcMain.handle("ai:complete", async (_event, payload) => {
  const request = buildAiRequest(payload);
  if (!request.apiKey) {
    return { ok: false, error: "missing-key" };
  }

  try {
    const content = request.provider === "deepseek"
      ? await callDeepSeek(request)
      : await callOpenAICompatible(request);

    return {
      ok: true,
      ...normalizeAiContent(content, { needsDraft: request.needsDraft })
    };
  } catch (error) {
    return {
      ok: false,
      error: error?.code || "request-failed",
      message: error?.message || "AI request failed"
    };
  }
});

ipcMain.handle("ai:stream", async (event, message) => {
  const requestId = message?.requestId;
  const payload = message?.payload || {};
  const request = buildAiRequest(payload);

  if (!requestId) return;

  const send = (channel, body) => {
    event.sender.send(channel, { requestId, ...body });
  };

  if (!request.apiKey) {
    send("ai:stream-error", { error: "missing-key" });
    return;
  }

  let raw = "";
  try {
    const content = request.provider === "deepseek"
      ? await callDeepSeekStream(request, (delta) => {
          raw += delta;
          send("ai:stream-delta", { text: extractPartialJsonStringField(raw, "message") || raw });
        })
      : await callOpenAICompatibleStream(request, (delta) => {
          raw += delta;
          send("ai:stream-delta", { text: extractPartialJsonStringField(raw, "message") || raw });
        });

    send("ai:stream-done", {
      result: {
        ok: true,
        ...normalizeAiContent(content, { needsDraft: request.needsDraft })
      }
    });
  } catch (error) {
    send("ai:stream-error", {
      error: error?.message || "AI request failed"
    });
  }
});

const aiProviders = ["openai", "deepseek", "mimo"];
const aiProviderLabels = {
  openai: "OpenAI",
  deepseek: "DeepSeek",
  mimo: "MiMo"
};
const defaultAiModels = {
  openai: "gpt-4.1-mini",
  deepseek: "deepseek-v4-flash",
  mimo: "mimo-v2.5"
};
const defaultAiBaseUrls = {
  openai: "https://api.openai.com/v1",
  deepseek: "https://api.deepseek.com",
  mimo: "https://api.mimo-v2.com/v1"
};

function buildAiRequest(payload) {
  const provider = aiProviders.includes(payload?.provider) ? payload.provider : "openai";
  const apiKey = String(payload?.apiKey || "").trim();
  const model = String(payload?.model || "").trim() || defaultAiModels[provider];
  const baseUrl = normalizeChatBaseUrl(payload?.baseUrl, provider);
  const instruction = String(payload?.instruction || "");
  const needsDraft = aiRequestNeedsDraft(instruction);

  const systemPrompt = [
    "You are MarkNote Agent, a careful Markdown note assistant.",
    `Current provider: ${aiProviderLabels[provider]}.`,
    `Current model: ${model}.`,
    "If you mention your model or provider, use only the current provider/model above and do not claim to be a different model.",
    "You help summarize, polish, continue, and restructure the user's current Markdown note.",
    "You may propose edits, but you must not claim that edits have been applied.",
    "Always respond as strict JSON with this shape:",
    "{\"type\":\"reply\"|\"draft\",\"message\":\"short explanation\",\"markdown\":\"complete markdown when type is draft, otherwise empty string\"}.",
    "Use type=\"draft\" only when the user asks you to modify, rewrite, polish, continue, organize, restructure, or generate a replacement note.",
    "For requests to fix, convert, or correct math, formulas, LaTeX, code fences, or Markdown syntax, use type=\"draft\".",
    "When type=\"draft\", markdown must be the complete new Markdown document, not a patch and not a fragment.",
    "When type=\"draft\", the message should say that a previewable draft is ready, not that edits were applied.",
    needsDraft
      ? "The current user request is an edit request. You must return type=\"draft\" with the full replacement Markdown document. Do not return only an explanation."
      : "The current user request appears to be a question. Use type=\"reply\" unless the user explicitly asks for a replacement note."
  ].join("\n");

  const userPrompt = [
    `File name: ${payload?.fileName || "Untitled.md"}`,
    `User request: ${instruction}`,
    "Recent conversation:",
    JSON.stringify((payload?.messages || []).slice(-8)),
    "Current Markdown:",
    payload?.markdown || ""
  ].join("\n\n");

  return { provider, apiKey, model, baseUrl, systemPrompt, userPrompt, needsDraft };
}

ipcMain.handle("dialog:confirm-draft-restore", async (event, payload) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showMessageBox(win, {
    type: "question",
    title: payload?.title ?? "Recover draft",
    message: payload?.message ?? "A draft was found.",
    detail: payload?.detail ?? "Restore it?",
    buttons: payload?.buttons ?? ["Restore", "Discard"],
    defaultId: 0,
    cancelId: 1,
    noLink: true
  });

  return result.response === 0 ? "restore" : "discard";
});

ipcMain.handle("dialog:confirm-delete-file", async (event, payload) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showMessageBox(win, {
    type: "warning",
    title: payload?.title ?? "Delete file",
    message: payload?.message ?? "Move this file to Trash?",
    detail: payload?.detail ?? "This can be undone from Trash.",
    buttons: payload?.buttons ?? ["Move to Trash", "Cancel"],
    defaultId: 1,
    cancelId: 1,
    noLink: true
  });

  return result.response === 0 ? "delete" : "cancel";
});

ipcMain.handle("dialog:confirm-unsaved", async (event, payload) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const buttons = payload?.buttons ?? ["Save", "Don't Save", "Cancel"];
  const result = await dialog.showMessageBox(win, {
    type: "warning",
    title: payload?.title ?? "Unsaved changes",
    message: payload?.message ?? "You have unsaved changes.",
    detail: payload?.detail ?? "Save your changes before continuing?",
    buttons,
    defaultId: 0,
    cancelId: 2,
    noLink: true
  });

  return ["save", "discard", "cancel"][result.response] ?? "cancel";
});

ipcMain.on("window:close-confirmed", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  win.isCloseConfirmed = true;
  win.close();
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function normalizeChatBaseUrl(baseUrl, provider) {
  const fallback = defaultAiBaseUrls[provider] || defaultAiBaseUrls.openai;
  const raw = String(baseUrl || fallback).trim() || fallback;
  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  return withoutTrailingSlash.replace(/\/chat\/completions$/i, "");
}

async function callOpenAICompatible({ apiKey, model, baseUrl, systemPrompt, userPrompt, provider }) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.message || `${aiProviderLabels[provider] || "AI"} request failed (${response.status})`);
    error.code = response.status === 401 ? "auth-failed" : "request-failed";
    throw error;
  }

  return data?.choices?.[0]?.message?.content || "";
}

async function callOpenAICompatibleStream({ apiKey, model, baseUrl, systemPrompt, userPrompt, provider }, onDelta) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4,
      stream: true
    })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data?.error?.message || `${aiProviderLabels[provider] || "AI"} request failed (${response.status})`);
    error.code = response.status === 401 ? "auth-failed" : "request-failed";
    throw error;
  }

  return readServerSentEvents(response, (event) => {
    const delta = event.data?.choices?.[0]?.delta?.content || "";
    if (delta) {
      onDelta(delta);
    }
    return delta;
  });
}

async function callDeepSeek({ apiKey, model, baseUrl, systemPrompt, userPrompt }) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.message || `DeepSeek request failed (${response.status})`);
    error.code = response.status === 401 ? "auth-failed" : "request-failed";
    throw error;
  }

  return data?.choices?.[0]?.message?.content || "";
}

async function callDeepSeekStream({ apiKey, model, baseUrl, systemPrompt, userPrompt }, onDelta) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4,
      stream: true
    })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data?.error?.message || `DeepSeek request failed (${response.status})`);
    error.code = response.status === 401 ? "auth-failed" : "request-failed";
    throw error;
  }

  return readServerSentEvents(response, (event) => {
    const delta = event.data?.choices?.[0]?.delta?.content || "";
    if (delta) {
      onDelta(delta);
    }
    return delta;
  });
}

async function readServerSentEvents(response, onEvent) {
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";

  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      const lines = part.split("\n");
      const type = lines.find((line) => line.startsWith("event:"))?.slice(6).trim() || "";
      const dataText = lines
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim())
        .join("\n");

      if (!dataText || dataText === "[DONE]") continue;

      const data = JSON.parse(dataText);
      content += onEvent({ type, data }) || "";
    }
  }

  return content;
}

function collectResponseText(data) {
  return (data?.output || [])
    .flatMap((item) => item?.content || [])
    .map((content) => content?.text || "")
    .join("\n")
    .trim();
}

function aiRequestNeedsDraft(instruction) {
  const text = String(instruction || "").trim();
  if (!text) return false;

  const englishEditIntent = /\b(modify|rewrite|polish|continue|organize|restructure|replace|convert|correct|fix|repair|apply|update)\b/i;
  const chineseEditIntent =
    /(?:帮我|请|麻烦|那你).{0,20}(?:修改|改写|改成|改为|改对|改正|修正|修复|纠正|替换|转换|转成|润色|续写|整理|重构|优化|生成)|(?:把|将).{0,80}(?:改成|改为|改对|改正|修正|修复|纠正|替换|转换|转成|润色|整理|重构|优化)/;

  return englishEditIntent.test(text) || chineseEditIntent.test(text);
}

function normalizeAiContent(content, options = {}) {
  const raw = String(content || "").trim();
  const jsonText = extractAiJsonText(raw);

  try {
    const parsed = JSON.parse(jsonText);
    const parsedMarkdown = String(parsed.markdown || "");
    const type = parsed.type === "draft" || (options.needsDraft && parsedMarkdown.trim()) ? "draft" : "reply";
    if (options.needsDraft && !parsedMarkdown.trim()) {
      return {
        type: "reply",
        message: missingDraftMessage(String(parsed.message || raw).trim()),
        markdown: ""
      };
    }

    return {
      type,
      message: String(parsed.message || "").trim() || (type === "draft" ? "已生成修改草案。" : raw),
      markdown: type === "draft" ? parsedMarkdown : ""
    };
  } catch {
    if (options.needsDraft) {
      return {
        type: "reply",
        message: missingDraftMessage(raw),
        markdown: ""
      };
    }

    return {
      type: "reply",
      message: raw || "AI 没有返回内容。",
      markdown: ""
    };
  }
}

function extractAiJsonText(raw) {
  const trimmed = String(raw || "").trim();
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  if (unfenced.startsWith("{")) return unfenced;

  const start = trimmed.indexOf("{");
  if (start < 0) return unfenced;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < trimmed.length; index += 1) {
    const char = trimmed[index];
    if (escaped) {
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (char === "\"") {
      inString = !inString;
    } else if (!inString && char === "{") {
      depth += 1;
    } else if (!inString && char === "}") {
      depth -= 1;
      if (depth === 0) {
        return trimmed.slice(start, index + 1);
      }
    }
  }

  return unfenced;
}

function missingDraftMessage(message) {
  const detail = String(message || "").trim();
  const prefix = "AI 只返回了说明，没有返回可应用的完整 Markdown 草案，所以当前笔记还没有被修改。请再试一次，或明确要求它“返回完整 Markdown 草案”。";
  return detail ? `${prefix}\n\n原回复：${detail}` : prefix;
}

function extractPartialJsonStringField(jsonText, fieldName) {
  const fieldStart = jsonText.indexOf(`"${fieldName}"`);
  if (fieldStart < 0) return "";

  const colon = jsonText.indexOf(":", fieldStart);
  if (colon < 0) return "";

  const quote = jsonText.indexOf("\"", colon + 1);
  if (quote < 0) return "";

  let value = "";
  let escaped = false;
  for (let index = quote + 1; index < jsonText.length; index += 1) {
    const char = jsonText[index];
    if (escaped) {
      value += decodeJsonEscape(char);
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (char === "\"") {
      break;
    } else {
      value += char;
    }
  }

  return value;
}

function decodeJsonEscape(char) {
  return {
    "\"": "\"",
    "\\": "\\",
    "/": "/",
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t"
  }[char] || char;
}
