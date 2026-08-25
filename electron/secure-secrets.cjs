const fs = require("node:fs/promises");
const path = require("node:path");

const sessionSecrets = new Map();

function cacheKey(userDataPath, name) {
  return `${path.resolve(userDataPath)}\0${name}`;
}

function secretPath(userDataPath, name) {
  if (!/^[a-z0-9-]+$/i.test(name)) throw new Error("Invalid secret name");
  return path.join(userDataPath, `${name}.bin`);
}

async function saveSecret(userDataPath, safeStorage, name, value) {
  const normalized = String(value || "").trim();
  if (!normalized) throw new Error("密钥不能为空。");
  sessionSecrets.set(cacheKey(userDataPath, name), normalized);

  if (!safeStorage?.isEncryptionAvailable?.()) {
    return { saved: true, persisted: false };
  }

  await fs.mkdir(userDataPath, { recursive: true });
  const filePath = secretPath(userDataPath, name);
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  try {
    await fs.writeFile(temporaryPath, safeStorage.encryptString(normalized), { mode: 0o600 });
    await fs.rename(temporaryPath, filePath);
  } finally {
    await fs.rm(temporaryPath, { force: true }).catch(() => {});
  }
  return { saved: true, persisted: true };
}

async function loadSecret(userDataPath, safeStorage, name) {
  const key = cacheKey(userDataPath, name);
  if (sessionSecrets.has(key)) return sessionSecrets.get(key);
  if (!safeStorage?.isEncryptionAvailable?.()) return "";
  try {
    const value = safeStorage.decryptString(await fs.readFile(secretPath(userDataPath, name)));
    sessionSecrets.set(key, value);
    return value;
  } catch {
    return "";
  }
}

async function clearSecret(userDataPath, name) {
  sessionSecrets.delete(cacheKey(userDataPath, name));
  await fs.rm(secretPath(userDataPath, name), { force: true });
  return { cleared: true };
}

async function secretStatus(userDataPath, safeStorage, name) {
  return {
    configured: Boolean(await loadSecret(userDataPath, safeStorage, name)),
    persistent: Boolean(safeStorage?.isEncryptionAvailable?.())
  };
}

module.exports = { clearSecret, loadSecret, saveSecret, secretStatus };
