export const noteSyncStates = {
  synced: "synced",
  pending: "pending",
  conflict: "conflict",
  error: "error"
};

export function createEmptyNote() {
  const now = new Date().toISOString();
  return {
    id: `local-${crypto.randomUUID()}`,
    title: "未命名笔记",
    content: "# 未命名笔记\n\n从这里开始写。",
    created_at: now,
    updated_at: now,
    deleted_at: null,
    lastSyncedAt: "",
    syncState: noteSyncStates.pending
  };
}

export function titleFromMarkdown(markdown = "") {
  const firstHeading = String(markdown)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^#{1,6}\s+/.test(line));
  if (firstHeading) {
    return firstHeading.replace(/^#{1,6}\s+/, "").replace(/[*_`~]/g, "").trim().slice(0, 80) || "未命名笔记";
  }

  const firstText = String(markdown)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  return firstText ? firstText.replace(/[#*_`~>-]/g, "").trim().slice(0, 80) || "未命名笔记" : "未命名笔记";
}

export function normalizeRemoteNote(note) {
  return {
    id: note.id,
    title: note.title || titleFromMarkdown(note.content || ""),
    content: note.content || "",
    created_at: note.created_at,
    updated_at: note.updated_at,
    deleted_at: note.deleted_at || null,
    lastSyncedAt: note.updated_at || new Date().toISOString(),
    syncState: noteSyncStates.synced
  };
}

export function sortNotes(notes) {
  return [...notes].sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
}

export function mergeRemoteNotes(localNotes, remoteNotes) {
  const merged = new Map();
  remoteNotes.map(normalizeRemoteNote).forEach((note) => merged.set(note.id, note));

  localNotes.forEach((note) => {
    if (note.deleted_at) return;
    if (note.syncState === noteSyncStates.pending || note.syncState === noteSyncStates.conflict || note.id.startsWith("local-")) {
      merged.set(note.id, note);
    }
  });

  return sortNotes([...merged.values()].filter((note) => !note.deleted_at));
}

export function noteWordCount(markdown = "") {
  const text = String(markdown).replace(/[#>*_`\-[\]()]/g, " ").trim();
  return text ? text.split(/\s+/).length : 0;
}
