const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");

const bridgeFileName = "codex-bridge.json";

async function writeBridgeConfig(userDataPath, rootPath) {
  const libraryRoot = await fsp.realpath(path.resolve(String(rootPath || "")));
  const stat = await fsp.stat(libraryRoot);
  if (!stat.isDirectory()) throw new Error("MarkNote library root must be a directory");

  await fsp.mkdir(userDataPath, { recursive: true });
  const configPath = path.join(userDataPath, bridgeFileName);
  const temporaryPath = `${configPath}.${process.pid}.tmp`;
  const config = {
    schemaVersion: 1,
    libraryRoot,
    updatedAt: new Date().toISOString()
  };
  try {
    await fsp.writeFile(temporaryPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
    await fsp.rename(temporaryPath, configPath);
  } finally {
    await fsp.rm(temporaryPath, { force: true }).catch(() => {});
  }
  return { configPath, ...config };
}

function createLibraryWatcher(rootPath, onChange, options = {}) {
  const root = path.resolve(String(rootPath));
  const debounceMs = options.debounceMs ?? 250;
  const changedPaths = new Set();
  let unknownPath = false;
  let timer = null;
  let closed = false;

  const flush = () => {
    timer = null;
    if (closed) return;
    const paths = [...changedPaths];
    changedPaths.clear();
    const payload = { rootPath: root, paths, unknownPath };
    unknownPath = false;
    onChange(payload);
  };

  const watcher = fs.watch(root, { recursive: true }, (_eventType, filename) => {
    if (!filename) {
      unknownPath = true;
    } else {
      const relativePath = String(filename).split(path.sep).join("/");
      if (!relativePath.startsWith(".") && relativePath !== "node_modules") changedPaths.add(relativePath);
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, debounceMs);
  });
  watcher.on("error", (error) => options.onError?.(error));
  watcher.unref?.();

  return {
    close() {
      if (closed) return;
      closed = true;
      if (timer) clearTimeout(timer);
      watcher.close();
    }
  };
}

module.exports = { bridgeFileName, createLibraryWatcher, writeBridgeConfig };
