const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("marknote", {
  openFile: () => ipcRenderer.invoke("file:open"),
  openFilePath: (filePath) => ipcRenderer.invoke("file:open-path", filePath),
  saveFile: (payload) => ipcRenderer.invoke("file:save", payload),
  saveFileAs: (payload) => ipcRenderer.invoke("file:save-as", payload),
  renameFile: (payload) => ipcRenderer.invoke("file:rename", payload),
  deleteFile: (payload) => ipcRenderer.invoke("file:delete", payload),
  showInFolder: (filePath) => ipcRenderer.invoke("file:show-in-folder", filePath),
  exportPdf: (payload) => ipcRenderer.invoke("file:export-pdf", payload),
  openReadme: () => ipcRenderer.invoke("file:readme"),
  chooseLibrary: () => ipcRenderer.invoke("library:choose"),
  scanLibrary: (payload) => ipcRenderer.invoke("library:scan", payload),
  createLibraryFolder: (payload) => ipcRenderer.invoke("library:create-folder", payload),
  readLibraryNote: (payload) => ipcRenderer.invoke("library:read", payload),
  saveLibraryNote: (payload) => ipcRenderer.invoke("library:save", payload),
  renameLibraryNote: (payload) => ipcRenderer.invoke("library:rename", payload),
  deleteLibraryNote: (payload) => ipcRenderer.invoke("library:delete", payload),
  importLibraryFiles: (payload) => ipcRenderer.invoke("library:import-files", payload),
  getCodexPluginStatus: () => ipcRenderer.invoke("codex-plugin:status"),
  installCodexPlugin: () => ipcRenderer.invoke("codex-plugin:install"),
  openCodexPlugin: () => ipcRenderer.invoke("codex-plugin:open"),
  chooseAiAttachments: () => ipcRenderer.invoke("ai:choose-attachments"),
  prepareAiAttachments: (filePaths) => ipcRenderer.invoke("ai:prepare-attachments", filePaths),
  pathForFile: (file) => webUtils?.getPathForFile?.(file) || "",
  askAi: (payload) => ipcRenderer.invoke("ai:complete", payload),
  askAiStream: (payload, handlers = {}) => {
    const requestId = `ai-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const onDelta = (_event, message) => {
      if (message?.requestId === requestId) {
        handlers.onDelta?.(message.text || "");
      }
    };
    const onDone = (_event, message) => {
      if (message?.requestId !== requestId) return;
      cleanup();
      handlers.onDone?.(message.result);
    };
    const onError = (_event, message) => {
      if (message?.requestId !== requestId) return;
      cleanup();
      handlers.onError?.(message.error || "AI request failed");
    };
    const cleanup = () => {
      ipcRenderer.removeListener("ai:stream-delta", onDelta);
      ipcRenderer.removeListener("ai:stream-done", onDone);
      ipcRenderer.removeListener("ai:stream-error", onError);
    };

    ipcRenderer.on("ai:stream-delta", onDelta);
    ipcRenderer.on("ai:stream-done", onDone);
    ipcRenderer.on("ai:stream-error", onError);
    ipcRenderer.invoke("ai:stream", { requestId, payload }).catch((error) => {
      cleanup();
      handlers.onError?.(error?.message || "AI request failed");
    });
    return { requestId, cancel: cleanup };
  },
  confirmUnsavedChanges: (payload) => ipcRenderer.invoke("dialog:confirm-unsaved", payload),
  confirmDraftRestore: (payload) => ipcRenderer.invoke("dialog:confirm-draft-restore", payload),
  confirmDeleteFile: (payload) => ipcRenderer.invoke("dialog:confirm-delete-file", payload),
  confirmExternalChange: (payload) => ipcRenderer.invoke("dialog:confirm-external-change", payload),
  closeWindow: () => ipcRenderer.send("window:close-confirmed"),
  onLibraryExternalChange: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("library:external-change", listener);
    return () => ipcRenderer.removeListener("library:external-change", listener);
  },
  onRequestClose: (callback) => {
    ipcRenderer.on("app:request-close", callback);
  },
  platform: process.platform
});
