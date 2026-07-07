const childProcess = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { promisify } = require("node:util");

const execFile = promisify(childProcess.execFile);
const marketplaceName = "marknote-app";
const pluginName = "marknote";

async function defaultRunner(command, args) {
  return execFile(command, args, {
    windowsHide: true,
    timeout: 30000,
    maxBuffer: 4 * 1024 * 1024
  });
}

async function firstExistingPath(candidates) {
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      await fs.access(candidate);
      return candidate;
    } catch {}
  }
  return "";
}

async function findBundledPluginPath({ appPath, resourcesPath }) {
  const candidates = [
    resourcesPath && path.join(resourcesPath, "app.asar.unpacked", "plugins", pluginName),
    path.join(appPath, "plugins", pluginName),
    resourcesPath && path.join(resourcesPath, "app", "plugins", pluginName)
  ];
  const pluginPath = await firstExistingPath(candidates);
  if (!pluginPath) throw new Error("MarkNote 安装包中缺少 Codex 插件资源");
  return pluginPath;
}

function marketplacePayload() {
  return {
    name: marketplaceName,
    interface: { displayName: "MarkNote" },
    plugins: [
      {
        name: pluginName,
        source: { source: "local", path: `./plugins/${pluginName}` },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
        category: "Productivity"
      }
    ]
  };
}

async function exportBundledPlugin(options) {
  const sourcePath = await findBundledPluginPath(options);
  const marketplaceRoot = path.join(options.userDataPath, "codex-plugin-marketplace");
  const pluginPath = path.join(marketplaceRoot, "plugins", pluginName);
  const marketplacePath = path.join(marketplaceRoot, ".agents", "plugins", "marketplace.json");

  await fs.rm(pluginPath, { recursive: true, force: true });
  await fs.mkdir(path.dirname(pluginPath), { recursive: true });
  await fs.cp(sourcePath, pluginPath, { recursive: true });

  const mcpPath = path.join(pluginPath, ".mcp.json");
  const mcp = JSON.parse(await fs.readFile(mcpPath, "utf8"));
  const server = mcp?.mcpServers?.marknote;
  if (!server) throw new Error("MarkNote 插件缺少 MCP 服务配置");
  server.cwd = ".";
  server.command = options.execPath;
  server.args = ["./mcp/server.cjs"];
  server.env = { ...(server.env || {}), ELECTRON_RUN_AS_NODE: "1" };
  await fs.writeFile(mcpPath, `${JSON.stringify(mcp, null, 2)}\n`, "utf8");

  await fs.mkdir(path.dirname(marketplacePath), { recursive: true });
  await fs.writeFile(marketplacePath, `${JSON.stringify(marketplacePayload(), null, 2)}\n`, "utf8");

  const manifest = JSON.parse(await fs.readFile(path.join(pluginPath, ".codex-plugin", "plugin.json"), "utf8"));
  const deeplink = `codex://plugins/${pluginName}?marketplacePath=${encodeURIComponent(marketplacePath)}`;
  return { marketplaceRoot, marketplacePath, pluginPath, version: manifest.version, deeplink };
}

function codexCandidates({ env = process.env, platform = process.platform, home = os.homedir() } = {}) {
  const explicit = env.CODEX_CLI_PATH ? [env.CODEX_CLI_PATH] : [];
  if (platform === "darwin") {
    return [
      ...explicit,
      "codex",
      "/Applications/Codex.app/Contents/Resources/codex",
      path.join(home, "Applications", "Codex.app", "Contents", "Resources", "codex")
    ];
  }
  if (platform === "win32") {
    const localAppData = env.LOCALAPPDATA || path.win32.join(home, "AppData", "Local");
    const programFiles = env.ProgramFiles || "C:\\Program Files";
    return [
      ...explicit,
      "codex.exe",
      "codex",
      path.win32.join(localAppData, "Programs", "Codex", "resources", "codex.exe"),
      path.win32.join(programFiles, "Codex", "resources", "codex.exe")
    ];
  }
  return [...explicit, "codex"];
}

async function findCodexCli(options = {}) {
  const runner = options.runner || defaultRunner;
  for (const candidate of codexCandidates(options)) {
    try {
      await runner(candidate, ["--version"]);
      return candidate;
    } catch {}
  }
  return "";
}

function marketplaceRootFromList(output = "") {
  const line = String(output).split(/\r?\n/).find((entry) => entry.trim().startsWith(`${marketplaceName} `));
  return line ? line.trim().slice(marketplaceName.length).trim() : "";
}

function pluginIsInstalled(output = "") {
  return new RegExp(`^${pluginName}@${marketplaceName}\\s+installed, enabled\\b`, "m").test(String(output));
}

async function installBundledPlugin(options) {
  const runner = options.runner || defaultRunner;
  const exported = await exportBundledPlugin(options);
  const cli = await findCodexCli({ ...options, runner });
  if (!cli) {
    return {
      ok: false,
      error: "codex-cli-not-found",
      message: "已释放插件，但没有找到 Codex CLI。请先安装或打开 Codex。",
      ...exported
    };
  }

  const marketplaceList = await runner(cli, ["plugin", "marketplace", "list"]);
  const existingRoot = marketplaceRootFromList(marketplaceList.stdout);
  if (existingRoot && path.resolve(existingRoot) !== path.resolve(exported.marketplaceRoot)) {
    await runner(cli, ["plugin", "marketplace", "remove", marketplaceName]).catch(() => {});
  }
  if (!existingRoot || path.resolve(existingRoot) !== path.resolve(exported.marketplaceRoot)) {
    await runner(cli, ["plugin", "marketplace", "add", exported.marketplaceRoot]);
  }

  await runner(cli, ["plugin", "remove", `${pluginName}@${marketplaceName}`]).catch(() => {});
  await runner(cli, ["plugin", "add", `${pluginName}@${marketplaceName}`, "--json"]);
  const pluginList = await runner(cli, ["plugin", "list"]);
  const installed = pluginIsInstalled(pluginList.stdout);
  return {
    ok: installed,
    installed,
    cli,
    message: installed ? "MarkNote 插件已安装到 Codex。请新建对话使用 @marknote。" : "Codex 没有确认插件安装成功。",
    ...exported
  };
}

async function getBundledPluginStatus(options) {
  let exported = null;
  try {
    const marketplaceRoot = path.join(options.userDataPath, "codex-plugin-marketplace");
    const pluginPath = path.join(marketplaceRoot, "plugins", pluginName);
    const marketplacePath = path.join(marketplaceRoot, ".agents", "plugins", "marketplace.json");
    const manifest = JSON.parse(await fs.readFile(path.join(pluginPath, ".codex-plugin", "plugin.json"), "utf8"));
    exported = {
      marketplaceRoot,
      marketplacePath,
      pluginPath,
      version: manifest.version,
      deeplink: `codex://plugins/${pluginName}?marketplacePath=${encodeURIComponent(marketplacePath)}`
    };
  } catch {}

  const runner = options.runner || defaultRunner;
  const cli = await findCodexCli({ ...options, runner });
  if (!cli) return { installed: false, cliAvailable: false, exported: Boolean(exported), ...exported };
  try {
    const pluginList = await runner(cli, ["plugin", "list"]);
    return {
      installed: pluginIsInstalled(pluginList.stdout),
      cliAvailable: true,
      exported: Boolean(exported),
      cli,
      ...exported
    };
  } catch {
    return { installed: false, cliAvailable: true, exported: Boolean(exported), cli, ...exported };
  }
}

module.exports = {
  codexCandidates,
  exportBundledPlugin,
  findBundledPluginPath,
  findCodexCli,
  getBundledPluginStatus,
  installBundledPlugin,
  marketplaceName,
  marketplacePayload,
  pluginIsInstalled
};
