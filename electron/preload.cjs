const { contextBridge, ipcRenderer } = require("electron");

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
  askAi: (payload) => ipcRenderer.invoke("ai:complete", payload),
  confirmUnsavedChanges: (payload) => ipcRenderer.invoke("dialog:confirm-unsaved", payload),
  confirmDraftRestore: (payload) => ipcRenderer.invoke("dialog:confirm-draft-restore", payload),
  confirmDeleteFile: (payload) => ipcRenderer.invoke("dialog:confirm-delete-file", payload),
  closeWindow: () => ipcRenderer.send("window:close-confirmed"),
  onRequestClose: (callback) => {
    ipcRenderer.on("app:request-close", callback);
  },
  platform: process.platform
});
