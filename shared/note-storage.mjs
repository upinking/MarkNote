export function createNoteRepository(storage, options) {
  const { indexKey, itemPrefix, migrationKey, legacyKeys = [], normalize, sort } = options;
  const itemKey = (id) => `${itemPrefix}${encodeURIComponent(id)}`;
  const readJson = (key, fallback) => {
    try {
      return JSON.parse(storage.getItem(key) || "") ?? fallback;
    } catch {
      return fallback;
    }
  };
  const readIds = () => {
    const value = readJson(indexKey, []);
    return Array.isArray(value) ? value.filter((id) => typeof id === "string" && id) : [];
  };
  const persistAll = (notes) => {
    const next = sort(notes.map(normalize));
    const nextIds = new Set(next.map((note) => note.id));
    for (const oldId of readIds()) {
      if (!nextIds.has(oldId)) storage.removeItem(itemKey(oldId));
    }
    for (const note of next) storage.setItem(itemKey(note.id), JSON.stringify(note));
    storage.setItem(indexKey, JSON.stringify(next.map((note) => note.id)));
    return next;
  };
  const migrate = () => {
    if (storage.getItem(migrationKey)) return;
    if (!readIds().length) {
      for (const key of legacyKeys) {
        const notes = readJson(key, []);
        if (Array.isArray(notes) && notes.length) {
          persistAll(notes);
          break;
        }
      }
    }
    for (const key of legacyKeys) storage.removeItem(key);
    storage.setItem(migrationKey, "1");
  };

  return {
    list() {
      migrate();
      return sort(readIds()
        .map((id) => {
          const note = readJson(itemKey(id), null);
          return note ? { ...note, id: note.id || id } : null;
        })
        .filter(Boolean)
        .map(normalize));
    },
    save(note) {
      migrate();
      const normalized = normalize(note);
      storage.setItem(itemKey(normalized.id), JSON.stringify(normalized));
      const next = sort([normalized, ...this.list().filter((item) => item.id !== normalized.id)]);
      storage.setItem(indexKey, JSON.stringify(next.map((item) => item.id)));
      return next;
    },
    delete(id) {
      migrate();
      storage.removeItem(itemKey(id));
      const next = this.list().filter((note) => note.id !== id);
      storage.setItem(indexKey, JSON.stringify(next.map((note) => note.id)));
      return next;
    },
    saveAll(notes) {
      migrate();
      return persistAll(notes);
    }
  };
}
