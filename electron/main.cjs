const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");

let isQuitting = false;
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
});

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
      ...normalizeAiContent(content)
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
        ...normalizeAiContent(content)
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
    "When type=\"draft\", markdown must be the complete new Markdown document, not a patch and not a fragment."
  ].join("\n");

  const userPrompt = [
    `File name: ${payload?.fileName || "Untitled.md"}`,
    `User request: ${payload?.instruction || ""}`,
    "Recent conversation:",
    JSON.stringify((payload?.messages || []).slice(-8)),
    "Current Markdown:",
    payload?.markdown || ""
  ].join("\n\n");

  return { provider, apiKey, model, baseUrl, systemPrompt, userPrompt };
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

function normalizeAiContent(content) {
  const raw = String(content || "").trim();
  const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    const parsed = JSON.parse(jsonText);
    const type = parsed.type === "draft" ? "draft" : "reply";
    return {
      type,
      message: String(parsed.message || "").trim() || (type === "draft" ? "已生成修改草案。" : raw),
      markdown: type === "draft" ? String(parsed.markdown || "") : ""
    };
  } catch {
    return {
      type: "reply",
      message: raw || "AI 没有返回内容。",
      markdown: ""
    };
  }
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
