import "katex/dist/katex.min.css";
import { requestAiCompletion, aiProviders, defaultAiSettings } from "../../shared/ai.js";
import { extractHeadings, markdownDocumentToHtml, escapeHtml } from "../../shared/markdown.js";
import {
  createEmptyNote,
  mergeRemoteNotes,
  normalizeRemoteNote,
  noteSyncStates,
  sortNotes,
  titleFromMarkdown
} from "../../shared/notes.js";
import "./styles.css";

const keys = {
  settings: "marknote.mobile.settings",
  notes: "marknote.mobile.notes",
  selectedId: "marknote.mobile.selectedId",
  ai: "marknote.mobile.ai"
};

const initialSettings = {
  syncUrl: "",
  syncCode: "",
  localOnly: false
};

const state = {
  settings: loadJson(keys.settings, initialSettings),
  aiSettings: loadJson(keys.ai, defaultAiSettings()),
  notes: loadNotes(),
  selectedId: localStorage.getItem(keys.selectedId) || "",
  mode: "reader",
  panel: "",
  editorDraft: "",
  syncing: false,
  toast: "",
  conflict: null,
  syncMessage: "",
  aiPrompt: "",
  aiResult: "",
  aiLoading: false
};

const app = document.querySelector("#app");

init();

async function init() {
  render();

  window.addEventListener("online", () => {
    showToast("网络已恢复，正在同步");
    syncPendingNotes();
  });
  window.addEventListener("offline", () => showToast("已离线，修改会先保存在本机"));

  if (hasLanSyncSettings()) {
    await refreshNotes();
  }

  if (!state.notes.length) {
    const note = createEmptyNote();
    state.notes = [note];
    state.selectedId = note.id;
    state.editorDraft = note.content;
    saveLocalNotes();
  }

  if (!selectedNote()) {
    state.selectedId = state.notes[0]?.id || "";
  }
  state.editorDraft = selectedNote()?.content || "";
  render();
}

function loadJson(key, fallback) {
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(key) || "{}") };
  } catch {
    return fallback;
  }
}

function loadNotes() {
  try {
    const notes = JSON.parse(localStorage.getItem(keys.notes) || "[]");
    return Array.isArray(notes) ? sortNotes(notes) : [];
  } catch {
    return [];
  }
}

function hasLanSyncSettings() {
  return Boolean(state.settings.syncUrl?.trim() && state.settings.syncCode?.trim());
}

async function lanSyncFetch(path, options = {}) {
  const baseUrl = state.settings.syncUrl.trim().replace(/\/+$/, "");
  const code = encodeURIComponent(state.settings.syncCode.trim());
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${baseUrl}${path}${separator}code=${code}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

function saveLocalNotes() {
  localStorage.setItem(keys.notes, JSON.stringify(sortNotes(state.notes)));
  if (state.selectedId) localStorage.setItem(keys.selectedId, state.selectedId);
}

function selectedNote() {
  return state.notes.find((note) => note.id === state.selectedId) || state.notes[0] || null;
}

function setMode(mode) {
  state.mode = mode;
  state.panel = "";
  if (mode === "editor") {
    state.editorDraft = selectedNote()?.content || "";
  }
  render();
}

function selectNote(id) {
  state.selectedId = id;
  state.editorDraft = selectedNote()?.content || "";
  state.mode = "reader";
  state.panel = "";
  saveLocalNotes();
  render();
}

function createNote() {
  const note = createEmptyNote();
  state.notes = sortNotes([note, ...state.notes]);
  state.selectedId = note.id;
  state.editorDraft = note.content;
  state.mode = "editor";
  saveLocalNotes();
  render();
}

async function saveDraft() {
  const note = selectedNote();
  if (!note) return;

  const now = new Date().toISOString();
  const next = {
    ...note,
    title: titleFromMarkdown(state.editorDraft),
    content: state.editorDraft,
    updated_at: now,
    syncState: state.settings.localOnly ? noteSyncStates.synced : noteSyncStates.pending
  };
  replaceNote(next);
  state.mode = "reader";
  showToast(state.settings.localOnly ? "已保存到本机" : "已保存到本机，正在同步");
  await syncNote(next);
  render();
}

function replaceNote(nextNote) {
  state.notes = sortNotes(state.notes.map((note) => (note.id === nextNote.id ? nextNote : note)));
  saveLocalNotes();
}

async function refreshNotes() {
  if (state.settings.localOnly || !hasLanSyncSettings()) return;

  state.syncing = true;
  render();
  try {
    const data = await lanSyncFetch("/notes");
    state.notes = mergeRemoteNotes(state.notes, data.notes || []);
    if (!selectedNote()) state.selectedId = state.notes[0]?.id || "";
    saveLocalNotes();
    await syncPendingNotes();
    state.syncMessage = `已从电脑同步 ${data.notes?.length || 0} 篇笔记`;
    showToast(state.syncMessage);
  } catch (error) {
    state.syncMessage = `同步失败：${error.message}`;
    showToast(state.syncMessage);
  } finally {
    state.syncing = false;
    render();
  }
}

async function syncPendingNotes() {
  if (state.settings.localOnly) return;
  if (!navigator.onLine || !hasLanSyncSettings()) return;

  const pending = state.notes.filter((note) => note.syncState === noteSyncStates.pending || note.id.startsWith("local-"));
  for (const note of pending) {
    await syncNote(note);
  }
}

async function syncNote(note) {
  if (state.settings.localOnly) {
    replaceNote({ ...note, syncState: noteSyncStates.synced });
    return;
  }

  if (!navigator.onLine || !hasLanSyncSettings()) {
    replaceNote({ ...note, syncState: noteSyncStates.pending });
    return;
  }

  state.syncing = true;
  render();

  try {
    const payload = {
      title: note.title,
      content: note.content,
      fileName: `${note.title || "未命名笔记"}.md`,
      updated_at: note.updated_at
    };

    const data = await lanSyncFetch(`/notes/${encodeURIComponent(note.id)}`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const synced = normalizeRemoteNote(data.note || { ...note, ...payload });
    state.notes = sortNotes(state.notes.map((item) => (item.id === note.id ? synced : item)));
    if (state.selectedId === note.id) state.selectedId = synced.id;
    state.conflict = null;
    saveLocalNotes();
  } catch (error) {
    replaceNote({ ...note, syncState: noteSyncStates.error });
    showToast(`同步失败：${error.message}`);
  } finally {
    state.syncing = false;
    render();
  }
}

async function deleteSelectedNote() {
  const note = selectedNote();
  if (!note) return;

  const deleted = {
    ...note,
    deleted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    syncState: note.id.startsWith("local-") ? noteSyncStates.synced : noteSyncStates.pending
  };
  state.notes = state.notes.filter((item) => item.id !== note.id);
  if (!note.id.startsWith("local-")) {
    state.notes.push(deleted);
    await syncNote(deleted);
    state.notes = state.notes.filter((item) => item.id !== note.id);
  }
  state.selectedId = state.notes.find((item) => !item.deleted_at)?.id || "";
  state.mode = "reader";
  saveLocalNotes();
  render();
}

async function signOut() {
  state.settings = { ...state.settings, syncUrl: "", syncCode: "", localOnly: true };
  localStorage.setItem(keys.settings, JSON.stringify(state.settings));
  showToast("已断开电脑同步");
  render();
}

async function saveSettings(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.settings = {
    syncUrl: String(form.get("syncUrl") || "").trim(),
    syncCode: String(form.get("syncCode") || "").trim(),
    localOnly: false
  };
  localStorage.setItem(keys.settings, JSON.stringify(state.settings));
  showToast("同步信息已保存");
  state.panel = "";
  await refreshNotes();
}

function saveAiSettings(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.aiSettings = {
    provider: String(form.get("provider") || "openai"),
    baseUrl: String(form.get("baseUrl") || "").trim(),
    model: String(form.get("model") || "").trim(),
    apiKey: String(form.get("apiKey") || "")
  };
  localStorage.setItem(keys.ai, JSON.stringify(state.aiSettings));
  showToast("AI 设置已保存");
  render();
}

function applyProviderDefaults(provider) {
  const defaults = aiProviders[provider] || aiProviders.openai;
  state.aiSettings = {
    ...state.aiSettings,
    provider,
    baseUrl: defaults.baseUrl,
    model: defaults.model
  };
  render();
}

async function runAi(action) {
  const note = selectedNote();
  if (!note || state.aiLoading) return;

  const prompts = {
    summary: `请总结这篇 Markdown 笔记，提炼重点和待办：\n\n${note.content}`,
    polish: `请润色这篇 Markdown 笔记，让表达更清晰，但保留原意：\n\n${note.content}`,
    continue: `请根据当前内容继续往下写，保持原有风格：\n\n${note.content}`
  };
  const prompt = action === "custom" ? state.aiPrompt : prompts[action];
  if (!prompt?.trim()) return;

  state.aiLoading = true;
  state.aiResult = "";
  render();
  try {
    state.aiResult = await requestAiCompletion({
      settings: state.aiSettings,
      prompt
    });
  } catch (error) {
    state.aiResult = error.message;
  } finally {
    state.aiLoading = false;
    render();
  }
}

function applyAiResult() {
  if (!state.aiResult.trim()) return;
  state.editorDraft = state.aiResult;
  state.mode = "editor";
  state.panel = "";
  render();
}

function resolveConflict(choice) {
  if (!state.conflict) return;
  const next = choice === "remote"
    ? state.conflict.remote
    : { ...state.conflict.local, syncState: noteSyncStates.pending, lastSyncedAt: "" };
  replaceNote(next);
  state.selectedId = next.id;
  state.conflict = null;
  if (choice === "local") syncNote(next);
  render();
}

function showToast(message) {
  state.toast = message;
  render();
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    state.toast = "";
    render();
  }, 2600);
}

function syncLabel(note) {
  if (!note) return "";
  if (state.settings.localOnly) return "本机";
  if (state.syncing) return "同步中";
  if (note.syncState === noteSyncStates.pending) return "待同步";
  if (note.syncState === noteSyncStates.conflict) return "有冲突";
  if (note.syncState === noteSyncStates.error) return "同步失败";
  if (!navigator.onLine) return "离线";
  return "已同步";
}

function render() {
  const note = selectedNote();
  const headings = extractHeadings(note?.content || "");
  const needsSetup = !state.settings.localOnly && !hasLanSyncSettings();

  app.innerHTML = `
    <div class="mobileShell">
      <header class="topBar">
        <button class="brandButton" data-action="home" type="button">
          <img src="/icon.png" alt="" />
          <span>MarkNote</span>
        </button>
        <div class="topActions">
          <span class="syncPill ${note?.syncState || ""}">${syncLabel(note)}</span>
          ${hasLanSyncSettings() && !state.settings.localOnly ? `<button class="iconButton" data-action="refresh" type="button" aria-label="同步">${iconRefresh()}</button>` : ""}
          <button class="iconButton" data-panel="settings" type="button" aria-label="设置">${iconSettings()}</button>
        </div>
      </header>

      ${state.conflict ? conflictBanner() : ""}
      ${needsSetup ? setupView() : workspaceView(note, headings)}
      ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ""}
      ${state.panel ? panelView(note, headings) : ""}
    </div>
  `;

  bindEvents();
}

function setupView() {
  return `
    <main class="setupView">
      <section class="intro">
        <h1>连接你的电脑</h1>
        <p>在电脑端打开“局域网同步”，把电脑地址和 6 位同步码填到这里。手机和电脑需要在同一个 Wi-Fi 下。</p>
      </section>
      ${settingsForm()}
      <button class="ghostButton fullWidth" data-action="localOnly" type="button">先本机试用</button>
    </main>
  `;
}

function workspaceView(note, headings) {
  if (state.mode === "editor") return editorView(note);
  if (state.mode === "list") return listView();
  return readerView(note, headings);
}

function listView() {
  const visibleNotes = state.notes.filter((note) => !note.deleted_at);
  return `
    <main class="noteListView">
      <div class="sectionHeader">
        <div>
          <h1>笔记</h1>
          <p>${visibleNotes.length} 篇同步笔记</p>
        </div>
        <button class="roundButton" data-action="new" type="button" aria-label="新建">${iconPlus()}</button>
      </div>
      <div class="noteList">
        ${visibleNotes.map((note) => noteListItem(note)).join("")}
      </div>
    </main>
  `;
}

function noteListItem(note) {
  const preview = note.content.replace(/[#>*_`\-[\]()]/g, " ").replace(/\s+/g, " ").trim().slice(0, 92);
  return `
    <button class="noteRow ${note.id === state.selectedId ? "active" : ""}" data-note-id="${note.id}" type="button">
      <strong>${escapeHtml(note.title)}</strong>
      <span>${escapeHtml(preview || "空白笔记")}</span>
      <small>${formatDate(note.updated_at)} · ${syncLabel(note)}</small>
    </button>
  `;
}

function readerView(note, headings) {
  if (!note) return listView();
  return `
    <main class="readerView">
      <section class="readerHeader">
        <button class="ghostButton" data-action="list" type="button">${iconList()} 笔记</button>
        <div class="readerActions">
          <button class="ghostButton" data-panel="outline" type="button">${iconOutline()} 目录</button>
          <button class="primaryButton compact" data-action="edit" type="button">${iconEdit()} 编辑</button>
        </div>
      </section>
      <article class="document">
        ${markdownDocumentToHtml(note.content)}
      </article>
      <nav class="bottomNav">
        <button data-action="list" type="button">${iconList()}<span>笔记</span></button>
        <button data-panel="ai" type="button">${iconSpark()}<span>AI</span></button>
        <button data-panel="outline" type="button">${iconOutline()}<span>目录</span></button>
        <button data-action="edit" type="button">${iconEdit()}<span>编辑</span></button>
      </nav>
      ${headings.length ? "" : `<p class="emptyHint">用 #、## 或 ### 写标题后，这里会生成目录。</p>`}
    </main>
  `;
}

function editorView(note) {
  return `
    <main class="editorView">
      <div class="editBar">
        <button class="ghostButton" data-action="cancelEdit" type="button">取消</button>
        <strong>${escapeHtml(note?.title || "未命名笔记")}</strong>
        <button class="primaryButton compact" data-action="save" type="button">保存</button>
      </div>
      <textarea class="mobileEditor" spellcheck="false" aria-label="Markdown 编辑区">${escapeHtml(state.editorDraft)}</textarea>
    </main>
  `;
}

function panelView(note, headings) {
  const title = {
    settings: "设置",
    outline: "目录",
    ai: "AI 助手"
  }[state.panel];

  return `
    <div class="sheetBackdrop" data-action="closePanel">
      <aside class="bottomSheet" role="dialog" aria-label="${title}">
        <header class="sheetHeader">
          <strong>${title}</strong>
          <button class="iconButton" data-action="closePanel" type="button" aria-label="关闭">${iconClose()}</button>
        </header>
        ${state.panel === "settings" ? settingsPanel() : ""}
        ${state.panel === "outline" ? outlinePanel(headings) : ""}
        ${state.panel === "ai" ? aiPanel(note) : ""}
      </aside>
    </div>
  `;
}

function settingsPanel() {
  const userSection = hasLanSyncSettings() && !state.settings.localOnly
    ? `<div class="userCard">
        <div class="userCardInfo">
          <strong>${escapeHtml(state.settings.syncUrl)}</strong>
          <span>已连接电脑同步</span>
        </div>
        <button class="dangerButton" data-action="signOut" type="button">断开</button>
      </div>`
    : state.settings.localOnly
      ? `<div class="userCard">
          <div class="userCardInfo">
            <strong>本机试用模式</strong>
            <span>未连接电脑同步</span>
          </div>
          <button class="ghostButton" data-action="exitLocalOnly" type="button">连接电脑</button>
        </div>`
      : "";

  return `
    ${userSection}
    ${settingsForm()}
    <form class="stackForm" data-form="aiSettings">
      <h2>AI 设置</h2>
      <label>
        <span>服务</span>
        <select name="provider">
          ${Object.entries(aiProviders).map(([value, provider]) => `
            <option value="${value}" ${state.aiSettings.provider === value ? "selected" : ""}>${provider.label}</option>
          `).join("")}
        </select>
      </label>
      <label>
        <span>Base URL</span>
        <input name="baseUrl" value="${escapeHtml(state.aiSettings.baseUrl)}" autocomplete="off" />
      </label>
      <label>
        <span>模型</span>
        <input name="model" value="${escapeHtml(state.aiSettings.model)}" autocomplete="off" />
      </label>
      <label>
        <span>API Key</span>
        <input name="apiKey" type="password" value="${escapeHtml(state.aiSettings.apiKey)}" autocomplete="off" />
      </label>
      <button class="primaryButton" type="submit">保存 AI 设置</button>
    </form>
  `;
}

function settingsForm() {
  return `
    <form class="stackForm" data-form="settings">
      <label>
        <span>电脑地址</span>
        <input name="syncUrl" value="${escapeHtml(state.settings.syncUrl)}" placeholder="http://192.168.1.8:49152" autocomplete="off" />
      </label>
      <label>
        <span>同步码</span>
        <input name="syncCode" value="${escapeHtml(state.settings.syncCode)}" placeholder="6 位数字" inputmode="numeric" autocomplete="off" />
      </label>
      <button class="primaryButton" type="submit">连接并同步</button>
      ${state.syncMessage ? `<p class="formHint">${escapeHtml(state.syncMessage)}</p>` : ""}
    </form>
  `;
}

function outlinePanel(headings) {
  if (!headings.length) return `<p class="emptyHint">当前笔记还没有标题。</p>`;
  return `
    <div class="outlineList">
      ${headings.map((heading) => `
        <button class="outlineItem level${heading.level}" data-heading-id="${heading.id}" type="button">
          ${escapeHtml(heading.text)}
        </button>
      `).join("")}
    </div>
  `;
}

function aiPanel(note) {
  return `
    <div class="aiQuickActions">
      <button data-ai-action="summary" type="button">总结</button>
      <button data-ai-action="polish" type="button">润色</button>
      <button data-ai-action="continue" type="button">续写</button>
    </div>
    <label class="aiComposer">
      <span>自定义要求</span>
      <textarea rows="4" class="aiPrompt">${escapeHtml(state.aiPrompt)}</textarea>
    </label>
    <button class="primaryButton" data-ai-action="custom" type="button">发送给 AI</button>
    <div class="aiResult">
      ${state.aiLoading ? `<p>AI 正在思考...</p>` : ""}
      ${state.aiResult ? `<pre>${escapeHtml(state.aiResult)}</pre><button class="primaryButton" data-action="applyAi" type="button">放到编辑器</button>` : ""}
      ${!note ? `<p>先选择一篇笔记，再使用 AI。</p>` : ""}
    </div>
  `;
}

function conflictBanner() {
  return `
    <div class="conflictBanner">
      <strong>发现同步冲突</strong>
      <span>这篇笔记在电脑和手机上都改过。</span>
      <button data-conflict="local" type="button">保留本机</button>
      <button data-conflict="remote" type="button">使用电脑</button>
    </div>
  `;
}

function bindEvents() {
  app.querySelectorAll("[data-action]").forEach((node) => {
    node.addEventListener("click", (event) => {
      const action = event.currentTarget.dataset.action;
      if (action === "home" || action === "list") setMode("list");
      if (action === "new") createNote();
      if (action === "edit") setMode("editor");
      if (action === "cancelEdit") setMode("reader");
      if (action === "save") saveDraft();
      if (action === "localOnly") {
        state.settings = { ...state.settings, localOnly: true };
        localStorage.setItem(keys.settings, JSON.stringify(state.settings));
        showToast("已进入本机试用模式");
        render();
      }
      if (action === "delete") deleteSelectedNote();
      if (action === "closePanel") {
        state.panel = "";
        render();
      }
      if (action === "signOut") signOut();
      if (action === "refresh") {
        showToast("正在同步...");
        refreshNotes().then(() => showToast("同步完成"));
      }
      if (action === "exitLocalOnly") {
        state.settings = { ...state.settings, localOnly: false };
        localStorage.setItem(keys.settings, JSON.stringify(state.settings));
        showToast("已退出本机模式，请连接电脑");
        render();
      }
      if (action === "applyAi") applyAiResult();
    });
  });

  app.querySelectorAll("[data-panel]").forEach((node) => {
    node.addEventListener("click", (event) => {
      state.panel = event.currentTarget.dataset.panel;
      render();
    });
  });

  app.querySelectorAll("[data-note-id]").forEach((node) => {
    node.addEventListener("click", () => selectNote(node.dataset.noteId));
  });

  app.querySelectorAll("[data-heading-id]").forEach((node) => {
    node.addEventListener("click", () => {
      state.panel = "";
      render();
      window.setTimeout(() => document.getElementById(node.dataset.headingId)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    });
  });

  app.querySelectorAll("[data-conflict]").forEach((node) => {
    node.addEventListener("click", () => resolveConflict(node.dataset.conflict));
  });

  const editor = app.querySelector(".mobileEditor");
  if (editor) {
    editor.addEventListener("input", () => {
      state.editorDraft = editor.value;
    });
  }

  const aiPrompt = app.querySelector(".aiPrompt");
  if (aiPrompt) {
    aiPrompt.addEventListener("input", () => {
      state.aiPrompt = aiPrompt.value;
    });
  }

  app.querySelectorAll("[data-ai-action]").forEach((node) => {
    node.addEventListener("click", () => runAi(node.dataset.aiAction));
  });

  const providerSelect = app.querySelector("select[name='provider']");
  if (providerSelect) {
    providerSelect.addEventListener("change", () => applyProviderDefaults(providerSelect.value));
  }

  app.querySelector("[data-form='settings']")?.addEventListener("submit", saveSettings);
  app.querySelector("[data-form='aiSettings']")?.addEventListener("submit", saveAiSettings);

  app.querySelector(".sheetBackdrop")?.addEventListener("click", (event) => {
    if (event.target.classList.contains("sheetBackdrop")) {
      state.panel = "";
      render();
    }
  });
}

function formatDate(value) {
  if (!value) return "刚刚";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function iconSettings() {
  return `<svg viewBox="0 0 24 24"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.5-1H5.3v-3h.2A1.7 1.7 0 0 0 7 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 8l-.1.1A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.5 1Z"/></svg>`;
}

function iconPlus() {
  return `<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`;
}

function iconList() {
  return `<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12M4 6h.1M4 12h.1M4 18h.1"/></svg>`;
}

function iconEdit() {
  return `<svg viewBox="0 0 24 24"><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m14 7 3 3"/></svg>`;
}

function iconOutline() {
  return `<svg viewBox="0 0 24 24"><path d="M5 5h14M5 12h10M5 19h14"/></svg>`;
}

function iconSpark() {
  return `<svg viewBox="0 0 24 24"><path d="M12 3 9.8 9.8 3 12l6.8 2.2L12 21l2.2-6.8L21 12l-6.8-2.2L12 3Z"/></svg>`;
}

function iconClose() {
  return `<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>`;
}

function iconRefresh() {
  return `<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 13.3-6.2L21 2v7h-7l3.3-2.8A6 6 0 0 0 6 12H4Z"/><path d="M20 12a8 8 0 0 1-13.3 6.2L3 22v-7h7l-3.3 2.8A6 6 0 0 0 18 12h2Z"/></svg>`;
}
