const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const {
  codexCandidates,
  exportBundledPlugin,
  installBundledPlugin,
  marketplacePayload,
  pluginIsInstalled
} = require("../electron/codex-plugin.cjs");

test("includes Codex app CLI locations on Windows", () => {
  const candidates = codexCandidates({
    platform: "win32",
    home: "C:\\Users\\student",
    env: {
      LOCALAPPDATA: "C:\\Users\\student\\AppData\\Local",
      ProgramFiles: "C:\\Program Files"
    }
  });
  assert.ok(candidates.includes("codex.exe"));
  assert.ok(candidates.some((candidate) => candidate.endsWith("Codex\\resources\\codex.exe")));
});

async function withTempDirectory(run) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-codex-plugin-"));
  try {
    await run(directory);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}

test("exports a self-contained plugin marketplace using the MarkNote runtime", async () => {
  await withTempDirectory(async (userDataPath) => {
    const result = await exportBundledPlugin({
      appPath: path.resolve(__dirname, ".."),
      resourcesPath: "",
      userDataPath,
      execPath: "/Applications/MarkNote.app/Contents/MacOS/MarkNote"
    });
    const mcp = JSON.parse(await fs.readFile(path.join(result.pluginPath, ".mcp.json"), "utf8"));
    const marketplace = JSON.parse(await fs.readFile(result.marketplacePath, "utf8"));
    assert.equal(mcp.mcpServers.marknote.command, "/Applications/MarkNote.app/Contents/MacOS/MarkNote");
    assert.equal(mcp.mcpServers.marknote.env.ELECTRON_RUN_AS_NODE, "1");
    assert.deepEqual(marketplace, marketplacePayload());
    assert.match(result.deeplink, /^codex:\/\/plugins\/marknote/);
  });
});

test("installs the exported plugin through the Codex CLI", async () => {
  await withTempDirectory(async (userDataPath) => {
    const calls = [];
    const runner = async (command, args) => {
      calls.push([command, ...args]);
      if (args.join(" ") === "--version") return { stdout: "codex-cli 0.142.5\n", stderr: "" };
      if (args.join(" ") === "plugin marketplace list") return { stdout: "", stderr: "" };
      if (args.join(" ") === "plugin list") {
        return { stdout: "marknote@marknote-app  installed, enabled  0.1.0  /tmp/marknote\n", stderr: "" };
      }
      return { stdout: "", stderr: "" };
    };
    const result = await installBundledPlugin({
      appPath: path.resolve(__dirname, ".."),
      resourcesPath: "",
      userDataPath,
      execPath: "/mock/MarkNote",
      env: { CODEX_CLI_PATH: "/mock/codex" },
      runner
    });
    assert.equal(result.ok, true);
    assert.ok(calls.some((call) => call.includes("marketplace") && call.includes("add")));
    assert.ok(calls.some((call) => call.includes("marknote@marknote-app") && call.includes("add")));
  });
});

test("recognizes only an enabled MarkNote app plugin", () => {
  assert.equal(pluginIsInstalled("marknote@marknote-app  installed, enabled  0.1.0  /tmp/plugin"), true);
  assert.equal(pluginIsInstalled("marknote@marknote-local  installed, enabled  0.1.0  /tmp/plugin"), false);
});
