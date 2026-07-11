const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  clearGitHubToken,
  githubTokenStatus,
  saveGitHubToken
} = require("../electron/github-sync.cjs");

test("stores the GitHub token encrypted and can clear it", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-github-token-"));
  const safeStorage = {
    isEncryptionAvailable: () => true,
    encryptString: (value) => Buffer.from(`encrypted:${value.split("").reverse().join("")}`),
    decryptString: (value) => String(value).replace(/^encrypted:/, "").split("").reverse().join("")
  };

  try {
    const result = await saveGitHubToken(directory, safeStorage, "github_pat_secret");
    const stored = await fs.readFile(path.join(directory, "github-sync-token.bin"), "utf8");
    assert.equal(result.persisted, true);
    assert.equal(stored.includes("github_pat_secret"), false);
    assert.deepEqual(await githubTokenStatus(directory, safeStorage), { configured: true, persistent: true });

    await clearGitHubToken(directory);
    assert.deepEqual(await githubTokenStatus(directory, safeStorage), { configured: false, persistent: true });
  } finally {
    await clearGitHubToken(directory);
    await fs.rm(directory, { recursive: true, force: true });
  }
});
