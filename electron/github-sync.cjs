const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const { atomicWriteFile } = require("./atomic-file.cjs");
const { clearSecret, loadSecret, saveSecret, secretStatus } = require("./secure-secrets.cjs");

let syncModulePromise = null;
const githubTokenName = "github-sync-token";

function loadSyncModule() {
  syncModulePromise ||= import("../shared/github-sync.mjs");
  return syncModulePromise;
}

async function saveGitHubToken(userDataPath, safeStorage, token) {
  if (!String(token || "").trim()) throw new Error("请填写 GitHub Token。");
  return saveSecret(userDataPath, safeStorage, githubTokenName, token);
}

async function loadGitHubToken(userDataPath, safeStorage) {
  return loadSecret(userDataPath, safeStorage, githubTokenName);
}

async function clearGitHubToken(userDataPath) {
  return clearSecret(userDataPath, githubTokenName);
}

async function githubTokenStatus(userDataPath, safeStorage) {
  return secretStatus(userDataPath, safeStorage, githubTokenName);
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
    return { version: 2, notes: {} };
  }
}

async function saveBaseline(filePath, baseline) {
  await atomicWriteFile(filePath, `${JSON.stringify(baseline)}\n`, { encoding: "utf8", mode: 0o600 });
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
