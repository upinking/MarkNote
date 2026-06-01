const starterMarkdown = "";

const translations = {
  zh: {
    new: "新建",
    open: "打开",
    save: "保存",
    saveAs: "另存为",
    exportPdf: "导出 PDF",
    showInFolder: "在文件夹中显示",
    deleteFile: "删除文件",
    closeHelp: "关闭说明",
    viewWysiwyg: "默认",
    viewEdit: "编辑",
    viewPreview: "预览",
    viewReading: "阅读",
    currentFileTitle: "当前文件和最近文件",
    recentFiles: "最近打开",
    noRecentFiles: "还没有最近文件",
    fileMissing: "文件无法打开，已从最近列表移除",
    currentFile: "当前文件",
    rename: "重命名",
    renameTitle: "重命名文件",
    renameHint: "新文件名",
    renameConfirm: "重命名",
    renameSuccess: "已重命名",
    renameUnavailable: "请先保存为本地文件，再重命名",
    renameExists: "同名文件已存在",
    renameInvalid: "请输入有效文件名",
    settings: "设置",
    outline: "目录",
    language: "界面语言",
    theme: "主题",
    themeLight: "晨光",
    themeDark: "夜航",
    themePaper: "纸页",
    themeForest: "松林",
    themeOcean: "海盐",
    themeRose: "蔷薇",
    lineWrap: "自动换行",
    taskBracketCompat: "自动转换待办框",
    tableBlock: "表格",
    exitTableEdit: "退出",
    help: "使用说明",
    ai: "AI",
    aiTitle: "打开 AI 助手",
    aiAgent: "AI Agent",
    aiCloseTitle: "关闭 AI",
    aiSettings: "AI 设置",
    aiProvider: "服务",
    aiModel: "模型",
    aiBaseUrl: "Base URL",
    aiApiKey: "API Key",
    aiQuickSummary: "总结",
    aiQuickPolish: "润色",
    aiQuickOrganize: "整理结构",
    aiQuickContinue: "续写",
    copySelection: "复制",
    cutSelection: "剪切",
    paste: "粘贴",
    bold: "加粗",
    italic: "斜体",
    inlineCode: "行内代码",
    aiSelection: "AI 处理",
    aiPolishSelection: "AI 润色所选内容",
    aiSummarySelection: "AI 总结所选内容",
    aiSearchSelection: "AI 搜索所选内容",
    aiPromptPolishSelection: "请只润色下面选中的文字，让表达更清晰，但保留原意：",
    aiPromptSummarySelection: "请只总结下面选中的文字，提炼重点：",
    aiPromptSearchSelection: "请围绕下面选中的文字进行 AI 搜索：解释相关概念、补充背景信息，并列出可能值得继续查找的关键词：",
    aiPlaceholder: "让 AI 帮你总结、润色或整理这篇笔记",
    aiSend: "发送",
    aiThinking: "AI 正在思考...",
    aiMissingKey: "请先在设置里填写 API Key。",
    aiError: "AI 请求失败",
    aiDraftReady: "已生成修改草案",
    aiApplyDraft: "应用修改",
    aiDiscardDraft: "放弃修改",
    aiCopy: "复制结果",
    aiCopied: "已复制",
    aiApplied: "已应用 AI 修改",
    aiRestartRequired: "AI 功能已经更新，但当前应用主进程还是旧版本。请完全退出 MarkNote 后重新打开新版应用。",
    aiWelcome: "我可以帮你总结、润色、整理结构，或生成一份可预览后应用的修改草案。",
    aiPromptSummary: "请总结这篇笔记，提炼重点和待办。",
    aiPromptPolish: "请润色这篇笔记，让表达更清晰，但保留原意。",
    aiPromptOrganize: "请整理这篇笔记的结构，补充合适标题和层级，并返回一份完整 Markdown 草案。",
    aiPromptContinue: "请根据当前内容继续往下写，保持原有风格，并返回一份完整 Markdown 草案。",
    newTitle: "新建笔记",
    openTitle: "打开 Markdown 文件",
    saveTitle: "保存 Markdown 文件",
    closeHelpTitle: "关闭说明并回到原笔记",
    helpTitle: "打开 README 使用说明",
    viewModeTitle: "切换视图模式",
    themeTitle: "切换主题",
    settingsTitle: "打开设置",
    edited: "已修改",
    headings: "个标题",
    noHeading: "未选择标题",
    emptyOutline: "输入 #、## 或 ### 标题后，这里会自动生成目录。",
    lines: "行",
    words: "词",
    characters: "字符",
    untitled: "未命名.md",
    untitledHeading: "未命名笔记",
    startWriting: "从这里开始写。",
    unsavedTitle: "有未保存的修改",
    unsavedMessage: "当前笔记还没有保存。",
    unsavedDetail: "要先保存修改再继续吗？",
    saveChanges: "保存",
    discardChanges: "不保存",
    cancel: "取消",
    saveSuccess: "已保存",
    saveAsSuccess: "已另存为",
    exportSuccess: "PDF 已导出",
    deleteSuccess: "文件已移到废纸篓",
    draftSaved: "草稿已保护",
    saving: "正在保存...",
    saved: "已保存",
    dirtyStatus: "有修改",
    exportPdfUnavailable: "桌面版支持导出 PDF",
    showUnavailable: "请先保存为本地文件",
    deleteUnavailable: "请先保存为本地文件",
    deleteTitle: "删除文件",
    deleteMessage: "要把当前文件移到废纸篓吗？",
    deleteDetail: "这个操作不会清空编辑器内容，但文件会从原位置移到废纸篓。",
    deleteConfirm: "移到废纸篓",
    restoreDraftTitle: "发现未恢复的草稿",
    restoreDraftMessage: "上次编辑可能没有正常保存。",
    restoreDraftDetail: "要恢复这份自动保存的草稿吗？",
    restoreDraft: "恢复草稿",
    discardDraft: "丢弃草稿"
  },
  en: {
    new: "New",
    open: "Open",
    save: "Save",
    saveAs: "Save as",
    exportPdf: "Export PDF",
    showInFolder: "Show in folder",
    deleteFile: "Delete file",
    closeHelp: "Close guide",
    viewWysiwyg: "Default",
    viewEdit: "Edit",
    viewPreview: "Preview",
    viewReading: "Read",
    currentFileTitle: "Current file and recent files",
    recentFiles: "Recent files",
    noRecentFiles: "No recent files yet",
    fileMissing: "File could not be opened and was removed from recents",
    currentFile: "Current file",
    rename: "Rename",
    renameTitle: "Rename file",
    renameHint: "New file name",
    renameConfirm: "Rename",
    renameSuccess: "Renamed",
    renameUnavailable: "Save this note as a local file before renaming",
    renameExists: "A file with that name already exists",
    renameInvalid: "Enter a valid file name",
    settings: "Settings",
    outline: "Outline",
    language: "Language",
    theme: "Theme",
    themeLight: "Daylight",
    themeDark: "Night",
    themePaper: "Paper",
    themeForest: "Forest",
    themeOcean: "Ocean",
    themeRose: "Rose",
    lineWrap: "Line wrap",
    taskBracketCompat: "Auto-convert task boxes",
    tableBlock: "Table",
    exitTableEdit: "Exit",
    help: "User guide",
    ai: "AI",
    aiTitle: "Open AI assistant",
    aiAgent: "AI Agent",
    aiCloseTitle: "Close AI",
    aiSettings: "AI settings",
    aiProvider: "Provider",
    aiModel: "Model",
    aiBaseUrl: "Base URL",
    aiApiKey: "API Key",
    aiQuickSummary: "Summarize",
    aiQuickPolish: "Polish",
    aiQuickOrganize: "Organize",
    aiQuickContinue: "Continue",
    copySelection: "Copy",
    cutSelection: "Cut",
    paste: "Paste",
    bold: "Bold",
    italic: "Italic",
    inlineCode: "Inline code",
    aiSelection: "AI selection",
    aiPolishSelection: "AI polish selection",
    aiSummarySelection: "AI summarize selection",
    aiSearchSelection: "AI search selection",
    aiPromptPolishSelection: "Polish only the selected text below while preserving its meaning:",
    aiPromptSummarySelection: "Summarize only the selected text below and extract key points:",
    aiPromptSearchSelection: "Search around the selected text below: explain related concepts, add background context, and list keywords worth looking up next:",
    aiPlaceholder: "Ask AI to summarize, polish, or organize this note",
    aiSend: "Send",
    aiThinking: "AI is thinking...",
    aiMissingKey: "Add an API key in Settings first.",
    aiError: "AI request failed",
    aiDraftReady: "Draft changes are ready",
    aiApplyDraft: "Apply changes",
    aiDiscardDraft: "Discard",
    aiCopy: "Copy result",
    aiCopied: "Copied",
    aiApplied: "AI changes applied",
    aiRestartRequired: "The AI feature was updated, but the current app process is still the old version. Fully quit MarkNote and reopen the new app.",
    aiWelcome: "I can summarize, polish, organize, or create a previewable draft for this note.",
    aiPromptSummary: "Summarize this note and extract key points and tasks.",
    aiPromptPolish: "Polish this note so it reads more clearly while preserving the meaning.",
    aiPromptOrganize: "Organize this note with clear headings and hierarchy, and return a complete Markdown draft.",
    aiPromptContinue: "Continue this note in the same style, and return a complete Markdown draft.",
    newTitle: "New note",
    openTitle: "Open Markdown file",
    saveTitle: "Save Markdown file",
    closeHelpTitle: "Close guide and return to the previous note",
    helpTitle: "Open README guide",
    viewModeTitle: "Cycle view mode",
    themeTitle: "Cycle theme",
    settingsTitle: "Open settings",
    edited: "edited",
    headings: "headings",
    noHeading: "No heading selected",
    emptyOutline: "Add #, ##, or ### headings to build an outline.",
    lines: "lines",
    words: "words",
    characters: "characters",
    untitled: "Untitled.md",
    untitledHeading: "Untitled Note",
    startWriting: "Start writing here.",
    unsavedTitle: "Unsaved changes",
    unsavedMessage: "This note has unsaved changes.",
    unsavedDetail: "Save your changes before continuing?",
    saveChanges: "Save",
    discardChanges: "Don't Save",
    cancel: "Cancel",
    saveSuccess: "Saved",
    saveAsSuccess: "Saved as",
    exportSuccess: "PDF exported",
    deleteSuccess: "File moved to Trash",
    draftSaved: "Draft protected",
    saving: "Saving...",
    saved: "Saved",
    dirtyStatus: "Unsaved changes",
    exportPdfUnavailable: "PDF export is available in the desktop app",
    showUnavailable: "Save this note as a local file first",
    deleteUnavailable: "Save this note as a local file first",
    deleteTitle: "Delete file",
    deleteMessage: "Move the current file to Trash?",
    deleteDetail: "The editor content will stay open, but the file will be moved from its current location to Trash.",
    deleteConfirm: "Move to Trash",
    restoreDraftTitle: "Recover draft",
    restoreDraftMessage: "Your last edit may not have been saved.",
    restoreDraftDetail: "Restore the automatically saved draft?",
    restoreDraft: "Restore draft",
    discardDraft: "Discard draft"
  },
  ja: {
    new: "新規",
    open: "開く",
    save: "保存",
    saveAs: "名前を付けて保存",
    exportPdf: "PDFを書き出す",
    showInFolder: "フォルダで表示",
    deleteFile: "ファイルを削除",
    closeHelp: "ガイドを閉じる",
    viewWysiwyg: "デフォルト",
    viewEdit: "編集",
    viewPreview: "プレビュー",
    viewReading: "閲覧",
    currentFileTitle: "現在のファイルと最近のファイル",
    recentFiles: "最近使ったファイル",
    noRecentFiles: "最近使ったファイルはまだありません",
    fileMissing: "ファイルを開けなかったため、最近使った項目から削除しました",
    currentFile: "現在のファイル",
    rename: "名前を変更",
    renameTitle: "ファイル名を変更",
    renameHint: "新しいファイル名",
    renameConfirm: "変更",
    renameSuccess: "名前を変更しました",
    renameUnavailable: "名前を変更する前にローカルファイルとして保存してください",
    renameExists: "同じ名前のファイルが既に存在します",
    renameInvalid: "有効なファイル名を入力してください",
    settings: "設定",
    outline: "目次",
    language: "表示言語",
    theme: "テーマ",
    themeLight: "昼光",
    themeDark: "夜",
    themePaper: "紙",
    themeForest: "森",
    themeOcean: "海",
    themeRose: "ローズ",
    lineWrap: "自動折り返し",
    taskBracketCompat: "タスク記号を自動変換",
    tableBlock: "表",
    exitTableEdit: "終了",
    help: "使い方",
    ai: "AI",
    aiTitle: "AIアシスタントを開く",
    aiAgent: "AI Agent",
    aiCloseTitle: "AIを閉じる",
    aiSettings: "AI設定",
    aiProvider: "サービス",
    aiModel: "モデル",
    aiBaseUrl: "Base URL",
    aiApiKey: "API Key",
    aiQuickSummary: "要約",
    aiQuickPolish: "推敲",
    aiQuickOrganize: "整理",
    aiQuickContinue: "続きを書く",
    copySelection: "コピー",
    cutSelection: "切り取り",
    paste: "貼り付け",
    bold: "太字",
    italic: "斜体",
    inlineCode: "インラインコード",
    aiSelection: "AIで処理",
    aiPolishSelection: "選択範囲をAIで推敲",
    aiSummarySelection: "選択範囲をAIで要約",
    aiSearchSelection: "選択範囲をAIで検索",
    aiPromptPolishSelection: "以下の選択テキストだけを、意味を保ったまま読みやすく推敲してください:",
    aiPromptSummarySelection: "以下の選択テキストだけを要約し、要点を抽出してください:",
    aiPromptSearchSelection: "以下の選択テキストについてAI検索してください。関連概念を説明し、背景を補足し、次に調べる価値のあるキーワードを挙げてください:",
    aiPlaceholder: "AIにこのノートの要約、推敲、整理を依頼",
    aiSend: "送信",
    aiThinking: "AIが考えています...",
    aiMissingKey: "先に設定でAPI Keyを入力してください。",
    aiError: "AIリクエストに失敗しました",
    aiDraftReady: "変更案を作成しました",
    aiApplyDraft: "変更を適用",
    aiDiscardDraft: "破棄",
    aiCopy: "結果をコピー",
    aiCopied: "コピーしました",
    aiApplied: "AIの変更を適用しました",
    aiRestartRequired: "AI機能は更新されましたが、現在のアプリプロセスは古いバージョンです。MarkNoteを完全に終了してから新しいアプリを開き直してください。",
    aiWelcome: "要約、推敲、構成整理、プレビュー可能な変更案の作成を手伝えます。",
    aiPromptSummary: "このノートを要約し、要点とタスクを抽出してください。",
    aiPromptPolish: "意味を保ったまま、このノートをより読みやすく推敲してください。",
    aiPromptOrganize: "このノートを見出しと階層が分かりやすい構成に整理し、完全なMarkdown草案を返してください。",
    aiPromptContinue: "現在の内容に続けて、同じ文体で続きを書き、完全なMarkdown草案を返してください。",
    newTitle: "新規ノート",
    openTitle: "Markdownファイルを開く",
    saveTitle: "Markdownファイルを保存",
    closeHelpTitle: "ガイドを閉じて前のノートに戻る",
    helpTitle: "READMEガイドを開く",
    viewModeTitle: "表示モードを切り替え",
    themeTitle: "テーマを切り替え",
    settingsTitle: "設定を開く",
    edited: "編集中",
    headings: "個の見出し",
    noHeading: "見出しが選択されていません",
    emptyOutline: "#、##、### の見出しを追加すると目次が作成されます。",
    lines: "行",
    words: "語",
    characters: "文字",
    untitled: "無題.md",
    untitledHeading: "無題のノート",
    startWriting: "ここから書き始めます。",
    unsavedTitle: "未保存の変更",
    unsavedMessage: "このノートには未保存の変更があります。",
    unsavedDetail: "続行する前に変更を保存しますか？",
    saveChanges: "保存",
    discardChanges: "保存しない",
    cancel: "キャンセル",
    saveSuccess: "保存しました",
    saveAsSuccess: "名前を付けて保存しました",
    exportSuccess: "PDFを書き出しました",
    deleteSuccess: "ファイルをゴミ箱に移動しました",
    draftSaved: "下書きを保護しました",
    saving: "保存中...",
    saved: "保存済み",
    dirtyStatus: "未保存の変更",
    exportPdfUnavailable: "PDF書き出しはデスクトップ版で利用できます",
    showUnavailable: "先にローカルファイルとして保存してください",
    deleteUnavailable: "先にローカルファイルとして保存してください",
    deleteTitle: "ファイルを削除",
    deleteMessage: "現在のファイルをゴミ箱に移動しますか？",
    deleteDetail: "エディタの内容は開いたままですが、ファイルは現在の場所からゴミ箱へ移動されます。",
    deleteConfirm: "ゴミ箱へ移動",
    restoreDraftTitle: "下書きを復元",
    restoreDraftMessage: "前回の編集が保存されていない可能性があります。",
    restoreDraftDetail: "自動保存された下書きを復元しますか？",
    restoreDraft: "下書きを復元",
    discardDraft: "下書きを破棄"
  }
};

const preferenceKey = "marknote.preferences.v1";
const recentFilesKey = "marknote.recentFiles.v1";
const draftKey = "marknote.autosavedDraft.v1";
const aiSettingsKey = "marknote.aiSettings.v1";
const platform = window.marknote?.platform || "browser";
const isMac = platform === "darwin" || navigator.platform.toLowerCase().includes("mac");
const themes = ["light", "dark", "paper", "forest", "ocean", "rose"];
const viewModes = ["wysiwyg", "edit", "preview", "reading"];
const languages = ["zh", "en", "ja"];
const aiProviders = ["openai", "deepseek", "mimo"];
const aiProviderLabels = {
  openai: "OpenAI",
  deepseek: "DeepSeek",
  mimo: "MiMo"
};
const aiModelSuggestions = {
  openai: ["gpt-4.1-mini"],
  deepseek: ["deepseek-v4-flash"],
  mimo: ["mimo-v2.5", "mimo-v2.5-pro", "mimo-v2-flash"]
};

const defaultPreferences = {
  theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  viewMode: "wysiwyg",
  wordWrap: false,
  taskBracketCompat: true,
  language: "zh"
};

const defaultAiSettings = {
  provider: "openai",
  models: {
    openai: "gpt-4.1-mini",
    deepseek: "deepseek-v4-flash",
    mimo: "mimo-v2.5"
  },
  baseUrls: {
    openai: "https://api.openai.com/v1",
    deepseek: "https://api.deepseek.com",
    mimo: "https://api.mimo-v2.com/v1"
  },
  apiKeys: {
    openai: "",
    deepseek: "",
    mimo: ""
  }
};

const state = {
  markdown: starterMarkdown,
  savedMarkdown: starterMarkdown,
  filePath: "",
  fileName: translations.zh.untitled,
  headings: [],
  collapsedHeadings: new Set(),
  activeHeadingId: "",
  hybridActiveLine: 0,
  helpSnapshot: null,
  isHelpOpen: false,
  wysiwyg: null,
  syncingFromWysiwyg: false,
  recentOpen: false,
  fileContextOpen: false,
  editorContextOpen: false,
  editorContextHasSelection: false,
  editorContextSelectionText: "",
  editorContextTarget: null,
  saveStatus: "saved",
  recentFiles: loadRecentFiles(),
  preferences: loadPreferences(),
  aiOpen: false,
  aiPreviousViewMode: "",
  aiLoading: false,
  aiMessages: [],
  aiSettings: loadAiSettings(),
  settingsOpen: false,
  syncingPreviewScroll: false,
  previewManualUntil: 0,
  activeHeadingScrollFrame: 0
};

const elements = {
  editor: document.querySelector("#editor"),
  wysiwygEditor: document.querySelector("#wysiwygEditor"),
  preview: document.querySelector("#preview"),
  previewPane: document.querySelector("#previewPane"),
  outlineList: document.querySelector("#outlineList"),
  headingCount: document.querySelector("#headingCount"),
  fileName: document.querySelector("#fileName"),
  fileSwitcher: document.querySelector("#fileSwitcher"),
  currentFileButton: document.querySelector("#currentFileButton"),
  recentPanel: document.querySelector("#recentPanel"),
  recentList: document.querySelector("#recentList"),
  fileContextMenu: document.querySelector("#fileContextMenu"),
  saveAsButton: document.querySelector("#saveAsButton"),
  exportPdfButton: document.querySelector("#exportPdfButton"),
  showFileButton: document.querySelector("#showFileButton"),
  renameFileButton: document.querySelector("#renameFileButton"),
  deleteFileButton: document.querySelector("#deleteFileButton"),
  renameDialog: document.querySelector("#renameDialog"),
  renameForm: document.querySelector("#renameForm"),
  renameInput: document.querySelector("#renameInput"),
  renameCancelButton: document.querySelector("#renameCancelButton"),
  dirtyFlag: document.querySelector("#dirtyFlag"),
  workspace: document.querySelector("#workspace"),
  appShell: document.querySelector(".appShell"),
  lineCount: document.querySelector("#lineCount"),
  wordCount: document.querySelector("#wordCount"),
  charCount: document.querySelector("#charCount"),
  saveStatus: document.querySelector("#saveStatus"),
  currentHeading: document.querySelector("#currentHeading"),
  newButton: document.querySelector("#newButton"),
  openButton: document.querySelector("#openButton"),
  saveButton: document.querySelector("#saveButton"),
  closeHelpButton: document.querySelector("#closeHelpButton"),
  viewModeToggle: document.querySelector("#viewModeToggle"),
  viewModeIcon: document.querySelector("#viewModeIcon"),
  viewModeLabel: document.querySelector("#viewModeLabel"),
  themeToggle: document.querySelector("#themeToggle"),
  themeLabel: document.querySelector("#themeLabel"),
  aiToggle: document.querySelector("#aiToggle"),
  aiPane: document.querySelector("#aiPane"),
  aiCloseButton: document.querySelector("#aiCloseButton"),
  aiMessages: document.querySelector("#aiMessages"),
  aiForm: document.querySelector("#aiForm"),
  aiInput: document.querySelector("#aiInput"),
  aiSendButton: document.querySelector("#aiSendButton"),
  aiProviderSelect: document.querySelector("#aiProviderSelect"),
  aiModelSelect: document.querySelector("#aiModelSelect"),
  aiBaseUrlInput: document.querySelector("#aiBaseUrlInput"),
  aiApiKeyInput: document.querySelector("#aiApiKeyInput"),
  aiModelBadge: document.querySelector("#aiModelBadge"),
  settingsToggle: document.querySelector("#settingsToggle"),
  settingsPanel: document.querySelector("#settingsPanel"),
  languageSelect: document.querySelector("#languageSelect"),
  themeSelect: document.querySelector("#themeSelect"),
  wrapSetting: document.querySelector("#wrapSetting"),
  taskBracketSetting: document.querySelector("#taskBracketSetting"),
  helpButton: document.querySelector("#helpButton"),
  toast: document.querySelector("#toast"),
  browserFileInput: document.querySelector("#browserFileInput"),
  editorContextMenu: document.querySelector("#editorContextMenu")
};

function t(key) {
  return translations[state.preferences.language]?.[key] ?? translations.en[key] ?? key;
}

function loadRecentFiles() {
  try {
    const saved = JSON.parse(localStorage.getItem(recentFilesKey) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((file) => file?.filePath && file?.fileName).slice(0, 8);
  } catch {
    return [];
  }
}

function saveRecentFiles() {
  localStorage.setItem(recentFilesKey, JSON.stringify(state.recentFiles.slice(0, 8)));
}

function rememberRecentFile(file) {
  if (!file?.filePath || !file?.fileName || file.fileName === "README.md") return;

  state.recentFiles = [
    {
      filePath: file.filePath,
      fileName: file.fileName,
      openedAt: Date.now()
    },
    ...state.recentFiles.filter((recent) => recent.filePath !== file.filePath)
  ].slice(0, 8);
  saveRecentFiles();
}

function forgetRecentFile(filePath) {
  state.recentFiles = state.recentFiles.filter((file) => file.filePath !== filePath);
  saveRecentFiles();
  renderRecentFiles();
}

function loadDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey) || "null");
    if (!draft?.markdown || draft.markdown === draft.savedMarkdown) return null;
    return draft;
  } catch {
    return null;
  }
}

function saveDraft() {
  if (state.isHelpOpen || state.markdown === state.savedMarkdown) {
    clearDraft();
    return;
  }

  localStorage.setItem(draftKey, JSON.stringify({
    markdown: state.markdown,
    savedMarkdown: state.savedMarkdown,
    filePath: state.filePath,
    fileName: state.fileName,
    updatedAt: Date.now()
  }));
  state.saveStatus = "draft";
  updateStatus();
}

function clearDraft() {
  localStorage.removeItem(draftKey);
}

function scheduleDraftSave() {
  window.clearTimeout(state.draftTimer);
  state.saveStatus = "dirty";
  updateStatus();
  state.draftTimer = window.setTimeout(saveDraft, 900);
}

async function restoreDraftIfNeeded() {
  const draft = loadDraft();
  if (!draft) return;

  const payload = {
    title: t("restoreDraftTitle"),
    message: t("restoreDraftMessage"),
    detail: t("restoreDraftDetail"),
    buttons: [t("restoreDraft"), t("discardDraft")]
  };

  let choice = "discard";
  if (window.marknote?.confirmDraftRestore) {
    choice = await window.marknote.confirmDraftRestore(payload);
  } else {
    choice = window.confirm(`${payload.message}\n\n${payload.detail}`) ? "restore" : "discard";
  }

  if (choice !== "restore") {
    clearDraft();
    return;
  }

  state.markdown = draft.markdown;
  state.savedMarkdown = draft.savedMarkdown ?? "";
  state.filePath = draft.filePath ?? "";
  state.fileName = draft.fileName || t("untitled");
  state.activeHeadingId = "";
  state.saveStatus = "draft";
  elements.editor.value = state.markdown;
  syncWysiwygSoon();
  render();
  playContentFade();
}

function closeRecentPanel() {
  state.recentOpen = false;
  renderRecentFiles();
}

function toggleRecentPanel() {
  if (!state.recentOpen) {
    state.fileContextOpen = false;
    state.settingsOpen = false;
  }
  state.recentOpen = !state.recentOpen;
  render();
}

function renderFileContextMenu() {
  elements.fileContextMenu.hidden = !state.fileContextOpen;
  elements.saveAsButton.disabled = state.isHelpOpen;
  elements.exportPdfButton.disabled = state.isHelpOpen;
  elements.showFileButton.disabled = !state.filePath || state.isHelpOpen;
  elements.renameFileButton.disabled = !state.filePath || state.isHelpOpen;
  elements.deleteFileButton.disabled = !state.filePath || state.isHelpOpen;
}

function closeFileContextMenu() {
  state.fileContextOpen = false;
  renderFileContextMenu();
}

function openFileContextMenu() {
  state.fileContextOpen = true;
  state.recentOpen = false;
  state.settingsOpen = false;
  render();
}

function editorContainsNode(node) {
  return Boolean(node && (
    elements.editor.contains(node) ||
    elements.wysiwygEditor.contains(node) ||
    elements.previewPane.contains(node)
  ));
}

function closestEditableLine(node) {
  return node?.nodeType === Node.ELEMENT_NODE
    ? node.closest(".hybridSourceLine")
    : node?.parentElement?.closest(".hybridSourceLine");
}

function selectionOffsetsWithin(node, range) {
  const startProbe = range.cloneRange();
  startProbe.selectNodeContents(node);
  startProbe.setEnd(range.startContainer, range.startOffset);

  const endProbe = range.cloneRange();
  endProbe.selectNodeContents(node);
  endProbe.setEnd(range.endContainer, range.endOffset);

  return {
    start: startProbe.toString().length,
    end: endProbe.toString().length
  };
}

function selectedTextareaInfo(target) {
  const textarea = target?.closest?.("textarea") || (document.activeElement?.tagName === "TEXTAREA" ? document.activeElement : null);
  if (!textarea || !(elements.editor.contains(textarea) || elements.wysiwygEditor.contains(textarea))) return null;
  if (textarea.selectionStart === textarea.selectionEnd) return null;

  return {
    type: "textarea",
    element: textarea,
    start: textarea.selectionStart,
    end: textarea.selectionEnd,
    text: textarea.value.slice(textarea.selectionStart, textarea.selectionEnd),
    editable: true
  };
}

function selectedWindowTextInfo() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;
  if (!editorContainsNode(selection.anchorNode) || !editorContainsNode(selection.focusNode)) return null;

  const range = selection.getRangeAt(0);
  const text = selection.toString();
  if (!text.trim()) return null;

  const row = closestEditableLine(range.commonAncestorContainer);
  if (row && row.contains(range.startContainer) && row.contains(range.endContainer)) {
    const offsets = selectionOffsetsWithin(row, range);
    return {
      type: "line",
      element: row,
      lineIndex: Number(row.dataset.line),
      start: offsets.start,
      end: offsets.end,
      text,
      editable: true
    };
  }

  return {
    type: "dom",
    element: range.commonAncestorContainer,
    text,
    editable: false
  };
}

function currentEditorSelectionInfo(target) {
  return selectedTextareaInfo(target) || selectedWindowTextInfo();
}

function closeEditorContextMenu() {
  state.editorContextOpen = false;
  state.editorContextHasSelection = false;
  state.editorContextSelectionText = "";
  state.editorContextTarget = null;
  elements.editorContextMenu.hidden = true;
}

function positionEditorContextMenu(x, y) {
  const menu = elements.editorContextMenu;
  menu.classList.remove("submenuLeft");
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.hidden = false;

  const rect = menu.getBoundingClientRect();
  const nextLeft = Math.min(x, window.innerWidth - rect.width - 8);
  const nextTop = Math.min(y, window.innerHeight - rect.height - 8);
  menu.style.left = `${Math.max(8, nextLeft)}px`;
  menu.style.top = `${Math.max(8, nextTop)}px`;
  menu.classList.toggle("submenuLeft", Math.max(8, nextLeft) + rect.width + 210 > window.innerWidth);
}

function renderEditorContextMenu() {
  const menu = elements.editorContextMenu;
  const hasSelection = state.editorContextHasSelection;
  const canEditSelection = Boolean(state.editorContextTarget?.editable);
  const canPaste = !hasSelection && Boolean(state.editorContextTarget?.editable);

  menu.querySelectorAll("[data-selection-only]").forEach((node) => {
    node.hidden = !hasSelection;
  });
  menu.querySelectorAll("[data-edit-selection-only]").forEach((node) => {
    node.hidden = !hasSelection || !canEditSelection;
  });
  menu.querySelector("[data-editor-action='copy']").hidden = !hasSelection;
  menu.querySelector("[data-editor-action='paste']").hidden = !canPaste;
  menu.querySelectorAll("[data-editor-action='cut'], [data-editor-action='bold'], [data-editor-action='italic'], [data-editor-action='code']").forEach((button) => {
    button.disabled = !canEditSelection;
  });
}

function openEditorContextMenu(event) {
  const selectionInfo = currentEditorSelectionInfo(event.target);
  const targetIsEditableSurface = elements.editor.contains(event.target) || elements.wysiwygEditor.contains(event.target);
  if (!selectionInfo && !targetIsEditableSurface) {
    closeEditorContextMenu();
    return;
  }

  state.editorContextOpen = true;
  state.editorContextHasSelection = Boolean(selectionInfo);
  state.editorContextSelectionText = selectionInfo?.text || "";
  state.editorContextTarget = selectionInfo || {
    type: "target",
    element: event.target,
    editable: targetIsEditableSurface
  };
  state.fileContextOpen = false;
  state.recentOpen = false;
  state.settingsOpen = false;

  renderFileContextMenu();
  renderRecentFiles();
  elements.settingsPanel.hidden = true;
  elements.settingsToggle.classList.remove("active");
  renderEditorContextMenu();
  positionEditorContextMenu(event.clientX, event.clientY);
}

function updateMarkdownTextareaFromContext(textarea) {
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function replaceContextSelection(replacer) {
  const target = state.editorContextTarget;
  if (!target?.editable) return;

  if (target.type === "textarea") {
    const { element, start, end, text } = target;
    const replacement = replacer(text);
    element.value = `${element.value.slice(0, start)}${replacement}${element.value.slice(end)}`;
    element.focus();
    element.setSelectionRange(start, start + replacement.length);
    updateMarkdownTextareaFromContext(element);
    return;
  }

  if (target.type === "line" && state.wysiwyg) {
    const lines = state.wysiwyg.lines;
    const line = lines[target.lineIndex] || "";
    const replacement = replacer(target.text);
    lines[target.lineIndex] = `${line.slice(0, target.start)}${replacement}${line.slice(target.end)}`;
    state.wysiwyg.replaceLines(lines, target.lineIndex, {
      source: "context",
      caretOffset: target.start + replacement.length
    });
  }
}

async function copyContextSelection() {
  const text = state.editorContextSelectionText;
  if (!text) return;
  await navigator.clipboard?.writeText(text);
}

async function cutContextSelection() {
  await copyContextSelection();
  replaceContextSelection(() => "");
}

async function pasteAtEditorContext() {
  const text = await navigator.clipboard?.readText();
  if (!text) return;

  const element = state.editorContextTarget?.element;
  const textarea = element?.closest?.("textarea") || (document.activeElement?.tagName === "TEXTAREA" ? document.activeElement : null);
  if (textarea && editorContainsNode(textarea)) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.value = `${textarea.value.slice(0, start)}${text}${textarea.value.slice(end)}`;
    textarea.focus();
    textarea.setSelectionRange(start + text.length, start + text.length);
    updateMarkdownTextareaFromContext(textarea);
    return;
  }

  const activeLine = elements.wysiwygEditor.querySelector(".hybridSourceLine");
  if (activeLine) {
    activeLine.focus();
    document.execCommand("insertText", false, text);
  }
}

async function sendSelectedTextToAi(action) {
  const selectedText = state.editorContextSelectionText.trim();
  if (!selectedText) return;
  const promptKey = {
    "ai-polish": "aiPromptPolishSelection",
    "ai-summary": "aiPromptSummarySelection",
    "ai-search": "aiPromptSearchSelection"
  }[action] || "aiPromptPolishSelection";
  await openAiPanel();
  sendAiMessage(`${t(promptKey)}\n\n${selectedText}`);
}

async function handleEditorContextAction(action) {
  if (action === "copy") {
    await copyContextSelection();
  } else if (action === "cut") {
    await cutContextSelection();
  } else if (action === "paste") {
    await pasteAtEditorContext();
  } else if (action === "bold") {
    replaceContextSelection((text) => `**${text}**`);
  } else if (action === "italic") {
    replaceContextSelection((text) => `*${text}*`);
  } else if (action === "code") {
    replaceContextSelection((text) => `\`${text}\``);
  } else if (action === "ai-polish" || action === "ai-summary" || action === "ai-search") {
    await sendSelectedTextToAi(action);
  }
  closeEditorContextMenu();
}

function loadPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(preferenceKey) || "{}");
    const migratedTheme = saved.theme || (saved.darkMode ? "dark" : "light");
    const migratedViewMode = saved.viewMode || (saved.readingMode ? "reading" : saved.previewVisible === false ? "edit" : "preview");
    return {
      ...defaultPreferences,
      ...saved,
      theme: themes.includes(migratedTheme) ? migratedTheme : defaultPreferences.theme,
      viewMode: viewModes.includes(migratedViewMode) ? migratedViewMode : defaultPreferences.viewMode,
      taskBracketCompat: saved.taskBracketCompat ?? defaultPreferences.taskBracketCompat,
      language: languages.includes(saved.language) ? saved.language : defaultPreferences.language
    };
  } catch {
    return { ...defaultPreferences };
  }
}

function loadAiSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(aiSettingsKey) || "{}");
    const provider = aiProviders.includes(saved.provider) ? saved.provider : defaultAiSettings.provider;
    return {
      provider,
      models: {
        ...defaultAiSettings.models,
        ...(saved.models || {})
      },
      baseUrls: {
        ...defaultAiSettings.baseUrls,
        ...(saved.baseUrls || {})
      },
      apiKeys: {
        ...defaultAiSettings.apiKeys,
        ...(saved.apiKeys || {})
      }
    };
  } catch {
    return {
      provider: defaultAiSettings.provider,
      models: { ...defaultAiSettings.models },
      baseUrls: { ...defaultAiSettings.baseUrls },
      apiKeys: { ...defaultAiSettings.apiKeys }
    };
  }
}

function savePreferences() {
  const { darkMode, previewVisible, readingMode, ...preferences } = state.preferences;
  localStorage.setItem(preferenceKey, JSON.stringify(preferences));
}

function saveAiSettings() {
  localStorage.setItem(aiSettingsKey, JSON.stringify(state.aiSettings));
}

function currentAiProvider() {
  return aiProviders.includes(state.aiSettings.provider) ? state.aiSettings.provider : defaultAiSettings.provider;
}

function currentAiModel() {
  const provider = currentAiProvider();
  return state.aiSettings.models[provider] || defaultAiSettings.models[provider];
}

function currentAiKey() {
  return state.aiSettings.apiKeys[currentAiProvider()] || "";
}

function currentAiBaseUrl() {
  const provider = currentAiProvider();
  return state.aiSettings.baseUrls?.[provider] || defaultAiSettings.baseUrls[provider];
}

function setAiProvider(provider) {
  state.aiSettings.provider = aiProviders.includes(provider) ? provider : defaultAiSettings.provider;
  saveAiSettings();
  render();
}

function setAiModel(model) {
  const provider = currentAiProvider();
  state.aiSettings.models[provider] = model.trim() || defaultAiSettings.models[provider];
  saveAiSettings();
  renderAiPanel();
}

function setAiKey(apiKey) {
  state.aiSettings.apiKeys[currentAiProvider()] = apiKey.trim();
  saveAiSettings();
  renderAiPanel();
}

function setAiBaseUrl(baseUrl) {
  const provider = currentAiProvider();
  state.aiSettings.baseUrls = {
    ...defaultAiSettings.baseUrls,
    ...(state.aiSettings.baseUrls || {}),
    [provider]: baseUrl.trim() || defaultAiSettings.baseUrls[provider]
  };
  saveAiSettings();
  renderAiPanel();
}

function aiPromptFor(action) {
  const key = {
    summary: "aiPromptSummary",
    polish: "aiPromptPolish",
    organize: "aiPromptOrganize",
    continue: "aiPromptContinue"
  }[action];
  return key ? t(key) : "";
}

function createAiMessage(role, content, extra = {}) {
  return {
    id: `ai-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    ...extra
  };
}

async function openAiPanel() {
  if (!state.aiOpen) {
    state.aiPreviousViewMode = state.preferences.viewMode;
  }

  state.aiOpen = true;
  state.settingsOpen = false;
  state.recentOpen = false;
  state.fileContextOpen = false;
  if (state.aiMessages.length === 0) {
    state.aiMessages.push(createAiMessage("assistant", t("aiWelcome")));
  }

  await setViewMode("wysiwyg");
  render();
  playAiLayoutAnimation(true);
  elements.aiInput?.focus();
}

async function closeAiPanel() {
  if (!state.aiOpen) return;

  const previousViewMode = state.aiPreviousViewMode;
  state.aiOpen = false;
  state.aiPreviousViewMode = "";
  render();
  playAiLayoutAnimation(false);

  if (previousViewMode && previousViewMode !== state.preferences.viewMode) {
    await setViewMode(previousViewMode);
  }
}

async function toggleAiPanel() {
  if (state.aiOpen) {
    await closeAiPanel();
  } else {
    await openAiPanel();
  }
}

function markdownPreviewHtml(markdown) {
  return sanitizeMarkdownHtml(markdownToHtmlWithMath(markdown || ""));
}

function renderAiPanel() {
  if (!elements.aiPane) return;

  elements.aiPane.hidden = !state.aiOpen;
  elements.aiToggle.classList.toggle("active", state.aiOpen);
  elements.aiProviderSelect.value = currentAiProvider();
  const model = currentAiModel();
  const suggestions = aiModelSuggestions[currentAiProvider()] || [];
  const modelOptions = suggestions.includes(model) ? suggestions : [model, ...suggestions];
  elements.aiModelSelect.innerHTML = modelOptions
    .map((optionModel) => `<option value="${escapeHtml(optionModel)}">${escapeHtml(optionModel)}</option>`)
    .join("");
  elements.aiModelSelect.value = model;
  elements.aiBaseUrlInput.value = currentAiBaseUrl();
  elements.aiBaseUrlInput.disabled = state.aiLoading;
  elements.aiApiKeyInput.value = currentAiKey();
  elements.aiModelBadge.textContent = `${aiProviderLabels[currentAiProvider()] || "AI"} · ${currentAiModel()}`;
  elements.aiSendButton.disabled = state.aiLoading;
  elements.aiInput.disabled = state.aiLoading;
  elements.aiPane.querySelectorAll(".aiQuickActions button").forEach((button) => {
    button.disabled = state.aiLoading;
  });

  elements.aiMessages.innerHTML = "";
  state.aiMessages.forEach((message) => {
    const item = document.createElement("div");
    item.className = `aiMessage ${message.role}`;
    const bubble = document.createElement("div");
    bubble.className = "aiBubble";
    bubble.textContent = message.content || (message.streaming ? t("aiThinking") : "");
    item.append(bubble);

    if (message.draftMarkdown) {
      const card = document.createElement("div");
      card.className = "aiDraftCard";
      card.innerHTML = `
        <strong>${escapeHtml(t("aiDraftReady"))}</strong>
        <div class="aiDraftPreview">${markdownPreviewHtml(message.draftMarkdown)}</div>
        <div class="aiDraftActions">
          <button type="button" class="primary" data-ai-apply="${message.id}">${escapeHtml(t("aiApplyDraft"))}</button>
          <button type="button" data-ai-copy="${message.id}">${escapeHtml(t("aiCopy"))}</button>
          <button type="button" data-ai-discard="${message.id}">${escapeHtml(t("aiDiscardDraft"))}</button>
        </div>
      `;
      item.append(card);
    }

    elements.aiMessages.append(item);
  });

  const hasStreamingMessage = state.aiMessages.some((message) => message.streaming);
  if (state.aiLoading && !hasStreamingMessage) {
    const loading = document.createElement("div");
    loading.className = "aiMessage assistant";
    loading.innerHTML = `<div class="aiBubble">${escapeHtml(t("aiThinking"))}</div>`;
    elements.aiMessages.append(loading);
  }

  elements.aiMessages.scrollTop = elements.aiMessages.scrollHeight;
}

function recentAiConversation() {
  return state.aiMessages
    .filter((message) => (message.role === "user" || message.role === "assistant") && !message.streaming && message.content)
    .slice(-8)
    .map((message) => ({
      role: message.role,
      content: message.content
    }));
}

async function sendAiMessage(instruction) {
  const trimmed = instruction.trim();
  if (!trimmed || state.aiLoading) return;

  if (!currentAiKey()) {
    state.aiMessages.push(createAiMessage("error", t("aiMissingKey")));
    renderAiPanel();
    return;
  }

  if (!window.marknote?.askAi) {
    state.aiMessages.push(createAiMessage("error", t("aiError")));
    renderAiPanel();
    return;
  }

  state.aiMessages.push(createAiMessage("user", trimmed));
  state.aiLoading = true;
  elements.aiInput.value = "";
  renderAiPanel();

  try {
    if (window.marknote?.askAiStream) {
      const streamingMessage = createAiMessage("assistant", "", { streaming: true });
      state.aiMessages.push(streamingMessage);
      renderAiPanel();

      const result = await new Promise((resolve, reject) => {
        window.marknote.askAiStream({
          provider: currentAiProvider(),
          model: currentAiModel(),
          baseUrl: currentAiBaseUrl(),
          apiKey: currentAiKey(),
          instruction: trimmed,
          markdown: state.markdown,
          fileName: state.fileName,
          messages: recentAiConversation()
        }, {
          onDelta: (text) => {
            streamingMessage.content = text;
            renderAiPanel();
          },
          onDone: resolve,
          onError: reject
        });
      });

      streamingMessage.streaming = false;
      if (!result?.ok) {
        throw new Error(result?.message || result?.error || t("aiError"));
      }
      streamingMessage.content = result.message || "";
      if (result.type === "draft" && result.markdown?.trim()) {
        streamingMessage.content ||= t("aiDraftReady");
        streamingMessage.draftMarkdown = result.markdown;
      }
      return;
    }

    const result = await window.marknote.askAi({
      provider: currentAiProvider(),
      model: currentAiModel(),
      baseUrl: currentAiBaseUrl(),
      apiKey: currentAiKey(),
      instruction: trimmed,
      markdown: state.markdown,
      fileName: state.fileName,
      messages: recentAiConversation()
    });

    if (!result?.ok) {
      throw new Error(result?.error || t("aiError"));
    }

    const content = result.message || "";
    const markdown = result.markdown || "";
    if (result.type === "draft" && markdown.trim()) {
      state.aiMessages.push(createAiMessage("assistant", content || t("aiDraftReady"), {
        draftMarkdown: markdown
      }));
    } else {
      state.aiMessages.push(createAiMessage("assistant", content || t("aiDraftReady")));
    }
  } catch (error) {
    const errorMessage = error?.message || String(error);
    const message = /No handler registered for 'ai:complete'/.test(errorMessage)
      ? t("aiRestartRequired")
      : `${t("aiError")}：${errorMessage}`;
    state.aiMessages = state.aiMessages.filter((item) => !item.streaming);
    state.aiMessages.push(createAiMessage("error", message));
  } finally {
    state.aiLoading = false;
    renderAiPanel();
  }
}

async function copyAiDraft(messageId) {
  const message = state.aiMessages.find((item) => item.id === messageId);
  if (!message?.draftMarkdown) return;

  await navigator.clipboard?.writeText(message.draftMarkdown);
  showToast(t("aiCopied"));
}

function discardAiDraft(messageId) {
  const message = state.aiMessages.find((item) => item.id === messageId);
  if (!message) return;
  delete message.draftMarkdown;
  renderAiPanel();
}

function applyAiDraft(messageId) {
  const message = state.aiMessages.find((item) => item.id === messageId);
  if (!message?.draftMarkdown) return;

  const markdown = state.preferences.taskBracketCompat
    ? normalizeTaskBrackets(message.draftMarkdown)
    : message.draftMarkdown;
  state.markdown = markdown;
  elements.editor.value = markdown;
  state.activeHeadingId = "";
  state.saveStatus = "dirty";
  syncWysiwygSoon();
  render();
  scheduleDraftSave();
  showToast(t("aiApplied"));
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(text, lineIndex) {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[`*_~[\]()#>!.?:"']/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "");
  return `${slug || "heading"}-${lineIndex}`;
}

function extractHeadings(markdown) {
  return markdown
    .split("\n")
    .map((line, lineIndex) => {
      const match = /^(#{1,3})\s+(.+?)\s*$/.exec(line);
      if (!match) return null;
      const text = match[2].replace(/[*_`~]/g, "").trim();
      return {
        id: slugify(text, lineIndex),
        level: match[1].length,
        line: lineIndex,
        text
      };
    })
    .filter(Boolean);
}

function renderPreview() {
  marked.setOptions({
    breaks: true,
    gfm: true
  });

  elements.preview.innerHTML = sanitizeMarkdownHtml(markdownToHtmlWithMath(state.markdown));

  const previewHeadings = [...elements.preview.querySelectorAll("h1, h2, h3")];
  previewHeadings.forEach((headingElement, index) => {
    const heading = state.headings[index];
    if (heading) {
      headingElement.id = heading.id;
    }
  });

  elements.preview.querySelectorAll("a[href]").forEach((link) => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noreferrer");
  });
}

function renderMarkdownLine(line) {
  if (!line.trim()) {
    return "<span class=\"hybridBlankLine\"></span>";
  }

  let rawHtml = "";
  try {
    rawHtml = marked.parse(renderInlineMath(line), { breaks: true, gfm: true });
  } catch {
    rawHtml = `<p>${escapeHtml(line)}</p>`;
  }

  return sanitizeMarkdownHtml(rawHtml);
}

function makeRenderedTaskCheckboxesInteractive(row) {
  row.querySelectorAll("input[type='checkbox'][disabled]").forEach((checkbox) => {
    checkbox.disabled = false;
    checkbox.tabIndex = -1;
  });
}

function sanitizeMarkdownHtml(html) {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["math", "semantics", "mrow", "mi", "mn", "mo", "msup", "msub", "msubsup", "mfrac", "msqrt", "mroot", "mtext", "annotation"],
    ADD_ATTR: ["target", "rel", "checked", "disabled", "type", "class", "style", "aria-hidden", "xmlns", "encoding", "tabindex"]
  });
}

function markdownToHtmlWithMath(markdown) {
  const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  const renderedLines = [];
  let inCodeFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (codeFenceInfo(line)) {
      inCodeFence = !inCodeFence;
      renderedLines.push(line);
      continue;
    }

    if (!inCodeFence && isMathFenceLine(line)) {
      const end = findMathFenceEnd(lines, index);
      if (end > index) {
        const math = lines.slice(index + 1, end).join("\n");
        renderedLines.push(renderMathHtml(math, true));
        index = end;
        continue;
      }
    }

    renderedLines.push(inCodeFence ? line : renderInlineMath(line));
  }

  return marked.parse(renderedLines.join("\n"), { breaks: true, gfm: true });
}

function renderInlineMath(line) {
  return String(line || "").replace(/(^|[^\\$])\$([^$\n]+?)\$/g, (match, prefix, math) => {
    if (!math.trim()) return match;
    return `${prefix}${renderMathHtml(math, false)}`;
  });
}

function renderMathHtml(math, displayMode) {
  const source = String(math || "").trim();
  if (!source) return "";

  if (!window.katex?.renderToString) {
    return `<code>${escapeHtml(source)}</code>`;
  }

  const html = window.katex.renderToString(source, {
    displayMode,
    throwOnError: false,
    strict: false
  });
  const className = displayMode ? "mathBlock" : "mathInline";
  return displayMode
    ? `<div class="${className}">${html}</div>`
    : `<span class="${className}">${html}</span>`;
}

function isMathFenceLine(line) {
  return line.trim() === "$$";
}

function findMathFenceEnd(lines, startIndex) {
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (isMathFenceLine(lines[index])) {
      return index;
    }
  }
  return startIndex;
}

function findMathFenceRangeForLine(lines, lineIndex) {
  let start = -1;

  for (let index = 0; index <= lineIndex; index += 1) {
    if (isMathFenceLine(lines[index])) {
      start = start === -1 ? index : -1;
    }
  }

  if (start === -1) return null;
  const end = findMathFenceEnd(lines, start);
  if (end <= start || lineIndex > end) return null;
  return { start, end };
}

function codeFenceInfo(line) {
  const match = /^(\s*)(`{3,}|~{3,})(.*)$/.exec(line);
  if (!match) return null;
  return {
    indent: match[1],
    marker: match[2],
    fence: match[2][0],
    size: match[2].length,
    meta: match[3].trim()
  };
}

function findCodeFenceEnd(lines, startIndex) {
  const opening = codeFenceInfo(lines[startIndex]);
  if (!opening) return startIndex;

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const closing = codeFenceInfo(lines[index]);
    if (closing && closing.fence === opening.fence && closing.size >= opening.size) {
      return index;
    }
  }

  return lines.length - 1;
}

function findCodeFenceRangeForLine(lines, lineIndex) {
  let opening = null;

  for (let index = 0; index < lines.length; index += 1) {
    const info = codeFenceInfo(lines[index]);
    if (!info) continue;

    if (!opening) {
      opening = { index, info };
      continue;
    }

    if (info.fence === opening.info.fence && info.size >= opening.info.size) {
      const range = {
        start: opening.index,
        end: index,
        opening: opening.info,
        hasClosing: true
      };
      if (lineIndex >= range.start && lineIndex <= range.end) return range;
      opening = null;
    }
  }

  if (opening && lineIndex >= opening.index) {
    return {
      start: opening.index,
      end: lines.length - 1,
      opening: opening.info,
      hasClosing: false
    };
  }

  return null;
}

function isTableRowLine(line) {
  const trimmed = line.trim();
  return trimmed.includes("|") && !codeFenceInfo(trimmed);
}

function isTableSeparatorLine(line) {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) return false;

  const cells = trimmed
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

  if (cells.length < 2) return false;
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function tableCellsFromLine(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isPotentialTableHeaderLine(line) {
  const trimmed = line.trim();
  if (!trimmed.includes("|") || isTableSeparatorLine(trimmed)) return false;
  return tableCellsFromLine(trimmed).length >= 1;
}

function tableSeparatorForLine(line) {
  const cells = tableCellsFromLine(line);
  const body = cells.map(() => " --- ").join("|");
  return `|${body}|`;
}

function emptyTableRowForLine(line) {
  const cells = tableCellsFromLine(line);
  const body = cells.map(() => " ").join(" | ");
  return `| ${body} |`;
}

function findTableRangeAt(lines, startIndex) {
  if (!isTableRowLine(lines[startIndex]) || !isTableSeparatorLine(lines[startIndex + 1] || "")) {
    return null;
  }

  let end = startIndex + 1;
  while (end + 1 < lines.length && isTableRowLine(lines[end + 1])) {
    end += 1;
  }

  return { start: startIndex, end };
}

function findTableRangeForLine(lines, lineIndex) {
  for (let index = 0; index < lines.length - 1; index += 1) {
    const range = findTableRangeAt(lines, index);
    if (!range) continue;
    if (lineIndex >= range.start && lineIndex <= range.end) return range;
    index = range.end;
  }

  return null;
}

function selectionOffsetWithin(node) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;
  const range = selection.getRangeAt(0);
  const probe = range.cloneRange();
  probe.selectNodeContents(node);
  probe.setEnd(range.endContainer, range.endOffset);
  return probe.toString().length;
}

function setSelectionOffset(node, offset) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  let textNode = walker.nextNode();

  while (textNode) {
    if (remaining <= textNode.textContent.length) {
      const range = document.createRange();
      range.setStart(textNode, remaining);
      range.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    remaining -= textNode.textContent.length;
    textNode = walker.nextNode();
  }

  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function hasTextSelection() {
  const selection = window.getSelection();
  return Boolean(selection && !selection.isCollapsed && selection.toString().trim());
}

function normalizeTaskBrackets(markdown) {
  return markdown
    .split("\n")
    .map((line) => line.replace(
      /^(\s*(?:[-*+]|\d+[.)]))\s*(?:\[([ xX])?\]|【\s*([xX])?\s*】)(?=\s+)/,
      (_match, bullet, englishState = "", chineseState = "") => {
        const marker = `${englishState}${chineseState}`.trim().toLowerCase() === "x" ? "x" : " ";
        return `${bullet} [${marker}]`;
      }
    ))
    .join("\n");
}

function applyTaskBracketConversion() {
  if (!state.preferences.taskBracketCompat) return false;

  const editor = elements.editor;
  const previousValue = editor.value;
  const nextValue = normalizeTaskBrackets(previousValue);
  if (nextValue === previousValue) return false;

  const selectionStart = editor.selectionStart;
  const selectionEnd = editor.selectionEnd;
  editor.value = nextValue;
  state.markdown = nextValue;
  const delta = nextValue.length - previousValue.length;
  editor.setSelectionRange(
    Math.max(0, selectionStart + delta),
    Math.max(0, selectionEnd + delta)
  );
  return true;
}

class LinewiseMarkdownEditor {
  constructor({ root, markdown, onChange }) {
    this.root = root;
    this.markdown = markdown;
    this.onChange = onChange;
    this.activeLine = this.clampLine(Number.isInteger(state.hybridActiveLine) ? state.hybridActiveLine : 0);
    this.editingCodeBlockStart = null;
    this.editingTableStart = null;
    this.editingMathStart = null;
    this.selectionScrollGuard = {
      active: false,
      frame: 0,
      lastScrollTop: 0,
      pointerY: 0
    };
    this.bindSelectionScrollGuard();
    this.bindBlankAreaExit();
    this.bindMathBlockEdit();
  }

  get lines() {
    return this.markdown.split("\n");
  }

  getMarkdown() {
    return this.markdown;
  }

  clampLine(lineIndex) {
    const maxLine = Math.max(0, this.lines.length - 1);
    return Math.max(-1, Math.min(lineIndex, maxLine));
  }

  async setMarkdown(markdown, options = {}) {
    this.markdown = markdown ?? "";
    const fallbackLine = Number.isInteger(state.hybridActiveLine) ? state.hybridActiveLine : 0;
    this.activeLine = options.activeLine ?? (options.preserveActive ? this.activeLine : fallbackLine);
    this.activeLine = this.clampLine(this.activeLine);
    state.hybridActiveLine = this.activeLine;
    this.render({
      focus: options.focus ?? false,
      caretOffset: options.caretOffset ?? null
    });
  }

  clearActiveLine() {
    if (
      this.activeLine < 0 &&
      this.editingCodeBlockStart === null &&
      this.editingTableStart === null &&
      this.editingMathStart === null
    ) return;
    this.activeLine = -1;
    this.editingCodeBlockStart = null;
    this.editingTableStart = null;
    this.editingMathStart = null;
    state.hybridActiveLine = -1;
    this.render({ focus: false });
  }

  focus() {
    const active = this.root.querySelector(".hybridSourceLine");
    active?.focus();
  }

  scrollToHeading(heading) {
    this.activeLine = heading.line;
    state.hybridActiveLine = this.activeLine;
    this.editingCodeBlockStart = null;
    this.editingTableStart = null;
    this.editingMathStart = null;
    this.render({ focus: false, restoreScroll: false });
    window.requestAnimationFrame(() => {
      this.scrollLineIntoView(heading.line);
      this.focusActiveLineAtEnd();
    });
  }

  findElementForLine(lineIndex) {
    const exact = this.root.querySelector(`[data-line="${lineIndex}"]`);
    if (exact) return exact;

    return [...this.root.querySelectorAll("[data-line-start][data-line-end]")]
      .find((node) => {
        const start = Number(node.dataset.lineStart);
        const end = Number(node.dataset.lineEnd);
        return Number.isInteger(start) &&
          Number.isInteger(end) &&
          lineIndex >= start &&
          lineIndex <= end;
      }) ?? null;
  }

  scrollLineIntoView(lineIndex) {
    const target = this.findElementForLine(lineIndex);
    if (!target) return;

    this.root.scrollTo({
      top: Math.max(0, target.offsetTop - this.root.clientHeight * 0.22),
      behavior: "smooth"
    });
  }

  focusActiveLineAtEnd() {
    const active = this.root.querySelector(".hybridSourceLine");
    if (!active) return;
    active.focus({ preventScroll: true });
    setSelectionOffset(active, active.textContent.length);
  }

  bindSelectionScrollGuard() {
    this.root.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return;
      if (isNativeScrollbarPointerDown(event, this.root)) return;
      this.selectionScrollGuard.active = true;
      this.selectionScrollGuard.lastScrollTop = this.root.scrollTop;
      this.selectionScrollGuard.pointerY = event.clientY;
      this.watchSelectionScroll();
    });

    window.addEventListener("mousemove", (event) => {
      if (!this.selectionScrollGuard.active) return;
      this.selectionScrollGuard.pointerY = event.clientY;
    });

    window.addEventListener("mouseup", () => {
      window.setTimeout(() => {
        this.selectionScrollGuard.active = false;
        window.cancelAnimationFrame(this.selectionScrollGuard.frame);
      }, 80);
    });
  }

  bindBlankAreaExit() {
    this.root.addEventListener("click", (event) => {
      if (event.target !== this.root || hasTextSelection()) return;
      this.clearActiveLine();
    });
  }

  bindMathBlockEdit() {
    this.root.addEventListener("click", (event) => {
      const block = event.target.closest?.(".hybridMathBlock");
      if (!block || !this.root.contains(block) || hasTextSelection()) return;

      const lineIndex = Number(block.dataset.line);
      if (!Number.isInteger(lineIndex)) return;

      event.preventDefault();
      event.stopPropagation();
      this.openMathEditor(lineIndex);
    }, true);
  }

  openMathEditor(lineIndex) {
    const range = findMathFenceRangeForLine(this.lines, lineIndex);
    if (!range) return;

    this.activeLine = range.start;
    this.editingCodeBlockStart = null;
    this.editingTableStart = null;
    this.editingMathStart = range.start;
    state.hybridActiveLine = range.start;
    this.render({ focus: false });
  }

  watchSelectionScroll() {
    window.cancelAnimationFrame(this.selectionScrollGuard.frame);

    const limitScrollStep = () => {
      if (!this.selectionScrollGuard.active) return;

      const currentTop = this.root.scrollTop;
      const delta = currentTop - this.selectionScrollGuard.lastScrollTop;
      const rootRect = this.root.getBoundingClientRect();
      const edgeSize = Math.min(72, this.root.clientHeight * 0.12);
      const nearTop = this.selectionScrollGuard.pointerY <= rootRect.top + edgeSize;
      const nearBottom = this.selectionScrollGuard.pointerY >= rootRect.bottom - edgeSize;
      const allowedDirection =
        (nearTop && delta < 0) ||
        (nearBottom && delta > 0);
      const maxStep = hasTextSelection() ? 25 : 48;

      if (!allowedDirection) {
        this.root.scrollTop = this.selectionScrollGuard.lastScrollTop;
      } else if (Math.abs(delta) > maxStep) {
        this.root.scrollTop = this.selectionScrollGuard.lastScrollTop + Math.sign(delta) * maxStep;
      }

      this.selectionScrollGuard.lastScrollTop = this.root.scrollTop;
      this.selectionScrollGuard.frame = window.requestAnimationFrame(limitScrollStep);
    };

    this.selectionScrollGuard.frame = window.requestAnimationFrame(limitScrollStep);
  }

  updateLine(lineIndex, value, options = {}) {
    const lines = this.lines;
    const scrollTop = this.root.scrollTop;
    lines[lineIndex] = value;
    this.markdown = lines.join("\n");
    this.onChange?.(this.markdown, options);
    if (options.source === "input") {
      this.restoreScroll(scrollTop);
    }
  }

  toggleTaskLine(lineIndex) {
    const lines = this.lines;
    const line = lines[lineIndex] || "";
    const nextLine = line.replace(
      /^(\s*(?:[-*+]|\d+[.)])\s*)(?:\[([ xX])\]|【\s*([xX])?\s*】)(?=\s+)/,
      (_match, bullet, englishState = "", chineseState = "") => {
        const checked = `${englishState}${chineseState}`.trim().toLowerCase() === "x";
        return `${bullet}[${checked ? " " : "x"}]`;
      }
    );
    if (nextLine === line) return false;

    const scrollTop = this.root.scrollTop;
    lines[lineIndex] = nextLine;
    this.markdown = lines.join("\n");
    this.editingCodeBlockStart = null;
    this.editingTableStart = null;
    this.editingMathStart = null;
    this.onChange?.(this.markdown, {
      source: "task-toggle",
      preserveActive: true
    });
    this.render({ focus: false });
    this.restoreScroll(scrollTop);
    return true;
  }

  replaceLines(lines, activeLine, options = {}) {
    this.markdown = lines.join("\n");
    this.activeLine = Math.max(0, Math.min(activeLine, lines.length - 1));
    this.editingCodeBlockStart = Number.isInteger(options.editCodeBlockStart) ? options.editCodeBlockStart : null;
    this.editingTableStart = Number.isInteger(options.editTableStart) ? options.editTableStart : null;
    this.editingMathStart = Number.isInteger(options.editMathStart) ? options.editMathStart : null;
    state.hybridActiveLine = this.activeLine;
    this.onChange?.(this.markdown, options);
    this.render({
      focus: true,
      caretOffset: options.caretOffset ?? 0,
      comfortable: Boolean(options.comfortable)
    });
  }

  replaceCodeBlock(range, language, codeValue, options = {}) {
    const lines = this.lines;
    const currentRange = findCodeFenceRangeForLine(lines, this.activeLine) || range;
    const before = lines.slice(0, currentRange.start);
    const after = currentRange.hasClosing ? lines.slice(currentRange.end + 1) : [];
    const codeLines = codeValue.replace(/\r\n?/g, "\n").split("\n");
    const openingLine = `${currentRange.opening.indent}${currentRange.opening.marker}${language.trim()}`;
    const closingLine = `${currentRange.opening.indent}${currentRange.opening.marker}`;
    const nextLines = [...before, openingLine, ...codeLines, closingLine, ...after];

    this.markdown = nextLines.join("\n");
    this.activeLine = currentRange.start;
    this.editingCodeBlockStart = currentRange.start;
    state.hybridActiveLine = this.activeLine;
    this.onChange?.(this.markdown, options);
  }

  replaceTableBlock(range, tableMarkdown, options = {}) {
    const lines = this.lines;
    const currentRange = findTableRangeForLine(lines, this.editingTableStart ?? this.activeLine) || range;
    const before = lines.slice(0, currentRange.start);
    const after = lines.slice(currentRange.end + 1);
    const tableLines = tableMarkdown.replace(/\r\n?/g, "\n").split("\n");
    const nextLines = [...before, ...tableLines, ...after];

    this.markdown = nextLines.join("\n");
    this.activeLine = currentRange.start;
    this.editingTableStart = currentRange.start;
    state.hybridActiveLine = this.activeLine;
    this.onChange?.(this.markdown, options);
  }

  replaceMathBlock(range, mathMarkdown, options = {}) {
    const lines = this.lines;
    const currentRange = findMathFenceRangeForLine(lines, this.editingMathStart ?? this.activeLine) || range;
    const before = lines.slice(0, currentRange.start);
    const after = lines.slice(currentRange.end + 1);
    const mathLines = mathMarkdown.replace(/\r\n?/g, "\n").split("\n");
    const nextLines = [...before, ...mathLines, ...after];

    this.markdown = nextLines.join("\n");
    this.activeLine = currentRange.start;
    this.editingMathStart = currentRange.start;
    state.hybridActiveLine = this.activeLine;
    this.onChange?.(this.markdown, options);
  }

  renderMathEditor(range, lines, scrollTop) {
    const row = document.createElement("div");
    row.className = "hybridMathEditor";
    row.dataset.line = String(range.start);

    const header = document.createElement("div");
    header.className = "hybridMathEditorHeader";

    const label = document.createElement("span");
    label.textContent = "formula";

    const exitButton = document.createElement("button");
    exitButton.type = "button";
    exitButton.textContent = t("exitTableEdit");

    header.append(label, exitButton);

    const textarea = document.createElement("textarea");
    textarea.className = "hybridMathTextarea";
    textarea.spellcheck = false;
    textarea.value = lines.slice(range.start, range.end + 1).join("\n");
    textarea.setAttribute("aria-label", "公式 Markdown 内容");

    const closeEditor = () => {
      this.editingMathStart = null;
      this.render({ focus: false });
    };

    textarea.addEventListener("input", () => {
      this.replaceMathBlock(range, textarea.value, {
        source: "mathblock",
        wasFocused: true
      });
    });
    textarea.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeEditor();
      }
    });
    exitButton.addEventListener("click", closeEditor);

    row.append(header, textarea);
    this.root.append(row);

    window.setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      this.restoreScroll(scrollTop);
    }, 0);
  }

  renderTableEditor(range, lines, scrollTop) {
    const row = document.createElement("div");
    row.className = "hybridTableEditor";
    row.dataset.line = String(range.start);

    const header = document.createElement("div");
    header.className = "hybridTableEditorHeader";

    const label = document.createElement("span");
    label.textContent = t("tableBlock");

    const exitButton = document.createElement("button");
    exitButton.type = "button";
    exitButton.textContent = t("exitTableEdit");

    header.append(label, exitButton);

    const textarea = document.createElement("textarea");
    textarea.className = "hybridTableTextarea";
    textarea.spellcheck = false;
    textarea.value = lines.slice(range.start, range.end + 1).join("\n");
    textarea.setAttribute("aria-label", "表格 Markdown 内容");

    const closeEditor = () => {
      this.editingTableStart = null;
      this.render({ focus: false });
    };

    textarea.addEventListener("input", () => {
      this.replaceTableBlock(range, textarea.value, {
        source: "tableblock",
        wasFocused: true
      });
    });
    textarea.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeEditor();
      }
    });
    exitButton.addEventListener("click", closeEditor);

    row.append(header, textarea);
    this.root.append(row);

    window.setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      this.restoreScroll(scrollTop);
    }, 0);
  }

  renderCodeEditor(range, lines, scrollTop) {
    const row = document.createElement("div");
    row.className = "hybridCodeEditor";
    row.dataset.line = String(range.start);

    const header = document.createElement("div");
    header.className = "hybridCodeEditorHeader";

    const label = document.createElement("span");
    label.textContent = "code";

    const languageInput = document.createElement("input");
    languageInput.type = "text";
    languageInput.value = range.opening.meta;
    languageInput.placeholder = "language";
    languageInput.spellcheck = false;
    languageInput.setAttribute("aria-label", "代码语言");

    header.append(label, languageInput);

    const textarea = document.createElement("textarea");
    textarea.className = "hybridCodeTextarea";
    textarea.spellcheck = false;
    textarea.value = lines
      .slice(range.start + 1, range.hasClosing ? range.end : range.end + 1)
      .join("\n");
    textarea.setAttribute("aria-label", "代码块内容");

    const update = (options = {}) => {
      this.replaceCodeBlock(range, languageInput.value, textarea.value, {
        source: "codeblock",
        wasFocused: true,
        ...options
      });
    };

    languageInput.addEventListener("input", () => update());
    textarea.addEventListener("input", () => update());
    textarea.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = `${textarea.value.slice(0, start)}  ${textarea.value.slice(end)}`;
        textarea.setSelectionRange(start + 2, start + 2);
        update();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        this.editingCodeBlockStart = null;
        this.editingTableStart = null;
        this.editingMathStart = null;
        this.render({ focus: false });
      }
    });
    languageInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.editingCodeBlockStart = null;
        this.editingTableStart = null;
        this.editingMathStart = null;
        this.render({ focus: false });
      }
    });

    row.append(header, textarea);
    this.root.append(row);

    window.setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      this.restoreScroll(scrollTop);
    }, 0);
  }

  render({ focus = false, caretOffset = null, comfortable = false, restoreScroll = true } = {}) {
    const scrollTop = this.root.scrollTop;
    const lines = this.lines.length ? this.lines : [""];
    const editingCodeRange = Number.isInteger(this.editingCodeBlockStart)
      ? findCodeFenceRangeForLine(lines, this.editingCodeBlockStart)
      : null;
    const editingTableRange = Number.isInteger(this.editingTableStart)
      ? findTableRangeForLine(lines, this.editingTableStart)
      : null;
    const editingMathRange = Number.isInteger(this.editingMathStart)
      ? findMathFenceRangeForLine(lines, this.editingMathStart)
      : null;
    this.root.innerHTML = "";

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (editingCodeRange && index === editingCodeRange.start) {
        this.renderCodeEditor(editingCodeRange, lines, scrollTop);
        index = editingCodeRange.end;
        continue;
      }

      if (editingTableRange && index === editingTableRange.start) {
        this.renderTableEditor(editingTableRange, lines, scrollTop);
        index = editingTableRange.end;
        continue;
      }

      if (editingMathRange && index === editingMathRange.start) {
        this.renderMathEditor(editingMathRange, lines, scrollTop);
        index = editingMathRange.end;
        continue;
      }

      if (isMathFenceLine(line)) {
        const mathEnd = findMathFenceEnd(lines, index);
        if (mathEnd > index) {
          const row = document.createElement("div");
          row.className = "hybridLine rendered hybridMathBlock";
          row.dataset.line = String(index);
          row.dataset.lineStart = String(index);
          row.dataset.lineEnd = String(mathEnd);
          row.innerHTML = renderMathHtml(lines.slice(index + 1, mathEnd).join("\n"), true);
          this.root.append(row);
          index = mathEnd;
          continue;
        }
      }

      const fenceInfo = codeFenceInfo(line);
      if (fenceInfo) {
        const fenceEnd = findCodeFenceEnd(lines, index);
        const row = document.createElement("div");
        row.className = "hybridLine rendered hybridCodeBlock";
        row.dataset.line = String(index);
        row.dataset.lineStart = String(index);
        row.dataset.lineEnd = String(fenceEnd);
        row.innerHTML = markdownPreviewHtml(lines.slice(index, fenceEnd + 1).join("\n"));
        row.addEventListener("click", () => {
          if (hasTextSelection()) return;
          this.activeLine = index;
          this.editingCodeBlockStart = index;
          this.editingTableStart = null;
          this.editingMathStart = null;
          state.hybridActiveLine = index;
          this.render({ focus: false });
        });
        this.root.append(row);
        index = fenceEnd;
        continue;
      }

      const tableRange = findTableRangeAt(lines, index);
      if (tableRange) {
        const row = document.createElement("div");
        row.className = "hybridLine rendered hybridTableBlock";
        row.dataset.line = String(index);
        row.dataset.lineStart = String(tableRange.start);
        row.dataset.lineEnd = String(tableRange.end);
        row.innerHTML = markdownPreviewHtml(lines.slice(tableRange.start, tableRange.end + 1).join("\n"));
        row.addEventListener("click", () => {
          if (hasTextSelection()) return;
          this.activeLine = index;
          this.editingTableStart = index;
          this.editingCodeBlockStart = null;
          this.editingMathStart = null;
          state.hybridActiveLine = index;
          this.render({ focus: false });
        });
        this.root.append(row);
        index = tableRange.end;
        continue;
      }

      const row = document.createElement("div");
      row.className = `hybridLine ${index === this.activeLine ? "active" : "rendered"}`;
      row.dataset.line = String(index);

      if (index === this.activeLine) {
        row.classList.add("hybridSourceLine");
        row.contentEditable = "true";
        row.spellcheck = false;
        row.textContent = line;
        row.dataset.placeholder = t("startWriting");
        row.setAttribute("role", "textbox");
        row.setAttribute("aria-label", "当前 Markdown 行");
        row.addEventListener("input", () => {
          this.updateLine(index, row.textContent, {
            source: "input",
            caretOffset: selectionOffsetWithin(row),
            wasFocused: document.activeElement === row
          });
        });
        row.addEventListener("keydown", (event) => this.handleKeydown(event, row, index));
        row.addEventListener("paste", (event) => this.handlePaste(event, row, index));
      } else {
        row.innerHTML = renderMarkdownLine(line);
        makeRenderedTaskCheckboxesInteractive(row);
        row.addEventListener("click", (event) => {
          if (hasTextSelection()) return;
          if (event.target.closest?.("input[type='checkbox']")) {
            event.preventDefault();
            event.stopPropagation();
            this.toggleTaskLine(index);
            return;
          }
          this.activeLine = index;
          this.editingCodeBlockStart = null;
          this.editingTableStart = null;
          this.editingMathStart = null;
          state.hybridActiveLine = index;
          this.render({ focus: true, caretOffset: line.length });
        });
      }

      this.root.append(row);
    }

    if (restoreScroll) {
      this.restoreScroll(scrollTop);
    }
    if (focus && !editingCodeRange && !editingTableRange && !editingMathRange) {
      window.setTimeout(() => {
        const active = this.root.querySelector(".hybridSourceLine");
        if (!active) return;
        active.focus();
        setSelectionOffset(active, caretOffset ?? active.textContent.length);
        if (comfortable) {
          this.keepActiveLineComfortable();
        } else {
          this.restoreScroll(scrollTop);
        }
      }, 0);
    }
  }

  restoreScroll(scrollTop) {
    this.root.scrollTop = scrollTop;
    window.requestAnimationFrame(() => {
      this.root.scrollTop = scrollTop;
    });
    window.setTimeout(() => {
      this.root.scrollTop = scrollTop;
    }, 0);
  }

  keepActiveLineComfortable() {
    const active = this.root.querySelector(".hybridSourceLine");
    if (!active) return;

    const rootRect = this.root.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const comfortableTop = rootRect.top + this.root.clientHeight * 0.28;
    const comfortableBottom = rootRect.top + this.root.clientHeight * 0.62;
    let delta = 0;

    if (activeRect.bottom > comfortableBottom) {
      delta = activeRect.bottom - comfortableBottom;
    } else if (activeRect.top < comfortableTop) {
      delta = activeRect.top - comfortableTop;
    }

    if (Math.abs(delta) < 1) return;
    this.root.scrollTo({
      top: this.root.scrollTop + delta,
      behavior: "smooth"
    });
  }

  isActiveLineNearViewportBottom(row) {
    const rootRect = this.root.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const bottomThreshold = rootRect.top + this.root.clientHeight * 0.78;
    return rowRect.bottom >= bottomThreshold;
  }

  handleKeydown(event, row, lineIndex) {
    if (event.key === "Enter") {
      event.preventDefault();
      const offset = selectionOffsetWithin(row);
      const text = row.textContent;
      const lines = this.lines;
      const shouldMoveForEndWriting = this.isActiveLineNearViewportBottom(row);
      const beforeCaret = text.slice(0, offset);
      const afterCaret = text.slice(offset);
      const openingFence = codeFenceInfo(beforeCaret);
      if (openingFence && !afterCaret.trim()) {
        lines[lineIndex] = beforeCaret;
        lines.splice(lineIndex + 1, 0, "", `${openingFence.indent}${openingFence.marker}`);
        this.replaceLines(lines, lineIndex + 1, {
          source: "enter",
          caretOffset: 0,
          comfortable: shouldMoveForEndWriting,
          editCodeBlockStart: lineIndex
        });
        return;
      }
      if (isPotentialTableHeaderLine(beforeCaret) && !afterCaret.trim()) {
        lines[lineIndex] = beforeCaret;
        lines.splice(lineIndex + 1, 0, tableSeparatorForLine(beforeCaret), emptyTableRowForLine(beforeCaret));
        this.replaceLines(lines, lineIndex, {
          source: "enter",
          caretOffset: 0,
          comfortable: shouldMoveForEndWriting,
          editTableStart: lineIndex
        });
        return;
      }
      lines[lineIndex] = beforeCaret;
      lines.splice(lineIndex + 1, 0, afterCaret);
      this.replaceLines(lines, lineIndex + 1, {
        source: "enter",
        caretOffset: 0,
        comfortable: shouldMoveForEndWriting
      });
      return;
    }

    if (event.key === "Backspace" && selectionOffsetWithin(row) === 0 && lineIndex > 0) {
      event.preventDefault();
      const lines = this.lines;
      const previousLength = lines[lineIndex - 1].length;
      lines[lineIndex - 1] += row.textContent;
      lines.splice(lineIndex, 1);
      this.replaceLines(lines, lineIndex - 1, { source: "backspace", caretOffset: previousLength });
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      return;
    }
  }

  handlePaste(event, row, lineIndex) {
    const text = event.clipboardData?.getData("text/plain");
    if (!text || !text.includes("\n")) return;

    event.preventDefault();
    const offset = selectionOffsetWithin(row);
    const current = row.textContent;
    const pasted = text.replace(/\r\n?/g, "\n").split("\n");
    const lines = this.lines;
    const before = current.slice(0, offset);
    const after = current.slice(offset);
    const replacement = [...pasted];
    replacement[0] = before + replacement[0];
    replacement[replacement.length - 1] += after;
    lines.splice(lineIndex, 1, ...replacement);
    this.replaceLines(lines, lineIndex + replacement.length - 1, {
      source: "paste",
      caretOffset: replacement[replacement.length - 1].length - after.length
    });
  }
}

function bindTextareaSelectionScrollGuard(textarea) {
  const guard = {
    active: false,
    frame: 0,
    lastScrollTop: 0,
    pointerY: 0
  };

  textarea.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    if (isNativeScrollbarPointerDown(event, textarea)) return;
    guard.active = true;
    guard.lastScrollTop = textarea.scrollTop;
    guard.pointerY = event.clientY;
    watchTextareaScroll();
  });

  window.addEventListener("mousemove", (event) => {
    if (!guard.active) return;
    guard.pointerY = event.clientY;
  });

  window.addEventListener("mouseup", () => {
    window.setTimeout(() => {
      guard.active = false;
      window.cancelAnimationFrame(guard.frame);
    }, 80);
  });

  function watchTextareaScroll() {
    window.cancelAnimationFrame(guard.frame);

    const limitScrollStep = () => {
      if (!guard.active) return;

      const currentTop = textarea.scrollTop;
      const delta = currentTop - guard.lastScrollTop;
      const rect = textarea.getBoundingClientRect();
      const edgeSize = Math.min(72, textarea.clientHeight * 0.12);
      const nearTop = guard.pointerY <= rect.top + edgeSize;
      const nearBottom = guard.pointerY >= rect.bottom - edgeSize;
      const allowedDirection =
        (nearTop && delta < 0) ||
        (nearBottom && delta > 0);
      const maxStep = hasTextSelection() ? 25 : 48;

      if (!allowedDirection) {
        textarea.scrollTop = guard.lastScrollTop;
      } else if (Math.abs(delta) > maxStep) {
        textarea.scrollTop = guard.lastScrollTop + Math.sign(delta) * maxStep;
      }

      guard.lastScrollTop = textarea.scrollTop;
      guard.frame = window.requestAnimationFrame(limitScrollStep);
    };

    guard.frame = window.requestAnimationFrame(limitScrollStep);
  }
}

function isNativeScrollbarPointerDown(event, element) {
  const rect = element.getBoundingClientRect();
  const verticalScrollbarWidth = element.offsetWidth - element.clientWidth;
  const horizontalScrollbarHeight = element.offsetHeight - element.clientHeight;
  const onVerticalScrollbar =
    verticalScrollbarWidth > 0 &&
    element.scrollHeight > element.clientHeight &&
    event.clientX >= rect.right - verticalScrollbarWidth;
  const onHorizontalScrollbar =
    horizontalScrollbarHeight > 0 &&
    element.scrollWidth > element.clientWidth &&
    event.clientY >= rect.bottom - horizontalScrollbarHeight;

  return onVerticalScrollbar || onHorizontalScrollbar;
}

async function initWysiwygEditor() {
  if (state.wysiwyg) return;

  state.wysiwyg = new LinewiseMarkdownEditor({
    root: elements.wysiwygEditor,
    markdown: state.markdown,
    onChange: (markdown, options = {}) => {
      if (state.syncingFromWysiwyg) return;

      const normalized = state.preferences.taskBracketCompat
        ? normalizeTaskBrackets(markdown)
        : markdown;
      state.markdown = normalized;
      elements.editor.value = normalized;
      render();
      scheduleDraftSave();
      if (normalized !== markdown) {
        state.wysiwyg.setMarkdown(normalized, {
          preserveActive: true,
          focus: Boolean(options.wasFocused) || options.source === "enter" || options.source === "paste",
          caretOffset: options.caretOffset
        });
      }
    }
  });
  state.wysiwyg.render();
}

async function syncWysiwygFromState() {
  if (!state.wysiwyg) {
    await initWysiwygEditor();
    return;
  }

  state.syncingFromWysiwyg = true;
  await state.wysiwyg.setMarkdown(state.markdown);
  state.syncingFromWysiwyg = false;
}

async function syncStateFromWysiwyg() {
  if (!state.wysiwyg) return;

  const markdown = state.preferences.taskBracketCompat
    ? normalizeTaskBrackets(state.wysiwyg.getMarkdown())
    : state.wysiwyg.getMarkdown();
  if (markdown === state.markdown) return;

  state.markdown = markdown;
  elements.editor.value = markdown;
  render();
  scheduleDraftSave();
}

function syncWysiwygSoon() {
  if (!state.wysiwyg) return;
  syncWysiwygFromState();
}

function renderOutline() {
  elements.outlineList.innerHTML = "";
  elements.headingCount.textContent = `${state.headings.length} ${t("headings")}`;

  if (state.headings.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptyOutline";
    empty.textContent = t("emptyOutline");
    elements.outlineList.append(empty);
    return;
  }

  state.headings.forEach((heading, index) => {
    if (isHiddenByCollapsedParent(index)) return;

    const button = document.createElement("button");
    const hasChildren = headingHasChildren(index);
    const isCollapsed = state.collapsedHeadings.has(heading.id);
    button.className = `outlineItem level${heading.level}`;
    if (hasChildren) button.classList.add("hasChildren");
    if (isCollapsed) button.classList.add("collapsed");
    if (heading.id === state.activeHeadingId) button.classList.add("active");
    button.type = "button";
    button.style.setProperty("--depth", heading.level - 1);
    button.innerHTML = `
      <span class="outlineGuide">${outlineGlyph(index, hasChildren, isCollapsed)}</span>
      <strong class="outlineText">${escapeHtml(heading.text)}</strong>
    `;
    if (hasChildren) {
      button.querySelector(".outlineGuide").addEventListener("click", (event) => {
        event.stopPropagation();
        toggleHeadingCollapse(heading.id);
      });
    }
    button.addEventListener("click", () => jumpToHeading(heading));
    elements.outlineList.append(button);
  });

  keepActiveOutlineItemVisible();
}

function setActiveHeadingId(headingId) {
  if (!headingId || headingId === state.activeHeadingId) return;
  state.activeHeadingId = headingId;
  renderOutline();
  updateStatus();
}

function keepActiveOutlineItemVisible() {
  const activeItem = elements.outlineList.querySelector(".outlineItem.active");
  if (!activeItem) return;

  activeItem.scrollIntoView({
    block: "nearest",
    inline: "nearest"
  });
}

function headingFromEditorScroll() {
  if (!state.headings.length) return null;

  const editorStyle = window.getComputedStyle(elements.editor);
  const lineHeight = Number.parseFloat(editorStyle.lineHeight) || 24;
  const paddingTop = Number.parseFloat(editorStyle.paddingTop) || 0;
  const markerOffset = Math.max(0, elements.editor.scrollTop + 96 - paddingTop);
  const markerLine = Math.floor(markerOffset / lineHeight);
  let activeHeading = state.headings[0];

  for (const heading of state.headings) {
    if (heading.line <= markerLine) {
      activeHeading = heading;
    } else {
      break;
    }
  }

  return activeHeading;
}

function headingFromPreviewScroll() {
  const headings = [...elements.preview.querySelectorAll("h1, h2, h3")];
  if (!headings.length) return null;

  const paneRect = elements.previewPane.getBoundingClientRect();
  const marker = paneRect.top + 96;
  let activeElement = headings[0];

  for (const headingElement of headings) {
    if (headingElement.getBoundingClientRect().top <= marker) {
      activeElement = headingElement;
    } else {
      break;
    }
  }

  return state.headings.find((heading) => heading.id === activeElement.id) || null;
}

function headingFromWysiwygScroll() {
  if (!state.wysiwyg || !state.headings.length) return null;

  const rootRect = elements.wysiwygEditor.getBoundingClientRect();
  const marker = rootRect.top + 96;
  let activeHeading = state.headings[0];

  for (const heading of state.headings) {
    const target = state.wysiwyg.findElementForLine(heading.line);
    if (!target) continue;
    if (target.getBoundingClientRect().top <= marker) {
      activeHeading = heading;
    } else {
      break;
    }
  }

  return activeHeading;
}

function updateActiveHeadingFromVisibleScroll() {
  const heading = state.preferences.viewMode === "wysiwyg"
    ? headingFromWysiwygScroll()
    : state.preferences.viewMode === "edit"
      ? headingFromEditorScroll()
      : headingFromPreviewScroll();
  if (heading) setActiveHeadingId(heading.id);
}

function scheduleActiveHeadingFromScroll() {
  window.cancelAnimationFrame(state.activeHeadingScrollFrame);
  state.activeHeadingScrollFrame = window.requestAnimationFrame(updateActiveHeadingFromVisibleScroll);
}

function renderRecentFiles() {
  elements.recentList.innerHTML = "";
  elements.recentPanel.hidden = !state.recentOpen;
  elements.currentFileButton.classList.toggle("active", state.recentOpen);

  if (state.recentFiles.length === 0) {
    const empty = document.createElement("div");
    empty.className = "recentEmpty";
    empty.textContent = t("noRecentFiles");
    elements.recentList.append(empty);
    return;
  }

  state.recentFiles.forEach((file) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recentItem";
    if (file.filePath === state.filePath) {
      button.classList.add("active");
    }
    button.innerHTML = `
      <span class="recentName">${escapeHtml(file.fileName)}</span>
      <span class="recentPath">${escapeHtml(file.filePath)}</span>
    `;
    button.addEventListener("click", () => switchToRecentFile(file));
    elements.recentList.append(button);
  });
}

function openRenameDialog() {
  closeFileContextMenu();

  if (!state.filePath || state.isHelpOpen) {
    showToast(t("renameUnavailable"));
    return;
  }

  elements.renameInput.value = state.fileName;
  elements.renameDialog.hidden = false;
  window.setTimeout(() => {
    elements.renameInput.focus();
    const extensionStart = state.fileName.lastIndexOf(".");
    elements.renameInput.setSelectionRange(0, extensionStart > 0 ? extensionStart : state.fileName.length);
  }, 0);
}

function closeRenameDialog() {
  elements.renameDialog.hidden = true;
}

async function renameCurrentFile(newName) {
  const trimmedName = newName.trim();
  if (!trimmedName) {
    showToast(t("renameInvalid"));
    return;
  }

  if (!state.filePath || state.isHelpOpen) {
    showToast(t("renameUnavailable"));
    return;
  }

  if (state.markdown !== state.savedMarkdown && !(await confirmIfDirty())) {
    return;
  }

  if (!window.marknote?.renameFile) {
    showToast(t("renameUnavailable"));
    return;
  }

  let result;
  const oldPath = state.filePath;
  try {
    result = await window.marknote.renameFile({
      filePath: state.filePath,
      newName: trimmedName
    });
  } catch {
    showToast(t("renameInvalid"));
    return;
  }

  if (!result?.ok) {
    showToast(result?.error === "exists" ? t("renameExists") : t("renameInvalid"));
    return;
  }

  state.filePath = result.filePath;
  state.fileName = result.fileName;
  state.saveStatus = "saved";
  state.recentFiles = state.recentFiles.filter((file) => file.filePath !== oldPath);
  rememberRecentFile(result);
  clearDraft();
  closeRenameDialog();
  render();
  showToast(t("renameSuccess"));
}

async function switchToRecentFile(file) {
  if (!file?.filePath) return;

  if (state.isHelpOpen) {
    closeHelp();
  }

  if (file.filePath === state.filePath) {
    closeRecentPanel();
    return;
  }

  if (!(await confirmIfDirty())) return;

  try {
    if (!window.marknote?.openFilePath) {
      showToast(t("fileMissing"));
      return;
    }

    const opened = await window.marknote.openFilePath(file.filePath);
    state.markdown = opened.content;
    state.savedMarkdown = opened.content;
    state.filePath = opened.filePath;
    state.fileName = opened.fileName;
    state.activeHeadingId = "";
    state.recentOpen = false;
    state.saveStatus = "saved";
    elements.editor.value = state.markdown;
    syncWysiwygSoon();
    rememberRecentFile(opened);
    clearDraft();
    render();
    playContentFade();
  } catch {
    forgetRecentFile(file.filePath);
    state.recentOpen = true;
    render();
    showToast(t("fileMissing"));
  }
}

function headingHasChildren(index) {
  const heading = state.headings[index];
  const next = state.headings[index + 1];
  return Boolean(next && next.level > heading.level);
}

function isHiddenByCollapsedParent(index) {
  const heading = state.headings[index];
  let currentLevel = heading.level;
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const possibleParent = state.headings[cursor];
    if (possibleParent.level < currentLevel) {
      if (state.collapsedHeadings.has(possibleParent.id)) {
        return true;
      }
      currentLevel = possibleParent.level;
      if (currentLevel === 1) break;
    }
  }
  return false;
}

function hasFollowingSibling(index) {
  const heading = state.headings[index];
  for (let cursor = index + 1; cursor < state.headings.length; cursor += 1) {
    const candidate = state.headings[cursor];
    if (candidate.level < heading.level) return false;
    if (candidate.level === heading.level) return true;
  }
  return false;
}

function outlineGlyph(index, hasChildren, isCollapsed) {
  const heading = state.headings[index];
  if (heading.level === 1) {
    if (hasChildren) return isCollapsed ? "▸" : "▾";
    return "•";
  }
  return hasFollowingSibling(index) ? "├─" : "└─";
}

function toggleHeadingCollapse(headingId) {
  if (state.collapsedHeadings.has(headingId)) {
    state.collapsedHeadings.delete(headingId);
  } else {
    state.collapsedHeadings.add(headingId);
  }
  playOutlineAnimation();
  renderOutline();
}

function playOutlineAnimation() {
  elements.outlineList.classList.remove("outlineAnimating");
  void elements.outlineList.offsetWidth;
  elements.outlineList.classList.add("outlineAnimating");
}

function updateStatus() {
  const lines = state.markdown.split("\n").length;
  const words = state.markdown.trim() ? state.markdown.trim().split(/\s+/).length : 0;
  const chars = state.markdown.length;
  const active = state.headings.find((heading) => heading.id === state.activeHeadingId);
  const isDirty = state.markdown !== state.savedMarkdown;

  elements.lineCount.textContent = `${lines} ${t("lines")}`;
  elements.wordCount.textContent = `${words} ${t("words")}`;
  elements.charCount.textContent = `${chars} ${t("characters")}`;
  elements.currentHeading.textContent = active ? active.text : t("noHeading");
  elements.saveStatus.textContent = saveStatusText(isDirty);
  elements.saveStatus.className = `saveState ${isDirty ? "dirty" : "saved"}`;
  elements.fileName.textContent = state.fileName;
  elements.currentFileButton.title = state.filePath || state.fileName;
  elements.dirtyFlag.textContent = t("edited");
  elements.dirtyFlag.hidden = !isDirty;
}

function saveStatusText(isDirty) {
  if (state.saveStatus === "saving") return t("saving");
  if (state.saveStatus === "draft" && isDirty) return t("draftSaved");
  if (isDirty) return t("dirtyStatus");
  return t("saved");
}

function applyLanguage() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.title = t(node.dataset.i18nTitle);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });

  elements.themeLabel.textContent = t(`theme${capitalize(state.preferences.theme)}`);
  elements.viewModeLabel.textContent = t(`view${capitalize(state.preferences.viewMode)}`);
  elements.languageSelect.value = state.preferences.language;
  elements.themeSelect.value = state.preferences.theme;
}

function applyPreferences() {
  document.documentElement.dataset.theme = state.preferences.theme;
  elements.workspace.classList.toggle("wysiwygMode", state.preferences.viewMode === "wysiwyg");
  elements.workspace.classList.toggle("previewHidden", state.preferences.viewMode === "edit" || state.preferences.viewMode === "wysiwyg");
  elements.workspace.classList.toggle("readingMode", state.preferences.viewMode === "reading");
  elements.workspace.classList.toggle("aiMode", state.aiOpen);
  elements.viewModeToggle.classList.toggle("active", state.preferences.viewMode !== "edit");
  elements.viewModeToggle.disabled = state.aiOpen;
  renderViewModeIcon(state.preferences.viewMode);
  elements.themeToggle.classList.toggle("active", state.preferences.theme !== "light");
  elements.editor.classList.toggle("wrap", state.preferences.wordWrap);
  elements.wysiwygEditor.classList.toggle("wrap", state.preferences.wordWrap);
  elements.editor.readOnly = state.isHelpOpen;
  elements.closeHelpButton.hidden = !state.isHelpOpen;
  elements.saveButton.hidden = state.isHelpOpen;
  elements.settingsPanel.hidden = !state.settingsOpen;
  elements.settingsToggle.classList.toggle("active", state.settingsOpen);
  elements.wrapSetting.checked = state.preferences.wordWrap;
  elements.taskBracketSetting.checked = state.preferences.taskBracketCompat;
  applyLanguage();
}

function render() {
  state.headings = extractHeadings(state.markdown);
  state.collapsedHeadings.forEach((headingId) => {
    if (!state.headings.some((heading) => heading.id === headingId)) {
      state.collapsedHeadings.delete(headingId);
    }
  });
  if (!state.headings.some((heading) => heading.id === state.activeHeadingId)) {
    state.activeHeadingId = state.headings[0]?.id || "";
  }

  renderPreview();
  renderOutline();
  renderRecentFiles();
  renderFileContextMenu();
  updateStatus();
  applyPreferences();
  renderAiPanel();
}

function setPreference(key, value) {
  state.preferences[key] = value;
  savePreferences();
  render();
  if (key === "wordWrap") {
    playWrapAnimation();
  }
}

function setLanguage(language) {
  setPreference("language", languages.includes(language) ? language : defaultPreferences.language);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function viewModeIcon(mode) {
  if (mode === "edit") return "✎";
  if (mode === "reading") return "◱";
  return "◐";
}

function defaultModeIconSvg() {
  return `
    <svg class="modeIconSvg" viewBox="0 0 108 88" aria-hidden="true" focusable="false">
      <path class="modeIconMain" d="M22 10H78Q90 10 90 22V62Q90 74 78 74H22Q10 74 10 62V22Q10 10 22 10Z" />
      <path class="modeIconMain thin" d="M28 30H66" />
      <path class="modeIconMain thin" d="M28 48H56" />
      <path class="modeIconAccent" d="M64 58L76 46L92 62" />
    </svg>
  `;
}

function renderViewModeIcon(mode) {
  if (mode === "wysiwyg") {
    elements.viewModeIcon.innerHTML = defaultModeIconSvg();
    return;
  }

  elements.viewModeIcon.textContent = viewModeIcon(mode);
}

function setTheme(theme) {
  setPreference("theme", themes.includes(theme) ? theme : "light");
}

async function setViewMode(mode) {
  const previousMode = state.preferences.viewMode;
  const nextMode = viewModes.includes(mode) ? mode : "preview";
  if (previousMode === nextMode) return;

  if (previousMode === "wysiwyg") {
    await syncStateFromWysiwyg();
  }
  if (nextMode === "wysiwyg") {
    await syncWysiwygFromState();
  }

  playViewModeTransition(previousMode, nextMode, () => {
    state.preferences.viewMode = nextMode;
    savePreferences();
    render();
    if (nextMode === "wysiwyg") {
      state.wysiwyg?.focus();
    }
    window.requestAnimationFrame(scheduleActiveHeadingFromScroll);
  });
}

function cycleViewMode() {
  if (state.aiOpen) {
    setViewMode("wysiwyg");
    return;
  }

  const currentIndex = viewModes.indexOf(state.preferences.viewMode);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % viewModes.length;
  setViewMode(viewModes[nextIndex]);
}

function cycleTheme() {
  const currentIndex = themes.indexOf(state.preferences.theme);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % themes.length;
  setTheme(themes[nextIndex]);
}

function jumpToHeading(heading) {
  state.activeHeadingId = heading.id;
  renderOutline();
  updateStatus();

  if (state.preferences.viewMode === "wysiwyg") {
    state.wysiwyg?.scrollToHeading(heading);
    return;
  }

  const lines = state.markdown.split("\n");
  const start = lines.slice(0, heading.line).join("\n").length + (heading.line > 0 ? 1 : 0);
  elements.editor.focus();
  elements.editor.setSelectionRange(start, start);
  elements.editor.scrollTo({
    top: Math.max(0, heading.line * 24 - 72),
    behavior: "smooth"
  });

  const target = elements.preview.querySelector(`#${CSS.escape(heading.id)}`);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function confirmIfDirty() {
  if (state.markdown === state.savedMarkdown) {
    return true;
  }

  const payload = {
    title: t("unsavedTitle"),
    message: t("unsavedMessage"),
    detail: t("unsavedDetail"),
    buttons: [t("saveChanges"), t("discardChanges"), t("cancel")]
  };

  let choice = "cancel";
  if (window.marknote?.confirmUnsavedChanges) {
    choice = await window.marknote.confirmUnsavedChanges(payload);
  } else {
    choice = window.confirm(`${payload.message}\n\n${payload.detail}`) ? "save" : "cancel";
  }

  if (choice === "save") {
    return saveFile();
  }

  return choice === "discard";
}

async function openFile() {
  if (state.isHelpOpen) {
    closeHelp();
  }
  if (!(await confirmIfDirty())) return false;

  if (window.marknote?.openFile) {
    const file = await window.marknote.openFile();
    if (!file) return false;
    state.markdown = file.content;
    state.savedMarkdown = file.content;
    state.filePath = file.filePath;
    state.fileName = file.fileName;
    state.activeHeadingId = "";
    state.saveStatus = "saved";
    elements.editor.value = state.markdown;
    syncWysiwygSoon();
    rememberRecentFile(file);
    clearDraft();
    render();
    playContentFade();
    return true;
  }

  elements.browserFileInput.click();
  return true;
}

async function saveFile() {
  if (state.isHelpOpen) return false;

  if (window.marknote?.saveFile) {
    state.saveStatus = "saving";
    updateStatus();
    const result = await window.marknote.saveFile({
      filePath: state.filePath,
      content: state.markdown
    });
    if (!result) {
      state.saveStatus = state.markdown === state.savedMarkdown ? "saved" : "dirty";
      updateStatus();
      return false;
    }
    state.filePath = result.filePath;
    state.fileName = result.fileName;
    state.savedMarkdown = state.markdown;
    state.saveStatus = "saved";
    rememberRecentFile(result);
    clearDraft();
    render();
    showToast(t("saveSuccess"));
    return true;
  }

  const blob = new Blob([state.markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = state.fileName || t("untitled");
  link.click();
  URL.revokeObjectURL(url);
  state.savedMarkdown = state.markdown;
  state.saveStatus = "saved";
  clearDraft();
  render();
  showToast(t("saveSuccess"));
  return true;
}

async function saveFileAs() {
  closeFileContextMenu();
  if (state.isHelpOpen) return false;

  if (!window.marknote?.saveFileAs) {
    return saveFile();
  }

  state.saveStatus = "saving";
  updateStatus();
  const result = await window.marknote.saveFileAs({
    filePath: state.filePath,
    fileName: state.fileName,
    content: state.markdown
  });
  if (!result) {
    state.saveStatus = state.markdown === state.savedMarkdown ? "saved" : "dirty";
    updateStatus();
    return false;
  }

  state.filePath = result.filePath;
  state.fileName = result.fileName;
  state.savedMarkdown = state.markdown;
  state.saveStatus = "saved";
  rememberRecentFile(result);
  clearDraft();
  closeFileContextMenu();
  render();
  showToast(t("saveAsSuccess"));
  return true;
}

async function exportPdf() {
  closeFileContextMenu();
  if (state.isHelpOpen) return false;

  if (!window.marknote?.exportPdf) {
    showToast(t("exportPdfUnavailable"));
    return false;
  }

  renderPreview();
  const result = await window.marknote.exportPdf({
    html: elements.preview.innerHTML,
    fileName: state.fileName,
    theme: state.preferences.theme
  });
  if (!result) return false;

  showToast(t("exportSuccess"));
  return true;
}

async function showCurrentFileInFolder() {
  closeFileContextMenu();
  if (!state.filePath || !window.marknote?.showInFolder) {
    showToast(t("showUnavailable"));
    return false;
  }

  await window.marknote.showInFolder(state.filePath);
  return true;
}

async function deleteCurrentFile() {
  closeFileContextMenu();
  if (!state.filePath || !window.marknote?.deleteFile) {
    showToast(t("deleteUnavailable"));
    return false;
  }

  if (state.markdown !== state.savedMarkdown && !(await confirmIfDirty())) {
    return false;
  }

  const payload = {
    title: t("deleteTitle"),
    message: t("deleteMessage"),
    detail: t("deleteDetail"),
    buttons: [t("deleteConfirm"), t("cancel")]
  };
  const choice = window.marknote?.confirmDeleteFile
    ? await window.marknote.confirmDeleteFile(payload)
    : window.confirm(`${payload.message}\n\n${payload.detail}`) ? "delete" : "cancel";
  if (choice !== "delete") return false;

  const deletedPath = state.filePath;
  const result = await window.marknote.deleteFile({ filePath: state.filePath });
  if (!result?.ok) return false;

  forgetRecentFile(deletedPath);
  state.filePath = "";
  state.fileName = t("untitled");
  state.savedMarkdown = "";
  state.saveStatus = "dirty";
  render();
  scheduleDraftSave();
  showToast(t("deleteSuccess"));
  return true;
}

async function newNote() {
  if (state.isHelpOpen) {
    closeHelp();
  }
  if (!(await confirmIfDirty())) return;

  state.markdown = `# ${t("untitledHeading")}\n\n${t("startWriting")}\n`;
  state.savedMarkdown = "";
  state.filePath = "";
  state.fileName = t("untitled");
  state.activeHeadingId = "";
  state.saveStatus = "dirty";
  elements.editor.value = state.markdown;
  syncWysiwygSoon();
  render();
  scheduleDraftSave();
  playContentFade();
}

async function openHelp() {
  if (state.isHelpOpen) {
    state.settingsOpen = false;
    render();
    return;
  }

  state.helpSnapshot = {
    markdown: state.markdown,
    savedMarkdown: state.savedMarkdown,
    filePath: state.filePath,
    fileName: state.fileName,
    activeHeadingId: state.activeHeadingId,
    collapsedHeadings: new Set(state.collapsedHeadings),
    preferences: { ...state.preferences }
  };

  const readme = await loadReadme();
  state.isHelpOpen = true;
  state.markdown = readme.content;
  state.savedMarkdown = readme.content;
  state.filePath = readme.filePath;
  state.fileName = readme.fileName;
  state.activeHeadingId = "";
  state.collapsedHeadings = new Set();
  state.settingsOpen = false;
  state.preferences.viewMode = "reading";
  elements.editor.value = state.markdown;
  syncWysiwygSoon();
  render();
  playReadingAnimation(true);
}

async function loadReadme() {
  if (window.marknote?.openReadme) {
    return window.marknote.openReadme();
  }

  const response = await fetch("../README.md");
  if (response.ok) {
    return {
      filePath: "../README.md",
      fileName: "README.md",
      content: await response.text()
    };
  }

  return {
    filePath: "",
    fileName: "README.md",
    content: "# MarkNote\n\nREADME.md could not be loaded in this preview environment."
  };
}

function closeHelp() {
  if (!state.helpSnapshot) return;

  const snapshot = state.helpSnapshot;
  state.markdown = snapshot.markdown;
  state.savedMarkdown = snapshot.savedMarkdown;
  state.filePath = snapshot.filePath;
  state.fileName = snapshot.fileName;
  state.activeHeadingId = snapshot.activeHeadingId;
  state.collapsedHeadings = new Set(snapshot.collapsedHeadings);
  state.preferences = { ...snapshot.preferences };
  state.helpSnapshot = null;
  state.isHelpOpen = false;
  elements.editor.value = state.markdown;
  syncWysiwygSoon();
  render();
  playContentFade();
}

function playContentFade() {
  elements.workspace.classList.remove("contentFadeIn");
  void elements.workspace.offsetWidth;
  elements.workspace.classList.add("contentFadeIn");
}

function playPreviewAnimation() {
  elements.previewPane.classList.remove("previewFadeIn");
  void elements.previewPane.offsetWidth;
  elements.previewPane.classList.add("previewFadeIn");
}

function playReadingAnimation(enabled) {
  elements.workspace.classList.remove("readingModeIn", "readingModeOut");
  void elements.workspace.offsetWidth;
  elements.workspace.classList.add(enabled ? "readingModeIn" : "readingModeOut");
}

function playViewModeTransition(fromMode, toMode, applyMode) {
  const workspace = elements.workspace;
  const transitionClass = `mode-${fromMode}-to-${toMode}`;
  workspace.classList.remove(
    "mode-edit-to-preview",
    "mode-edit-to-reading",
    "mode-edit-to-wysiwyg",
    "mode-preview-to-edit",
    "mode-preview-to-reading",
    "mode-preview-to-wysiwyg",
    "mode-reading-to-edit",
    "mode-reading-to-preview",
    "mode-reading-to-wysiwyg",
    "mode-wysiwyg-to-edit",
    "mode-wysiwyg-to-preview",
    "mode-wysiwyg-to-reading"
  );
  applyMode();
  void workspace.offsetWidth;
  workspace.classList.add(transitionClass);
  window.setTimeout(() => {
    workspace.classList.remove(transitionClass);
  }, 240);
}

function playWrapAnimation() {
  elements.editor.classList.remove("wrapPulse");
  void elements.editor.offsetWidth;
  elements.editor.classList.add("wrapPulse");
}

function playAiLayoutAnimation(enabled) {
  elements.workspace.classList.remove("aiModeIn", "aiModeOut");
  void elements.workspace.offsetWidth;
  elements.workspace.classList.add(enabled ? "aiModeIn" : "aiModeOut");
  window.setTimeout(() => {
    elements.workspace.classList.remove("aiModeIn", "aiModeOut");
  }, 260);
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  elements.toast.classList.remove("show");
  void elements.toast.offsetWidth;
  elements.toast.classList.add("show");
  state.toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("show");
    window.setTimeout(() => {
      elements.toast.hidden = true;
    }, 180);
  }, 1800);
}

function syncPreviewScroll() {
  if (state.preferences.viewMode === "edit" || Date.now() < state.previewManualUntil) {
    return;
  }

  const editorMax = elements.editor.scrollHeight - elements.editor.clientHeight;
  const previewMax = elements.previewPane.scrollHeight - elements.previewPane.clientHeight;
  if (editorMax <= 0 || previewMax <= 0) return;

  const ratio = elements.editor.scrollTop / editorMax;
  state.syncingPreviewScroll = true;
  elements.previewPane.scrollTop = ratio * previewMax;
  window.setTimeout(() => {
    state.syncingPreviewScroll = false;
  }, 80);
}

function shortcutMatches(event, key) {
  const modifier = isMac ? event.metaKey : event.ctrlKey;
  return modifier && !event.altKey && event.key.toLowerCase() === key;
}

function bindShortcuts() {
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (state.recentOpen) {
        closeRecentPanel();
      }
      if (state.fileContextOpen) {
        closeFileContextMenu();
      }
      if (state.editorContextOpen) {
        closeEditorContextMenu();
      }
      if (!elements.renameDialog.hidden) {
        closeRenameDialog();
      }
      if (state.settingsOpen) {
        state.settingsOpen = false;
        render();
      }
      if (state.aiOpen) {
        closeAiPanel();
      }
      return;
    }

    if (shortcutMatches(event, "s")) {
      event.preventDefault();
      if (state.isHelpOpen) return;
      if (event.shiftKey) {
        saveFileAs();
      } else {
        saveFile();
      }
      return;
    }

    if (shortcutMatches(event, "e")) {
      event.preventDefault();
      exportPdf();
      return;
    }

    if (shortcutMatches(event, "o")) {
      event.preventDefault();
      openFile();
      return;
    }

    if (shortcutMatches(event, "n")) {
      event.preventDefault();
      newNote();
      return;
    }

    if (shortcutMatches(event, "p")) {
      event.preventDefault();
      cycleViewMode();
      return;
    }

    if (shortcutMatches(event, "d")) {
      event.preventDefault();
      cycleTheme();
      return;
    }

  if (shortcutMatches(event, "l")) {
      event.preventDefault();
      setPreference("wordWrap", !state.preferences.wordWrap);
      return;
    }

  });
}

function bindEvents() {
  elements.editor.addEventListener("input", (event) => {
    state.markdown = event.target.value;
    applyTaskBracketConversion();
    render();
    scheduleDraftSave();
  });

  elements.editor.addEventListener("scroll", () => {
    syncPreviewScroll();
    if (state.preferences.viewMode === "edit") {
      scheduleActiveHeadingFromScroll();
    }
  });
  bindTextareaSelectionScrollGuard(elements.editor);

  elements.previewPane.addEventListener("scroll", () => {
    if (!state.syncingPreviewScroll) {
      state.previewManualUntil = Date.now() + 1200;
    }
    if (state.preferences.viewMode === "preview" || state.preferences.viewMode === "reading") {
      scheduleActiveHeadingFromScroll();
    }
  });
  elements.wysiwygEditor.addEventListener("scroll", () => {
    if (state.preferences.viewMode === "wysiwyg") {
      scheduleActiveHeadingFromScroll();
    }
  });

  elements.newButton.addEventListener("click", newNote);
  elements.openButton.addEventListener("click", openFile);
  elements.saveButton.addEventListener("click", saveFile);
  elements.closeHelpButton.addEventListener("click", closeHelp);
  elements.currentFileButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleRecentPanel();
  });
  elements.currentFileButton.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openFileContextMenu();
  });
  [elements.editor, elements.wysiwygEditor, elements.previewPane].forEach((editorSurface) => {
    editorSurface.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openEditorContextMenu(event);
    });
  });
  elements.editorContextMenu.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });
  elements.editorContextMenu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-editor-action]");
    if (!button || button.disabled) return;
    handleEditorContextAction(button.dataset.editorAction);
  });
  elements.renameFileButton.addEventListener("click", openRenameDialog);
  elements.saveAsButton.addEventListener("click", saveFileAs);
  elements.exportPdfButton.addEventListener("click", exportPdf);
  elements.showFileButton.addEventListener("click", showCurrentFileInFolder);
  elements.deleteFileButton.addEventListener("click", deleteCurrentFile);
  elements.renameCancelButton.addEventListener("click", closeRenameDialog);
  elements.renameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renameCurrentFile(elements.renameInput.value);
  });
  elements.renameDialog.addEventListener("click", (event) => {
    if (event.target === elements.renameDialog) {
      closeRenameDialog();
    }
  });
  elements.viewModeToggle.addEventListener("click", () => {
    cycleViewMode();
  });
  elements.themeToggle.addEventListener("click", () => {
    cycleTheme();
  });
  elements.aiToggle.addEventListener("click", toggleAiPanel);
  elements.aiCloseButton.addEventListener("click", closeAiPanel);
  elements.aiForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendAiMessage(elements.aiInput.value);
  });
  elements.aiInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return;

    if (!event.isComposing) {
      event.preventDefault();
      sendAiMessage(elements.aiInput.value);
    }
  });
  elements.aiPane.querySelectorAll("[data-ai-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      sendAiMessage(aiPromptFor(button.dataset.aiPrompt));
    });
  });
  elements.aiMessages.addEventListener("click", (event) => {
    const applyButton = event.target.closest("[data-ai-apply]");
    const copyButton = event.target.closest("[data-ai-copy]");
    const discardButton = event.target.closest("[data-ai-discard]");
    if (applyButton) {
      applyAiDraft(applyButton.dataset.aiApply);
    } else if (copyButton) {
      copyAiDraft(copyButton.dataset.aiCopy);
    } else if (discardButton) {
      discardAiDraft(discardButton.dataset.aiDiscard);
    }
  });
  elements.settingsToggle.addEventListener("click", () => {
    state.settingsOpen = !state.settingsOpen;
    render();
  });
  elements.languageSelect.addEventListener("change", (event) => {
    setLanguage(event.target.value);
  });
  elements.themeSelect.addEventListener("change", (event) => {
    setTheme(event.target.value);
  });
  elements.wrapSetting.addEventListener("change", (event) => {
    setPreference("wordWrap", event.target.checked);
  });
  elements.taskBracketSetting.addEventListener("change", (event) => {
    setPreference("taskBracketCompat", event.target.checked);
    if (event.target.checked && applyTaskBracketConversion()) {
      syncWysiwygSoon();
      render();
      scheduleDraftSave();
    }
  });
  elements.aiProviderSelect.addEventListener("change", (event) => {
    setAiProvider(event.target.value);
  });
  elements.aiModelSelect.addEventListener("change", (event) => {
    setAiModel(event.target.value);
  });
  elements.aiBaseUrlInput.addEventListener("change", (event) => {
    setAiBaseUrl(event.target.value);
  });
  elements.aiApiKeyInput.addEventListener("change", (event) => {
    setAiKey(event.target.value);
  });
  elements.helpButton.addEventListener("click", openHelp);

  document.addEventListener("click", (event) => {
    if (
      state.settingsOpen &&
      !elements.settingsPanel.contains(event.target) &&
      !elements.settingsToggle.contains(event.target)
    ) {
      state.settingsOpen = false;
      render();
    }

    if (
      state.recentOpen &&
      !elements.fileSwitcher.contains(event.target)
    ) {
      closeRecentPanel();
    }

    if (
      state.fileContextOpen &&
      !elements.fileContextMenu.contains(event.target) &&
      !elements.currentFileButton.contains(event.target)
    ) {
      closeFileContextMenu();
    }

    if (
      state.editorContextOpen &&
      !elements.editorContextMenu.contains(event.target)
    ) {
      closeEditorContextMenu();
    }
  });

  elements.browserFileInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    state.markdown = content;
    state.savedMarkdown = content;
    state.filePath = "";
    state.fileName = file.name;
    state.activeHeadingId = "";
    state.saveStatus = "saved";
    elements.editor.value = state.markdown;
    syncWysiwygSoon();
    clearDraft();
    render();
    playContentFade();
    event.target.value = "";
  });

  window.marknote?.onRequestClose?.(async () => {
    if (state.isHelpOpen) {
      closeHelp();
    }
    if (await confirmIfDirty()) {
      window.marknote.closeWindow();
    }
  });

  bindShortcuts();
}

async function boot() {
  elements.editor.value = state.markdown;
  bindEvents();
  render();
  await initWysiwygEditor();
  await restoreDraftIfNeeded();
  if (state.preferences.viewMode === "wysiwyg") {
    await syncWysiwygFromState();
  }
}

boot();
