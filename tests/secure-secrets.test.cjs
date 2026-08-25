const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { clearSecret, loadSecret, saveSecret, secretStatus } = require("../electron/secure-secrets.cjs");

const fakeSafeStorage = {
  isEncryptionAvailable: () => true,
  encryptString: (value) => Buffer.from(value).toString("base64"),
  decryptString: (value) => Buffer.from(value.toString(), "base64").toString()
};

test("encrypts, reports and clears a persisted secret", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-secrets-"));
  const name = `test-${Date.now()}`;
  try {
    assert.deepEqual(await saveSecret(root, fakeSafeStorage, name, "secret-value"), {
      saved: true,
      persisted: true
    });
    assert.notEqual(await fs.readFile(path.join(root, `${name}.bin`), "utf8"), "secret-value");
    assert.equal(await loadSecret(root, fakeSafeStorage, name), "secret-value");
    assert.deepEqual(await secretStatus(root, fakeSafeStorage, name), { configured: true, persistent: true });
    await clearSecret(root, name);
    assert.equal(await loadSecret(root, fakeSafeStorage, name), "");
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("keeps a secret in memory when operating-system encryption is unavailable", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-session-secret-"));
  const name = `session-${Date.now()}`;
  const unavailable = { isEncryptionAvailable: () => false };
  try {
    assert.deepEqual(await saveSecret(root, unavailable, name, "temporary"), {
      saved: true,
      persisted: false
    });
    assert.equal(await loadSecret(root, unavailable, name), "temporary");
    assert.deepEqual(await fs.readdir(root), []);
  } finally {
    await clearSecret(root, name);
    await fs.rm(root, { recursive: true, force: true });
  }
});
