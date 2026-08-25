const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { refreshLibraryPaths, scanLibrary } = require("../electron/library-index.cjs");

test("refreshes only changed Markdown paths and reports deleted notes", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-index-"));
  try {
    await fs.mkdir(path.join(root, "course"));
    await fs.writeFile(path.join(root, "course", "one.md"), "# One");
    await fs.writeFile(path.join(root, "two.md"), "# Two");
    const initial = await scanLibrary(root);
    assert.deepEqual(initial.notes.map((note) => note.relativePath).sort(), ["course/one.md", "two.md"]);

    await fs.writeFile(path.join(root, "course", "one.md"), "# Updated");
    await fs.rm(path.join(root, "two.md"));
    const patch = await refreshLibraryPaths(root, ["course/one.md", "two.md"]);
    assert.equal(patch.full, false);
    assert.equal(patch.notes[0].content, "# Updated");
    assert.deepEqual(patch.removedPaths, ["two.md"]);
    assert.deepEqual(patch.folders, ["course"]);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("falls back to a full scan for directory or unknown changes", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-index-full-"));
  try {
    await fs.writeFile(path.join(root, "note.md"), "# Note");
    assert.equal((await refreshLibraryPaths(root, ["folder"])).full, true);
    assert.equal((await refreshLibraryPaths(root, [])).full, true);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
