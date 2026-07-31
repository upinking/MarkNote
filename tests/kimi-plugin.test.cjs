const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const {
  exportKimiPlugin,
  getKimiPluginStatus,
  installKimiPlugin,
  kimiCliCandidates,
  parseInstalledPlugins,
  pluginRecordInstalled
} = require("../electron/kimi-plugin.cjs");

test("includes Kimi Code CLI locations on Windows", () => {
  const candidates = kimiCliCandidates({
    platform: "win32",
    home: "C:\\Users\\student",
    env: {}
  });
  assert.ok(candidates.includes("kimi.exe"));
  assert.ok(candidates.some((candidate) => candidate.endsWith(".kimi-code\\bin\\kimi.exe")));
});

async function withTempDirectory(run) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-kimi-plugin-"));
  try {
    await run(directory);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}

function exportOptions(userDataPath, overrides = {}) {
  return {
    appPath: path.resolve(__dirname, ".."),
    resourcesPath: "",
    userDataPath,
    execPath: "/Applications/MarkNote.app/Contents/MacOS/MarkNote",
    ...overrides
  };
}

test("exports a self-contained Kimi plugin using the MarkNote runtime", async () => {
  await withTempDirectory(async (userDataPath) => {
    const result = await exportKimiPlugin(exportOptions(userDataPath, { platform: "darwin" }));
    const manifest = JSON.parse(await fs.readFile(result.manifestPath, "utf8"));
    const server = manifest.mcpServers.marknote;
    assert.equal(server.command, "./run-server.sh");
    assert.deepEqual(server.args, []);
    assert.equal(server.cwd, "./");
    const launcher = await fs.readFile(result.launcherPath, "utf8");
    assert.ok(launcher.includes("/Applications/MarkNote.app/Contents/MacOS/MarkNote"));
    assert.ok(launcher.includes("ELECTRON_RUN_AS_NODE=1"));
    const launcherStat = await fs.stat(result.launcherPath);
    assert.ok(launcherStat.mode & 0o111, "launcher should be executable");
    assert.ok(result.installCommand.startsWith("/plugins install "));
    assert.ok(result.installCommand.includes(result.pluginPath));
    // The export keeps the MCP server and skill inside the plugin root.
    await fs.access(path.join(result.pluginPath, "mcp", "server.cjs"));
    await fs.access(path.join(result.pluginPath, "skills", "marknote", "SKILL.md"));
  });
});

test("exports a cmd launcher on Windows", async () => {
  await withTempDirectory(async (userDataPath) => {
    const result = await exportKimiPlugin(exportOptions(userDataPath, {
      platform: "win32",
      execPath: "C:\\Program Files\\MarkNote\\MarkNote.exe"
    }));
    const manifest = JSON.parse(await fs.readFile(result.manifestPath, "utf8"));
    assert.equal(manifest.mcpServers.marknote.command, "./run-server.cmd");
    const launcher = await fs.readFile(path.join(result.pluginPath, "run-server.cmd"), "utf8");
    assert.ok(launcher.includes("C:\\Program Files\\MarkNote\\MarkNote.exe"));
    assert.ok(launcher.includes("ELECTRON_RUN_AS_NODE=1"));
  });
});

test("install exports the plugin and reports an install command", async () => {
  await withTempDirectory(async (userDataPath) => {
    const result = await installKimiPlugin(exportOptions(userDataPath, {
      platform: "darwin",
      env: { KIMI_CLI_PATH: "/mock/kimi" },
      home: path.join(userDataPath, "no-kimi-home"),
      runner: async () => ({ stdout: "kimi-code 1.0.0\n", stderr: "" })
    }));
    assert.equal(result.ok, true);
    assert.equal(result.cliAvailable, true);
    assert.equal(result.installed, false);
    assert.ok(result.installCommand.includes(result.pluginPath));
  });
});

test("detects an enabled MarkNote record in installed.json", async () => {
  await withTempDirectory(async (userDataPath) => {
    const kimiHome = path.join(userDataPath, "kimi-home");
    await fs.mkdir(path.join(kimiHome, "plugins"), { recursive: true });
    await fs.writeFile(path.join(kimiHome, "plugins", "installed.json"), JSON.stringify({
      version: 1,
      plugins: [
        { id: "marknote", enabled: true, root: path.join(kimiHome, "plugins", "managed", "marknote") }
      ]
    }), "utf8");
    const status = await getKimiPluginStatus(exportOptions(userDataPath, {
      env: { KIMI_CODE_HOME: kimiHome, KIMI_CLI_PATH: "/missing/kimi" },
      runner: async () => { throw new Error("not found"); }
    }));
    assert.equal(status.installed, true);
    assert.equal(status.cliAvailable, false);
    assert.equal(status.exported, false);
  });
});

test("parses installed.json records defensively", () => {
  assert.equal(pluginRecordInstalled(parseInstalledPlugins('{"version":1,"plugins":[{"id":"marknote","enabled":true}]}')), true);
  assert.equal(pluginRecordInstalled(parseInstalledPlugins('{"version":1,"plugins":[{"id":"marknote","enabled":false}]}')), false);
  assert.equal(pluginRecordInstalled(parseInstalledPlugins('{"version":1,"plugins":[{"id":"other","enabled":true}]}')), false);
  assert.equal(pluginRecordInstalled(parseInstalledPlugins('{"version":1,"plugins":[{"root":"/home/u/.kimi-code/plugins/managed/marknote"}]}')), true);
  assert.equal(pluginRecordInstalled(parseInstalledPlugins("not json")), false);
  assert.equal(pluginRecordInstalled(parseInstalledPlugins("{}")), false);
});
