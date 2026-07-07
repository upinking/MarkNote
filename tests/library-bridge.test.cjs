const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { bridgeFileName, createLibraryWatcher, writeBridgeConfig } = require("../electron/library-bridge.cjs");

test("writes the selected library to the Codex bridge config", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-library-"));
  const userData = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-user-data-"));
  try {
    const result = await writeBridgeConfig(userData, root);
    const config = JSON.parse(await fs.readFile(path.join(userData, bridgeFileName), "utf8"));
    assert.equal(config.schemaVersion, 1);
    assert.equal(config.libraryRoot, await fs.realpath(root));
    assert.equal(result.configPath, path.join(userData, bridgeFileName));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(userData, { recursive: true, force: true });
  }
});

test("coalesces external library changes", { skip: !["darwin", "win32"].includes(process.platform) }, async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-watcher-"));
  let watcher;
  try {
    const change = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Watcher did not report a change")), 3000);
      watcher = createLibraryWatcher(root, (payload) => {
        clearTimeout(timer);
        resolve(payload);
      }, { debounceMs: 30, onError: reject });
    });
    await fs.writeFile(path.join(root, "outside-change.md"), "# External");
    const payload = await change;
    assert.equal(payload.rootPath, path.resolve(root));
    assert.ok(payload.unknownPath || payload.paths.some((entry) => entry.includes("outside-change.md")));
  } finally {
    watcher?.close();
    await fs.rm(root, { recursive: true, force: true });
  }
});
