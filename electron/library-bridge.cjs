const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { atomicWriteFile } = require("./atomic-file.cjs");

const bridgeFileName = "codex-bridge.json";

async function writeBridgeConfig(userDataPath, rootPath) {
  const libraryRoot = await fsp.realpath(path.resolve(String(rootPath || "")));
  const stat = await fsp.stat(libraryRoot);
  if (!stat.isDirectory()) throw new Error("MarkNote library root must be a directory");

  const configPath = path.join(userDataPath, bridgeFileName);
  const config = {
    schemaVersion: 1,
    libraryRoot,
    updatedAt: new Date().toISOString()
  };
  await atomicWriteFile(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
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

  const schedule = (filename) => {
    if (!filename) {
      unknownPath = true;
    } else {
      const relativePath = String(filename).split(path.sep).join("/");
      if (!relativePath.startsWith(".") && relativePath !== "node_modules") changedPaths.add(relativePath);
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, debounceMs);
  };

  let watcher;
  let polling = false;
  const pollListener = (current, previous) => {
    if (current.mtimeMs !== previous.mtimeMs || current.size !== previous.size) schedule();
  };
  const startPolling = (error) => {
    if (polling || closed) return;
    polling = true;
    watcher?.close();
    watcher = null;
    fs.watchFile(root, { interval: options.pollIntervalMs ?? 500, persistent: false }, pollListener);
    schedule();
    options.onFallback?.(error);
  };
  try {
    watcher = fs.watch(root, { recursive: true }, (_eventType, filename) => schedule(filename));
    watcher.on("error", (error) => {
      if (["EMFILE", "ENOSPC", "ERR_FEATURE_UNAVAILABLE_ON_PLATFORM"].includes(error?.code)) startPolling(error);
      else options.onError?.(error);
    });
    watcher.unref?.();
  } catch (error) {
    if (!["EMFILE", "ENOSPC", "ERR_FEATURE_UNAVAILABLE_ON_PLATFORM"].includes(error?.code)) throw error;
    startPolling(error);
  }

  return {
    close() {
      if (closed) return;
      closed = true;
      if (timer) clearTimeout(timer);
      if (polling) fs.unwatchFile(root, pollListener);
      else watcher?.close();
    }
  };
}

module.exports = { bridgeFileName, createLibraryWatcher, writeBridgeConfig };
