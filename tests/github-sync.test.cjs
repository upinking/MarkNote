const assert = require("node:assert/strict");
const test = require("node:test");
const { pathToFileURL } = require("node:url");
const path = require("node:path");

const syncModulePromise = import(pathToFileURL(path.join(__dirname, "../shared/github-sync.mjs")));

function fakeClient(initial = {}) {
  const files = new Map();
  let revision = 10;
  for (const [filePath, value] of Object.entries(initial)) {
    files.set(filePath, { content: value.content, sha: value.sha });
  }
  return {
    settings: { owner: "me", repo: "notes", branch: "main", remoteFolder: "notes" },
    files,
    async verifyRepository() {},
    async listDirectory(folder) {
      const direct = [];
      const directories = new Set();
      for (const filePath of files.keys()) {
        if (!filePath.startsWith(`${folder}/`)) continue;
        const rest = filePath.slice(folder.length + 1);
        if (rest.includes("/")) {
          directories.add(`${folder}/${rest.split("/")[0]}`);
        } else {
          direct.push({ type: "file", path: filePath });
        }
      }
      return [...directories].map((entry) => ({ type: "dir", path: entry })).concat(direct);
    },
    async readFile(filePath) {
      return { ...files.get(filePath) };
    },
    async writeFile(filePath, content) {
      revision += 1;
      const value = { content, sha: `sha-${revision}` };
      files.set(filePath, value);
      return { sha: value.sha };
    },
    async deleteFile(filePath) {
      files.delete(filePath);
    }
  };
}

function localStore(initial = {}) {
  const files = new Map(Object.entries(initial));
  return {
    files,
    notes: () => [...files].map(([filePath, content]) => ({ path: filePath, content })),
    async write(filePath, content) {
      files.set(filePath, content);
    },
    async remove(filePath) {
      files.delete(filePath);
    }
  };
}

test("uploads local notes and downloads remote notes on first sync", async () => {
  const { syncNotesWithGitHub } = await syncModulePromise;
  const client = fakeClient({ "notes/remote.md": { content: "# Remote", sha: "remote-1" } });
  const local = localStore({ "local.md": "# Local" });

  const result = await syncNotesWithGitHub({
    client,
    localNotes: local.notes(),
    writeLocal: local.write,
    deleteLocal: local.remove,
    deviceLabel: "测试"
  });

  assert.equal(client.files.get("notes/local.md").content, "# Local");
  assert.equal(local.files.get("remote.md"), "# Remote");
  assert.equal(result.summary.uploaded, 1);
  assert.equal(result.summary.downloaded, 1);
  assert.deepEqual(Object.keys(result.baseline.notes).sort(), ["local.md", "remote.md"]);
});

test("keeps both versions when local and remote changed", async () => {
  const { syncNotesWithGitHub } = await syncModulePromise;
  const client = fakeClient({ "notes/shared.md": { content: "# Remote edit", sha: "remote-2" } });
  const local = localStore({ "shared.md": "# Local edit" });

  const result = await syncNotesWithGitHub({
    client,
    localNotes: local.notes(),
    baseline: { version: 1, notes: { "shared.md": { content: "# Original", remoteSha: "remote-1" } } },
    writeLocal: local.write,
    deleteLocal: local.remove,
    deviceLabel: "手机",
    now: new Date("2026-07-07T12:34:56.000Z")
  });

  const conflictPath = "shared (冲突-手机-20260707123456).md";
  assert.equal(local.files.get("shared.md"), "# Remote edit");
  assert.equal(local.files.get(conflictPath), "# Local edit");
  assert.equal(client.files.get(`notes/${conflictPath}`).content, "# Local edit");
  assert.equal(result.summary.conflicts.length, 1);
});

test("can resolve a content conflict with either local or GitHub version", async () => {
  const { syncNotesWithGitHub } = await syncModulePromise;
  const baseline = { version: 1, notes: { "shared.md": { content: "# Original", remoteSha: "remote-1" } } };

  for (const choice of ["local", "remote"]) {
    const client = fakeClient({ "notes/shared.md": { content: "# GitHub edit", sha: "remote-2" } });
    const local = localStore({ "shared.md": "# Local edit" });
    const prompts = [];
    const result = await syncNotesWithGitHub({
      client,
      localNotes: local.notes(),
      baseline,
      writeLocal: local.write,
      deleteLocal: local.remove,
      resolveConflict: async (details) => {
        prompts.push(details);
        return choice;
      }
    });

    const expected = choice === "local" ? "# Local edit" : "# GitHub edit";
    assert.equal(local.files.get("shared.md"), expected);
    assert.equal(client.files.get("notes/shared.md").content, expected);
    assert.equal(prompts[0].reason, "both-changed");
    assert.equal(result.summary.conflicts[0].resolution, choice);
    assert.equal([...local.files.keys()].some((filePath) => filePath.includes("冲突-")), false);
  }
});

test("asks before resolving a delete-versus-edit conflict", async () => {
  const { syncNotesWithGitHub } = await syncModulePromise;
  const client = fakeClient({ "notes/shared.md": { content: "# GitHub edit", sha: "remote-2" } });
  const local = localStore();
  let promptedReason = "";

  const result = await syncNotesWithGitHub({
    client,
    localNotes: local.notes(),
    baseline: { version: 1, notes: { "shared.md": { content: "# Original", remoteSha: "remote-1" } } },
    writeLocal: local.write,
    deleteLocal: local.remove,
    resolveConflict: async ({ reason }) => {
      promptedReason = reason;
      return "both";
    },
    now: new Date("2026-07-07T12:34:56.000Z")
  });

  assert.equal(promptedReason, "local-deleted-remote-changed");
  assert.equal(client.files.has("notes/shared.md"), false);
  assert.equal(local.files.get("shared (冲突-GitHub-20260707123456).md"), "# GitHub edit");
  assert.equal(result.summary.conflicts[0].resolution, "both");
});

test("propagates clean deletions in either direction", async () => {
  const { syncNotesWithGitHub } = await syncModulePromise;
  const client = fakeClient({ "notes/delete-remote.md": { content: "A", sha: "a-1" } });
  const local = localStore({ "delete-local.md": "B" });
  const baseline = {
    version: 1,
    notes: {
      "delete-remote.md": { content: "A", remoteSha: "a-1" },
      "delete-local.md": { content: "B", remoteSha: "b-1" }
    }
  };

  const result = await syncNotesWithGitHub({
    client,
    localNotes: local.notes(),
    baseline,
    writeLocal: local.write,
    deleteLocal: local.remove
  });

  assert.equal(client.files.has("notes/delete-remote.md"), false);
  assert.equal(local.files.has("delete-local.md"), false);
  assert.equal(result.summary.deletedRemote, 1);
  assert.equal(result.summary.deletedLocal, 1);
});
