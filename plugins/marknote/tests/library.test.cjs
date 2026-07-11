const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const {
  MarkNoteError,
  archiveNote,
  createNote,
  listNotes,
  normalizeRelativePath,
  readNote,
  resolveLibraryRoot,
  searchNotes,
  updateNote
} = require("../mcp/library.cjs");

async function withLibrary(run) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-plugin-"));
  try {
    await run(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

test("normalizes safe Markdown paths and rejects traversal", () => {
  assert.equal(normalizeRelativePath("课程/物理", { addMarkdownExtension: true }), "课程/物理.md");
  assert.throws(() => normalizeRelativePath("../秘密.md"), (error) => error.code === "invalid_path");
  assert.throws(() => normalizeRelativePath("/tmp/秘密.md"), (error) => error.code === "invalid_path");
  assert.throws(() => normalizeRelativePath("C:\\tmp\\秘密.md"), (error) => error.code === "invalid_path");
  assert.throws(() => normalizeRelativePath("图片.png"), (error) => error.code === "invalid_extension");
});

test("discovers the library through MarkNote bridge configuration", async () => {
  await withLibrary(async (root) => {
    const configDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-config-"));
    const configPath = path.join(configDirectory, "codex-bridge.json");
    try {
      await fs.writeFile(configPath, JSON.stringify({ schemaVersion: 1, libraryRoot: root }));
      const resolved = await resolveLibraryRoot({
        env: { MARKNOTE_BRIDGE_CONFIG: configPath },
        platform: "darwin",
        home: configDirectory
      });
      assert.equal(resolved, await fs.realpath(root));
    } finally {
      await fs.rm(configDirectory, { recursive: true, force: true });
    }
  });
});

test("creates, reads, searches, updates and archives notes", async () => {
  await withLibrary(async (root) => {
    const created = await createNote(root, "课程/物理", "# 洛伦兹力\n\n带电粒子会受到磁场作用。");
    assert.equal(created.path, "课程/物理.md");
    assert.equal(created.title, "物理");

    const listed = await listNotes(root);
    assert.deepEqual(listed.map((note) => note.path), ["课程/物理.md"]);
    assert.equal(Object.hasOwn(listed[0], "content"), false);

    const results = await searchNotes(root, "磁场");
    assert.equal(results.length, 1);
    assert.match(results[0].snippet, /磁场/);

    const updated = await updateNote(root, created.path, "# 洛伦兹力\n\n方向由左手定则判断。", created.revision);
    assert.notEqual(updated.revision, created.revision);
    assert.match((await readNote(root, created.path)).content, /左手定则/);

    await assert.rejects(
      updateNote(root, created.path, "旧内容", created.revision),
      (error) => error instanceof MarkNoteError && error.code === "conflict"
    );

    const archived = await archiveNote(root, created.path, updated.revision);
    assert.equal(archived.path, "归档/课程/物理.md");
    assert.equal(archived.archived, true);
    assert.equal((await listNotes(root)).length, 0);
    assert.equal((await listNotes(root, { includeArchived: true })).length, 1);
  });
});

test("does not follow symbolic links outside the library", async (t) => {
  if (process.platform === "win32") t.skip("Creating symlinks requires extra Windows privileges");
  await withLibrary(async (root) => {
    const outside = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-outside-"));
    try {
      await fs.writeFile(path.join(outside, "private.md"), "# Private");
      await fs.symlink(outside, path.join(root, "escape"));
      await assert.rejects(readNote(root, "escape/private.md"), (error) => error.code === "outside_library");
      assert.equal((await listNotes(root, { includeArchived: true })).length, 0);
    } finally {
      await fs.rm(outside, { recursive: true, force: true });
    }
  });
});
