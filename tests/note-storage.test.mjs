import assert from "node:assert/strict";
import test from "node:test";
import { createNoteRepository } from "../shared/note-storage.mjs";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  const writes = [];
  return {
    writes,
    getItem: (key) => values.get(key) ?? null,
    setItem(key, value) {
      values.set(key, String(value));
      writes.push(key);
    },
    removeItem: (key) => values.delete(key)
  };
}

function repository(storage) {
  return createNoteRepository(storage, {
    indexKey: "index",
    itemPrefix: "note.",
    migrationKey: "migrated",
    legacyKeys: ["legacy"],
    normalize: (note) => ({ ...note, content: String(note.content || "") }),
    sort: (notes) => [...notes].sort((a, b) => a.id.localeCompare(b.id))
  });
}

test("migrates the legacy array into individually stored notes", () => {
  const storage = memoryStorage({ legacy: JSON.stringify([{ id: "b", content: "B" }, { id: "a", content: "A" }]) });
  assert.deepEqual(repository(storage).list().map((note) => note.id), ["a", "b"]);
  assert.ok(storage.getItem("note.a"));
  assert.ok(storage.getItem("note.b"));
  assert.deepEqual(JSON.parse(storage.getItem("index")), ["a", "b"]);
  assert.equal(storage.getItem("legacy"), null);
});

test("updating one note does not rewrite every note body", () => {
  const storage = memoryStorage();
  const notes = repository(storage);
  notes.saveAll([{ id: "a", content: "A" }, { id: "b", content: "B" }]);
  storage.writes.length = 0;
  notes.save({ id: "a", content: "A2" });
  assert.ok(storage.writes.includes("note.a"));
  assert.equal(storage.writes.includes("note.b"), false);
  assert.equal(notes.list().find((note) => note.id === "a").content, "A2");
});
