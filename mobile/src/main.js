import "katex/dist/katex.min.css";
import { Capacitor, registerPlugin } from "@capacitor/core";
import {
  ArrowUpToLine,
  Bot,
  Check,
  ChevronRight,
  Clock3,
  Cloud,
  createElement,
  FileText,
  GitBranch,
  List,
  NotebookPen,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Sparkles,
  TableOfContents,
  Trash2,
  WandSparkles,
  X,
  Zap
} from "lucide";
import { requestAiCompletion, aiProviders, defaultAiSettings } from "../../shared/ai.js";
import { extractHeadings, markdownDocumentToHtml, escapeHtml } from "../../shared/markdown.js";
import { syncNotesWithGitHub } from "../../shared/github-sync.mjs";
import {
  createEmptyNote,
  noteSyncStates,
  sortNotes,
  titleFromMarkdown
} from "../../shared/notes.js";
import "./styles.css";

const keys = {
  legacyNotes: "marknote.mobile.notes",
  repositoryNotes: "marknote.mobile.repository.notes.v1",
  migrationDone: "marknote.mobile.repository.migrated.v1",
  selectedId: "marknote.mobile.selectedId",
  ai: "marknote.mobile.ai",
  github: "marknote.mobile.github.v1",
  syncBaseline: "marknote.mobile.github.baseline.v1"
};

const SecureStorage = registerPlugin("SecureStorage");
const githubTokenSessionKey = "marknote.github.token.session";
const defaultGitHubSettings = { owner: "", repo: "", branch: "main", remoteFolder: "notes" };
const longNoteThreshold = 6000;
const documentRenderCache = new Map();
const headingRenderCache = new Map();
const pendingDocumentRenders = new Set();
let readerQuickMenuTimer = 0;

function lucideIcon(iconNode, className = "") {
  return createElement(iconNode, {
    width: 20,
    height: 20,
    class: className,
    "aria-hidden": "true"
  }).outerHTML;
}

const NoteRepository = {
  list() {
    migrateLegacyNotes();
    return readNotesFromStorage(keys.repositoryNotes);
  },
  save(note) {
    const notes = readNotesFromStorage(keys.repositoryNotes);
    const nextNotes = sortNotes([
      note,
      ...notes.filter((item) => item.id !== note.id)
    ]);
    localStorage.setItem(keys.repositoryNotes, JSON.stringify(nextNotes));
    return nextNotes;
  },
  delete(id) {
    const notes = readNotesFromStorage(keys.repositoryNotes).filter((note) => note.id !== id);
    localStorage.setItem(keys.repositoryNotes, JSON.stringify(notes));
    return notes;
  }
};

const state = {
  aiSettings: loadJson(keys.ai, defaultAiSettings()),
  notes: NoteRepository.list(),
  selectedId: localStorage.getItem(keys.selectedId) || "",
  mode: "reader",
  panel: "",
  editorDraft: "",
  syncing: false,
  toast: "",
  conflict: null,
  syncMessage: "请先配置 GitHub 私有仓库",
  githubSettings: loadJson(keys.github, defaultGitHubSettings),
  githubTokenConfigured: false,
  searchQuery: "",
  aiPrompt: "",
  aiResult: "",
  aiLoading: false,
  quickMenuOpen: false,
  readerScrollPositions: new Map()
};

const app = document.querySelector("#app");

init();

window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    setMode("list");
    window.requestAnimationFrame(() => app.querySelector(".noteSearchInput")?.focus());
  }
});

window.addEventListener("scroll", () => {
  if (state.mode === "reader" && state.quickMenuOpen) closeReaderQuickMenu();
}, { passive: true });

async function init() {
  document.documentElement.classList.toggle("nativeApp", Capacitor.isNativePlatform());
  render();

  if (!state.notes.length) {
    const note = createMobileNote();
    state.notes = [note];
    state.selectedId = note.id;
    state.editorDraft = note.content;
    saveLocalNotes();
  }

  if (!selectedNote()) {
    state.selectedId = state.notes[0]?.id || "";
  }
  state.editorDraft = selectedNote()?.content || "";
  state.githubTokenConfigured = Boolean(await getSecureGitHubToken().catch(() => ""));
  render();
}

function loadJson(key, fallback) {
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(key) || "{}") };
  } catch {
    return fallback;
  }
}

function readNotesFromStorage(key) {
  try {
    const notes = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(notes) ? sortNotes(notes.map(normalizeLocalNote)) : [];
  } catch {
    return [];
  }
}

function migrateLegacyNotes() {
  if (localStorage.getItem(keys.migrationDone)) return;
  const current = readNotesFromStorage(keys.repositoryNotes);
  if (current.length) {
    localStorage.setItem(keys.migrationDone, "1");
    return;
  }

  const legacy = readNotesFromStorage(keys.legacyNotes);
  if (legacy.length) {
    localStorage.setItem(keys.repositoryNotes, JSON.stringify(legacy));
  }
  localStorage.setItem(keys.migrationDone, "1");
}

function normalizeLocalNote(note) {
  const now = new Date().toISOString();
  return {
    id: note.id || `local-${crypto.randomUUID()}`,
    title: note.title || titleFromMarkdown(note.content || ""),
    content: note.content || "",
    created_at: note.created_at || now,
    updated_at: note.updated_at || now,
    deleted_at: null,
    relativePath: note.relativePath || mobileRelativePath(note),
    lastSyncedAt: note.lastSyncedAt || "",
    syncState: note.syncState || noteSyncStates.pending
  };
}

function createMobileNote() {
  const note = createEmptyNote();
  return { ...note, relativePath: mobileRelativePath(note) };
}

function mobileRelativePath(note) {
  const title = titleFromMarkdown(note?.content || note?.title || "未命名笔记")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48) || "未命名笔记";
  const unique = String(note?.id || crypto.randomUUID()).replace(/^local-/, "").slice(0, 8);
  return `手机笔记/${title}-${unique}.md`;
}

async function getSecureGitHubToken() {
  if (!Capacitor.isNativePlatform()) return sessionStorage.getItem(githubTokenSessionKey) || "";
  const result = await SecureStorage.get();
  return String(result?.value || "");
}

async function setSecureGitHubToken(token) {
  if (!Capacitor.isNativePlatform()) {
    sessionStorage.setItem(githubTokenSessionKey, token);
    return;
  }
  await SecureStorage.set({ value: token });
}

async function removeSecureGitHubToken() {
  if (!Capacitor.isNativePlatform()) {
    sessionStorage.removeItem(githubTokenSessionKey);
    return;
  }
  await SecureStorage.remove();
}

function saveLocalNotes() {
  localStorage.setItem(keys.repositoryNotes, JSON.stringify(sortNotes(state.notes)));
  if (state.selectedId) localStorage.setItem(keys.selectedId, state.selectedId);
}

function selectedNote() {
  return state.notes.find((note) => note.id === state.selectedId) || state.notes[0] || null;
}

function currentWindowScrollTop() {
  return Math.max(0, window.scrollY || document.scrollingElement?.scrollTop || 0);
}

function rememberReaderScrollPosition() {
  const note = selectedNote();
  if (!note || state.mode !== "reader") return;
  state.readerScrollPositions.set(note.id, currentWindowScrollTop());
}

function jumpWindowTo(top) {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, Math.max(0, Number(top) || 0));
  root.style.scrollBehavior = previousBehavior;
}

function restoreReaderScrollPosition(top = state.readerScrollPositions.get(state.selectedId) || 0) {
  const noteId = state.selectedId;
  const restore = () => {
    if (state.mode !== "reader" || state.selectedId !== noteId) return;
    jumpWindowTo(top);
  };

  window.requestAnimationFrame(() => {
    restore();
    window.requestAnimationFrame(restore);
  });
  window.setTimeout(restore, 120);
}

function setMode(mode) {
  const previousMode = state.mode;
  if (previousMode === "reader" && mode !== "reader") rememberReaderScrollPosition();
  closeReaderQuickMenu();
  state.mode = mode;
  state.panel = "";
  if (mode === "editor") {
    state.editorDraft = selectedNote()?.content || "";
  }
  render();
  if (mode === "reader") {
    restoreReaderScrollPosition();
  } else if (previousMode !== mode) {
    jumpWindowTo(0);
  }
}

function toggleHomeMode() {
  if (state.mode === "list" && selectedNote()) {
    setMode("reader");
  } else {
    setMode("list");
  }
}

function selectNote(id) {
  closeReaderQuickMenu();
  state.selectedId = id;
  state.editorDraft = selectedNote()?.content || "";
  state.mode = "reader";
  state.panel = "";
  saveLocalNotes();
  render();
  restoreReaderScrollPosition(0);
}

function createNote() {
  const note = createMobileNote();
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
    syncState: noteSyncStates.pending
  };
  replaceNote(next);
  state.mode = "reader";
  showToast("已保存到本机");
  render();
}

function replaceNote(nextNote) {
  state.notes = NoteRepository.save(nextNote);
  saveLocalNotes();
}

async function deleteSelectedNote() {
  const note = selectedNote();
  if (!note) return;
  if (!window.confirm(`确定删除「${note.title || "未命名笔记"}」吗？`)) return;

  state.notes = NoteRepository.delete(note.id);
  state.selectedId = state.notes.find((item) => !item.deleted_at)?.id || "";
  state.mode = "reader";
  state.panel = "";
  saveLocalNotes();
  render();
}

async function signOut() {
  await removeSecureGitHubToken();
  state.githubTokenConfigured = false;
  state.syncMessage = "GitHub Token 已清除";
  showToast("已断开 GitHub");
  render();
}

async function saveSettings(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.githubSettings = {
    owner: String(form.get("owner") || "").trim(),
    repo: String(form.get("repo") || "").trim(),
    branch: String(form.get("branch") || "main").trim() || "main",
    remoteFolder: String(form.get("remoteFolder") || "notes").trim() || "notes"
  };
  const token = String(form.get("token") || "").trim();
  if (!state.githubSettings.owner || !state.githubSettings.repo) {
    state.syncMessage = "请填写 GitHub 用户名和仓库名";
    render();
    return;
  }
  try {
    if (token) {
      await setSecureGitHubToken(token);
      state.githubTokenConfigured = true;
    }
    if (!state.githubTokenConfigured) throw new Error("请填写 Fine-grained Token");
    localStorage.setItem(keys.github, JSON.stringify(state.githubSettings));
    state.syncMessage = "设置已保存，可以点击立即同步";
    showToast("GitHub 设置已保存");
    render();
  } catch (error) {
    state.syncMessage = error?.message || "无法保存 GitHub 设置";
    render();
  }
}

async function runGitHubSync() {
  if (state.syncing) return;
  if (state.mode === "editor") await saveDraft();
  state.syncing = true;
  state.syncMessage = "正在比较手机和 GitHub 上的笔记…";
  render();

  try {
    const token = await getSecureGitHubToken();
    if (!token) throw new Error("请先在设置中保存 GitHub Token");
    if (!state.githubSettings.owner || !state.githubSettings.repo) throw new Error("请先填写 GitHub 用户名和仓库名");
    const baseline = readSyncBaseline();
    const result = await syncNotesWithGitHub({
      settings: state.githubSettings,
      token,
      baseline,
      localNotes: state.notes
        .filter((note) => !note.deleted_at)
        .map((note) => ({ path: note.relativePath, content: note.content })),
      writeLocal: writeSyncedNote,
      deleteLocal: deleteSyncedNote,
      resolveConflict: requestMobileConflict,
      deviceLabel: "手机"
    });
    localStorage.setItem(keys.syncBaseline, JSON.stringify(result.baseline));
    const syncedAt = new Date().toISOString();
    state.notes = state.notes.map((note) => ({
      ...note,
      lastSyncedAt: syncedAt,
      syncState: noteSyncStates.synced
    }));
    if (!selectedNote()) state.selectedId = state.notes[0]?.id || "";
    state.editorDraft = selectedNote()?.content || "";
    saveLocalNotes();
    state.syncMessage = mobileSyncSummary(result.summary);
    showToast("GitHub 同步完成");
  } catch (error) {
    state.syncMessage = cleanSyncError(error);
    showToast("GitHub 同步失败");
  } finally {
    state.syncing = false;
    render();
  }
}

async function writeSyncedNote(relativePath, content) {
  const current = state.notes.find((note) => note.relativePath === relativePath);
  const now = new Date().toISOString();
  const next = {
    ...(current || {}),
    id: current?.id || `github-${crypto.randomUUID()}`,
    title: titleFromMarkdown(content),
    content,
    relativePath,
    created_at: current?.created_at || now,
    updated_at: now,
    deleted_at: null,
    lastSyncedAt: now,
    syncState: noteSyncStates.synced
  };
  state.notes = NoteRepository.save(next);
  if (!state.selectedId) state.selectedId = next.id;
}

async function deleteSyncedNote(relativePath) {
  const current = state.notes.find((note) => note.relativePath === relativePath);
  if (!current) return;
  state.notes = NoteRepository.delete(current.id);
  if (state.selectedId === current.id) state.selectedId = state.notes[0]?.id || "";
  saveLocalNotes();
}

function readSyncBaseline() {
  try {
    const value = JSON.parse(localStorage.getItem(keys.syncBaseline) || "null");
    return value?.version === 1 ? value : { version: 1, notes: {} };
  } catch {
    return { version: 1, notes: {} };
  }
}

function mobileSyncSummary(summary = {}) {
  const conflicts = Array.isArray(summary.conflicts) ? summary.conflicts.length : 0;
  return `同步完成：上传 ${summary.uploaded || 0}，下载 ${summary.downloaded || 0}，删除 ${
    (summary.deletedLocal || 0) + (summary.deletedRemote || 0)
  }。${conflicts ? `已保留 ${conflicts} 个冲突版本。` : "没有冲突。"}`;
}

function cleanSyncError(error) {
  return String(error?.message || error || "同步失败").replace(/^Error:\s*/, "");
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
  const pending = state.conflict;
  state.conflict = null;
  render();
  pending.resolve(choice);
}

function requestMobileConflict(conflict) {
  return new Promise((resolve) => {
    state.conflict = { ...conflict, resolve };
    render();
  });
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
  if (state.syncing) return "同步中";
  if (!note) return "";
  if (note.syncState === noteSyncStates.pending) return "待同步";
  return note.lastSyncedAt ? "已同步" : "本机";
}

function noteRenderKey(note) {
  return `${note?.id || "none"}:${note?.updated_at || ""}:${note?.content?.length || 0}`;
}

function rememberRenderedDocument(key, html) {
  documentRenderCache.set(key, html);
  while (documentRenderCache.size > 8) {
    documentRenderCache.delete(documentRenderCache.keys().next().value);
  }
}

function headingsForNote(note) {
  if (!note) return [];
  const key = noteRenderKey(note);
  if (!headingRenderCache.has(key)) {
    headingRenderCache.set(key, extractHeadings(note.content || ""));
    while (headingRenderCache.size > 8) {
      headingRenderCache.delete(headingRenderCache.keys().next().value);
    }
  }
  return headingRenderCache.get(key);
}

function documentViewState(note) {
  const key = noteRenderKey(note);
  const cached = documentRenderCache.get(key);
  if (cached) return { html: cached, key, pending: false };

  if ((note?.content?.length || 0) < longNoteThreshold) {
    const html = markdownDocumentToHtml(note?.content || "");
    rememberRenderedDocument(key, html);
    return { html, key, pending: false };
  }

  scheduleLongDocumentRender(note, key);
  return {
    html: `<div class="documentLoading" role="status"><i></i><strong>正在整理长笔记</strong><span>先显示阅读界面，再加载正文内容</span></div>`,
    key,
    pending: true
  };
}

function scheduleLongDocumentRender(note, key) {
  if (pendingDocumentRenders.has(key)) return;
  pendingDocumentRenders.add(key);

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const current = selectedNote();
      if (!current || noteRenderKey(current) !== key || state.mode !== "reader") {
        pendingDocumentRenders.delete(key);
        return;
      }

      const html = markdownDocumentToHtml(note.content || "");
      rememberRenderedDocument(key, html);
      pendingDocumentRenders.delete(key);

      const article = app.querySelector(".document");
      if (!article || article.dataset.renderKey !== key) return;
      article.innerHTML = html;
      article.classList.remove("documentPending");
      article.setAttribute("aria-busy", "false");
    });
  });
}

function render() {
  const note = selectedNote();
  const headings = headingsForNote(note);

  app.innerHTML = `
    <div class="mobileShell">
      <header class="topBar">
        <button class="brandButton" data-action="home" type="button" aria-label="${state.mode === "list" ? "返回当前笔记" : "打开笔记列表"}">
          <span class="brandMark">${lucideIcon(NotebookPen)}</span>
          <span class="brandCopy">
            <strong>MarkNote</strong>
            <small>quietly yours</small>
          </span>
        </button>
        <div class="topActions">
          <span class="syncPill ${note?.syncState || ""}"><i></i>${syncLabel(note)}</span>
          <button class="iconButton" data-action="refresh" type="button" aria-label="同步">${iconRefresh()}</button>
          <button class="iconButton" data-panel="settings" type="button" aria-label="设置">${iconSettings()}</button>
        </div>
      </header>

      ${state.conflict ? conflictBanner() : ""}
      ${workspaceView(note, headings)}
      ${state.mode === "reader" && note && !state.panel ? readerQuickMenuView() : ""}
      ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ""}
      ${state.panel ? panelView(note, headings) : ""}
    </div>
  `;

  bindEvents();
}

function workspaceView(note, headings) {
  if (state.mode === "editor") return editorView(note);
  if (state.mode === "list") return listView();
  return readerView(note, headings);
}

function listView() {
  const visibleNotes = filteredNotes();
  const totalCharacters = visibleNotes.reduce((sum, note) => sum + note.content.length, 0);
  return `
    <main class="noteListView">
      <section class="libraryHero">
        <div class="heroEyebrow"><span></span>${greetingLabel()}</div>
        <h1>把散乱的想法，<br />收进一页纸里。</h1>
        <p>${visibleNotes.length} 篇笔记 · ${formatCharacterCount(totalCharacters)} 字符</p>
        <button class="heroNewButton" data-action="new" type="button">
          ${iconPlus()}<span>写一篇新笔记</span>${lucideIcon(ChevronRight)}
        </button>
      </section>

      <label class="mobileSearch">
        ${lucideIcon(Search)}
        <input class="noteSearchInput" type="search" value="${escapeHtml(state.searchQuery)}" placeholder="搜索标题或正文" autocomplete="off" />
      </label>

      <div class="sectionHeader">
        <div>
          <span class="sectionKicker">LIBRARY</span>
          <h2>${state.searchQuery ? "搜索结果" : "最近记录"}</h2>
        </div>
        <button class="roundButton" data-action="new" type="button" aria-label="新建笔记">${iconPlus()}</button>
      </div>
      <div class="noteList">
        ${visibleNotes.length
          ? visibleNotes.map((note, index) => noteListItem(note, index)).join("")
          : emptyLibraryView()}
      </div>
    </main>
  `;
}

function filteredNotes() {
  const query = state.searchQuery.trim().toLowerCase();
  return state.notes.filter((note) => {
    if (note.deleted_at) return false;
    if (!query) return true;
    return `${note.title} ${note.content}`.toLowerCase().includes(query);
  });
}

function noteListItem(note, index = 0) {
  const preview = note.content.replace(/[#>*_`\-[\]()]/g, " ").replace(/\s+/g, " ").trim().slice(0, 92);
  const tone = noteTone(note);
  return `
    <button class="noteRow ${note.id === state.selectedId ? "active" : ""}" style="--note-index:${index}; --note-tone:${tone}" data-note-id="${note.id}" type="button">
      <span class="noteGlyph">${lucideIcon(FileText)}</span>
      <span class="noteRowContent">
        <strong>${escapeHtml(note.title)}</strong>
        <span>${escapeHtml(preview || "这还是一页安静的空白。")}</span>
        <small><span>${formatDate(note.updated_at)}</span><i></i><span>${readingTime(note)} 分钟阅读</span></small>
      </span>
      <span class="noteRowAside">
        <span class="miniSync ${note.syncState || ""}">${syncLabel(note)}</span>
        ${lucideIcon(ChevronRight)}
      </span>
    </button>
  `;
}

function readerView(note, headings) {
  if (!note) return listView();
  const documentState = documentViewState(note);
  const isLongDocument = note.content.length >= longNoteThreshold;
  return `
    <main class="readerView">
      <section class="readerHeader">
        <button class="backButton" data-action="list" type="button">${iconList()}<span>所有笔记</span></button>
        <div class="readerActions">
          <button class="iconButton paperButton" data-panel="outline" type="button" aria-label="目录">${iconOutline()}</button>
          <button class="primaryButton compact" data-action="edit" type="button">${iconEdit()}<span>编辑</span></button>
        </div>
      </section>
      <section class="documentMeta">
        <span class="metaLabel">CURRENT NOTE</span>
        <div>
          <span>${lucideIcon(Clock3)}${formatDate(note.updated_at)}</span>
          <span>${lucideIcon(FileText)}${readingTime(note)} 分钟阅读</span>
        </div>
      </section>
      <article class="document ${isLongDocument ? "longDocument" : ""} ${documentState.pending ? "documentPending" : ""}" data-render-key="${escapeHtml(documentState.key)}" aria-busy="${documentState.pending}">
        ${documentState.html}
      </article>
      ${headings.length ? "" : `<p class="emptyHint">${lucideIcon(TableOfContents)}用 #、## 或 ### 写标题后，这里会生成目录。</p>`}
    </main>
  `;
}

function readerQuickMenuView() {
  return `
    <nav class="readerQuickMenu ${state.quickMenuOpen ? "isVisible" : ""}" aria-label="阅读快捷菜单" aria-hidden="${state.quickMenuOpen ? "false" : "true"}" ${state.quickMenuOpen ? "" : "inert"}>
      <button data-action="list" type="button">${iconList()}<span>笔记</span></button>
      <button data-panel="outline" type="button">${iconOutline()}<span>目录</span></button>
      <button class="readerTopButton" data-reader-action="top" type="button">${iconTop()}<span>顶部</span></button>
      <button class="readerAiButton" data-panel="ai" type="button">${iconSpark()}<span>AI</span></button>
      <button data-action="edit" type="button">${iconEdit()}<span>编辑</span></button>
    </nav>
  `;
}

function editorView(note) {
  return `
    <main class="editorView">
      <div class="editBar">
        <button class="backButton" data-action="cancelEdit" type="button">${lucideIcon(X)}<span>取消</span></button>
        <div class="editTitle">
          <small>正在编辑</small>
          <strong>${escapeHtml(note?.title || "未命名笔记")}</strong>
        </div>
        <button class="saveButton" data-action="save" type="button">${lucideIcon(Save)}<span>保存</span></button>
      </div>
      <div class="editorPaper">
        <div class="editorLineNumbers" aria-hidden="true">01<br />02<br />03<br />04<br />05<br />06<br />07<br />08</div>
        <textarea class="mobileEditor" spellcheck="false" aria-label="Markdown 编辑区" placeholder="# 从一个标题开始…">${escapeHtml(state.editorDraft)}</textarea>
      </div>
      <div class="editorHint"><span>${lucideIcon(Zap)}支持 Markdown</span><span>${state.editorDraft.length} 个字符</span></div>
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
    <div class="sheetBackdrop">
      <aside class="bottomSheet" role="dialog" aria-label="${title}">
        <div class="sheetHandle" aria-hidden="true"></div>
        <header class="sheetHeader">
          <div>
            <span>${state.panel === "ai" ? "MAKE IT CLEARER" : state.panel === "outline" ? "ON THIS PAGE" : "YOUR SPACE"}</span>
            <strong>${title}</strong>
          </div>
          <button class="iconButton" data-action="closePanel" type="button" aria-label="关闭">${iconClose()}</button>
        </header>
        ${state.panel === "settings" ? settingsPanel(note) : ""}
        ${state.panel === "outline" ? outlinePanel(headings) : ""}
        ${state.panel === "ai" ? aiPanel(note) : ""}
      </aside>
    </div>
  `;
}

function settingsPanel(note) {
  return `
    ${settingsForm()}
    <form class="stackForm" data-form="aiSettings">
      <div class="formTitle"><span>${lucideIcon(Bot)}</span><div><h2>AI 助手</h2><p>选择模型与服务地址</p></div></div>
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
      <button class="primaryButton fullWidth" type="submit">${lucideIcon(Check)}保存 AI 设置</button>
    </form>
    ${note ? `<section class="dangerZone"><div><strong>删除当前笔记</strong><span>这个操作无法撤销</span></div><button class="dangerIconButton" data-action="delete" type="button" aria-label="删除当前笔记">${lucideIcon(Trash2)}</button></section>` : ""}
  `;
}

function settingsForm() {
  const github = state.githubSettings;
  return `
    <form class="stackForm" data-form="settings">
      <div class="formTitle"><span>${lucideIcon(Cloud)}</span><div><h2>GitHub 同步</h2><p>让手机与电脑保持一致</p></div></div>
      <p class="formHint">Android 会使用系统安全存储；浏览器调试时 Token 仅保留在当前标签会话。发生冲突时会让你选择保留哪一版。</p>
      <label>
        <span>GitHub 用户名</span>
        <input name="owner" value="${escapeHtml(github.owner)}" autocomplete="username" placeholder="octocat" />
      </label>
      <label>
        <span>仓库名</span>
        <input name="repo" value="${escapeHtml(github.repo)}" autocomplete="off" placeholder="marknote-notes" />
      </label>
      <label>
        <span>分支</span>
        <input name="branch" value="${escapeHtml(github.branch || "main")}" autocomplete="off" />
      </label>
      <label>
        <span>远端文件夹</span>
        <input name="remoteFolder" value="${escapeHtml(github.remoteFolder || "notes")}" autocomplete="off" />
      </label>
      <label>
        <span>Fine-grained Token</span>
        <input name="token" type="password" value="" autocomplete="new-password" placeholder="${state.githubTokenConfigured ? "已安全保存；留空不修改" : "github_pat_…"}" />
      </label>
      <button class="primaryButton fullWidth" type="submit">${lucideIcon(GitBranch)}保存同步设置</button>
      ${state.githubTokenConfigured ? `<button class="ghostButton" data-action="signOut" type="button">清除 GitHub Token</button>` : ""}
      ${state.syncMessage ? `<p class="syncMessage"><i></i>${escapeHtml(state.syncMessage)}</p>` : ""}
    </form>
  `;
}

function outlinePanel(headings) {
  if (!headings.length) return `<div class="panelEmpty">${lucideIcon(TableOfContents)}<strong>还没有目录</strong><p>在笔记里加入 # 标题，目录会自动出现。</p></div>`;
  return `
    <div class="outlineList">
      ${headings.map((heading, index) => `
        <button class="outlineItem level${heading.level}" style="--outline-index:${index}" data-heading-id="${heading.id}" type="button">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${escapeHtml(heading.text)}</strong>
          ${lucideIcon(ChevronRight)}
        </button>
      `).join("")}
    </div>
  `;
}

function aiPanel(note) {
  return `
    <div class="aiIntro">
      <span>${lucideIcon(Sparkles)}</span>
      <div><strong>和这篇笔记一起思考</strong><p>不会修改原文，确认后再放入编辑器。</p></div>
    </div>
    <div class="aiQuickActions">
      <button data-ai-action="summary" type="button"><span>${lucideIcon(FileText)}</span><strong>总结</strong><small>提炼重点</small></button>
      <button data-ai-action="polish" type="button"><span>${lucideIcon(WandSparkles)}</span><strong>润色</strong><small>清晰表达</small></button>
      <button data-ai-action="continue" type="button"><span>${lucideIcon(Zap)}</span><strong>续写</strong><small>延续思路</small></button>
    </div>
    <label class="aiComposer">
      <span>还可以直接告诉 AI</span>
      <textarea rows="4" class="aiPrompt" placeholder="例如：把这篇笔记整理成三个行动项">${escapeHtml(state.aiPrompt)}</textarea>
    </label>
    <button class="primaryButton fullWidth aiSubmit" data-ai-action="custom" type="button">${lucideIcon(Sparkles)}开始处理</button>
    <div class="aiResult">
      ${state.aiLoading ? `<div class="aiThinking"><i></i><i></i><i></i><span>AI 正在整理思路</span></div>` : ""}
      ${state.aiResult ? `<pre>${escapeHtml(state.aiResult)}</pre><button class="primaryButton fullWidth" data-action="applyAi" type="button">${lucideIcon(Check)}放到编辑器</button>` : ""}
      ${!note ? `<p>先选择一篇笔记，再使用 AI。</p>` : ""}
    </div>
  `;
}

function conflictBanner() {
  const conflict = state.conflict || {};
  const deletingLocal = conflict.reason === "local-deleted-remote-changed";
  const deletingRemote = conflict.reason === "remote-deleted-local-changed";
  const description = deletingLocal
    ? "手机删除了这篇笔记，但 GitHub 版本又被修改。"
    : deletingRemote
      ? "GitHub 删除了这篇笔记，但手机版本又被修改。"
      : "手机和 GitHub 都修改了这篇笔记。";
  const localLabel = deletingLocal ? "保留手机删除" : deletingRemote ? "恢复手机版" : "保留手机版";
  const remoteLabel = deletingLocal ? "恢复 GitHub 版" : deletingRemote ? "保留 GitHub 删除" : "保留 GitHub 版";
  return `
    <div class="conflictBanner">
      <strong>发现同步冲突</strong>
      <span>${escapeHtml(conflict.path || "一篇笔记")}</span>
      <span>${description}</span>
      <button data-conflict="local" type="button">${localLabel}</button>
      <button data-conflict="remote" type="button">${remoteLabel}</button>
      <button data-conflict="both" type="button">两个都保留</button>
    </div>
  `;
}

function scheduleReaderQuickMenuClose() {
  window.clearTimeout(readerQuickMenuTimer);
  readerQuickMenuTimer = window.setTimeout(closeReaderQuickMenu, 3800);
}

function setReaderQuickMenuVisible(visible) {
  state.quickMenuOpen = Boolean(visible);
  const menu = app.querySelector(".readerQuickMenu");
  if (!menu) {
    state.quickMenuOpen = false;
    window.clearTimeout(readerQuickMenuTimer);
    return;
  }

  menu.classList.toggle("isVisible", state.quickMenuOpen);
  menu.setAttribute("aria-hidden", state.quickMenuOpen ? "false" : "true");
  menu.inert = !state.quickMenuOpen;
  if (state.quickMenuOpen) {
    scheduleReaderQuickMenuClose();
  } else {
    window.clearTimeout(readerQuickMenuTimer);
  }
}

function closeReaderQuickMenu() {
  setReaderQuickMenuVisible(false);
}

function toggleReaderQuickMenu() {
  setReaderQuickMenuVisible(!state.quickMenuOpen);
}

function scrollReaderToTop() {
  closeReaderQuickMenu();
  state.readerScrollPositions.set(state.selectedId, 0);
  const behavior = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  (document.scrollingElement || document.documentElement).scrollTo({ top: 0, behavior });
}

function bindReaderQuickMenuEvents() {
  const reader = app.querySelector(".document");
  const menu = app.querySelector(".readerQuickMenu");
  if (!reader || !menu) return;

  let tapStart = null;
  const ignoredTarget = "a, button, input, textarea, select, summary, label, [contenteditable], [role='button'], pre, code, table, .katex, .katex-display, iframe, img, video, audio";

  reader.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0 || event.target.closest(ignoredTarget)) {
      tapStart = null;
      return;
    }
    tapStart = {
      x: event.clientX,
      y: event.clientY,
      scrollTop: currentWindowScrollTop(),
      time: event.timeStamp
    };
  }, { passive: true });

  reader.addEventListener("pointercancel", () => {
    tapStart = null;
  }, { passive: true });

  reader.addEventListener("pointerup", (event) => {
    if (!tapStart || !event.isPrimary) return;
    const start = tapStart;
    tapStart = null;
    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    const scrolled = Math.abs(currentWindowScrollTop() - start.scrollTop);
    const held = event.timeStamp - start.time;
    const hasSelection = Boolean(window.getSelection()?.toString().trim());
    if (moved > 12 || scrolled > 4 || held > 450 || hasSelection || event.target.closest(ignoredTarget)) return;
    toggleReaderQuickMenu();
  }, { passive: true });

  menu.addEventListener("focusin", () => window.clearTimeout(readerQuickMenuTimer));
  menu.addEventListener("focusout", () => {
    if (state.quickMenuOpen) scheduleReaderQuickMenuClose();
  });
}

function bindEvents() {
  app.querySelectorAll("[data-action]").forEach((node) => {
    node.addEventListener("click", (event) => {
      const action = event.currentTarget.dataset.action;
      if (action === "home") toggleHomeMode();
      if (action === "list") setMode("list");
      if (action === "new") createNote();
      if (action === "edit") setMode("editor");
      if (action === "cancelEdit") setMode("reader");
      if (action === "save") saveDraft();
      if (action === "delete") deleteSelectedNote();
      if (action === "closePanel") {
        closeReaderQuickMenu();
        state.panel = "";
        render();
      }
      if (action === "signOut") signOut();
      if (action === "refresh") {
        runGitHubSync();
      }
      if (action === "applyAi") applyAiResult();
    });
  });

  app.querySelectorAll("[data-panel]").forEach((node) => {
    node.addEventListener("click", (event) => {
      closeReaderQuickMenu();
      state.panel = event.currentTarget.dataset.panel;
      render();
    });
  });

  app.querySelectorAll("[data-reader-action]").forEach((node) => {
    node.addEventListener("click", () => {
      if (node.dataset.readerAction === "top") scrollReaderToTop();
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

  const noteSearchInput = app.querySelector(".noteSearchInput");
  if (noteSearchInput) {
    noteSearchInput.addEventListener("input", (event) => {
      const caret = event.target.selectionStart;
      state.searchQuery = event.target.value;
      render();
      const nextInput = app.querySelector(".noteSearchInput");
      nextInput?.focus();
      if (Number.isInteger(caret)) nextInput?.setSelectionRange(caret, caret);
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

  bindReaderQuickMenuEvents();
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

function greetingLabel() {
  const hour = new Date().getHours();
  if (hour < 6) return "夜深了，慢慢写";
  if (hour < 12) return "早上好，今天想记什么";
  if (hour < 18) return "下午好，留住这一刻";
  return "晚上好，把一天收好";
}

function formatCharacterCount(count) {
  if (count < 1000) return String(count);
  return `${(count / 1000).toFixed(count < 10000 ? 1 : 0)}k`;
}

function readingTime(note) {
  const count = String(note?.content || "").replace(/\s+/g, "").length;
  return Math.max(1, Math.ceil(count / 500));
}

function noteTone(note) {
  const seed = String(note?.id || note?.title || "marknote");
  const total = [...seed].reduce((sum, character) => sum + character.codePointAt(0), 0);
  return [222, 258, 18, 165][total % 4];
}

function emptyLibraryView() {
  return `
    <div class="emptyLibrary">
      <span>${lucideIcon(Search)}</span>
      <strong>没有找到相符的笔记</strong>
      <p>换一个关键词，或者开始写一篇新的。</p>
      <button class="ghostButton" data-action="new" type="button">${iconPlus()}新建笔记</button>
    </div>
  `;
}

function iconSettings() {
  return lucideIcon(Settings);
}

function iconPlus() {
  return lucideIcon(Plus);
}

function iconList() {
  return lucideIcon(List);
}

function iconEdit() {
  return lucideIcon(NotebookPen);
}

function iconOutline() {
  return lucideIcon(TableOfContents);
}

function iconTop() {
  return lucideIcon(ArrowUpToLine);
}

function iconSpark() {
  return lucideIcon(Sparkles);
}

function iconClose() {
  return lucideIcon(X);
}

function iconRefresh() {
  return lucideIcon(RefreshCw, state.syncing ? "spinning" : "");
}
