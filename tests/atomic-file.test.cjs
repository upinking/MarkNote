const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { atomicWriteFile } = require("../electron/atomic-file.cjs");

test("atomically creates and replaces a file without leaving temporary files", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-atomic-"));
  const filePath = path.join(root, "nested", "note.md");
  try {
    await atomicWriteFile(filePath, "first", "utf8");
    await atomicWriteFile(filePath, "second", "utf8");
    assert.equal(await fs.readFile(filePath, "utf8"), "second");
    assert.deepEqual(await fs.readdir(path.dirname(filePath)), ["note.md"]);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
