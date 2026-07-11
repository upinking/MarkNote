const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

let sessionToken = "";
let syncModulePromise = null;

function loadSyncModule() {
  syncModulePromise ||= import("../shared/github-sync.mjs");
  return syncModulePromise;
}

function tokenPath(userDataPath) {
  return path.join(userDataPath, "github-sync-token.bin");
}

async function saveGitHubToken(userDataPath, safeStorage, token) {
  const normalized = String(token || "").trim();
  if (!normalized) throw new Error("请填写 GitHub Token。");
  sessionToken = normalized;
  if (!safeStorage?.isEncryptionAvailable?.()) {
    return { saved: true, persisted: false };
  }
  await fs.mkdir(userDataPath, { recursive: true });
  const encrypted = safeStorage.encryptString(normalized);
  await fs.writeFile(tokenPath(userDataPath), encrypted, { mode: 0o600 });
  return { saved: true, persisted: true };
}

async function loadGitHubToken(userDataPath, safeStorage) {
  if (sessionToken) return sessionToken;
  if (!safeStorage?.isEncryptionAvailable?.()) return "";
  try {
    const encrypted = await fs.readFile(tokenPath(userDataPath));
    sessionToken = safeStorage.decryptString(encrypted);
    return sessionToken;
  } catch {
    return "";
  }
}

async function clearGitHubToken(userDataPath) {
  sessionToken = "";
  await fs.rm(tokenPath(userDataPath), { force: true });
  return { cleared: true };
}

async function githubTokenStatus(userDataPath, safeStorage) {
  return {
    configured: Boolean(await loadGitHubToken(userDataPath, safeStorage)),
    persistent: Boolean(safeStorage?.isEncryptionAvailable?.())
  };
}

function baselinePath(userDataPath, rootPath, settings) {
  const identity = JSON.stringify({
    rootPath: path.resolve(rootPath),
    owner: settings.owner,
    repo: settings.repo,
    branch: settings.branch,
    remoteFolder: settings.remoteFolder
  });
  const key = crypto.createHash("sha256").update(identity).digest("hex").slice(0, 24);
  return path.join(userDataPath, "github-sync", `${key}.json`);
}

async function loadBaseline(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return { version: 1, notes: {} };
  }
}

async function saveBaseline(filePath, baseline) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  try {
    await fs.writeFile(temporaryPath, `${JSON.stringify(baseline)}\n`, { encoding: "utf8", mode: 0o600 });
    await fs.rename(temporaryPath, filePath);
  } finally {
    await fs.rm(temporaryPath, { force: true }).catch(() => {});
  }
}

async function syncDesktopLibrary(options) {
  const { normalizeGitHubSettings, syncNotesWithGitHub } = await loadSyncModule();
  const settings = normalizeGitHubSettings(options.settings);
  const token = await loadGitHubToken(options.userDataPath, options.safeStorage);
  if (!token) throw new Error("请先保存 GitHub Token。");

  const filePath = baselinePath(options.userDataPath, options.rootPath, settings);
  const baseline = await loadBaseline(filePath);
  const result = await syncNotesWithGitHub({
    settings,
    token,
    baseline,
    localNotes: options.localNotes,
    writeLocal: options.writeLocal,
    deleteLocal: options.deleteLocal,
    resolveConflict: options.resolveConflict,
    deviceLabel: options.deviceLabel || "电脑"
  });
  await saveBaseline(filePath, result.baseline);
  return result;
}

module.exports = {
  clearGitHubToken,
  githubTokenStatus,
  loadGitHubToken,
  saveGitHubToken,
  syncDesktopLibrary
};
