const childProcess = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { promisify } = require("node:util");

const execFile = promisify(childProcess.execFile);
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
  if (!pluginPath) throw new Error("MarkNote 安装包中缺少 Kimi Code 插件资源");
  return pluginPath;
}

function pluginRoot(userDataPath) {
  return path.join(userDataPath, "kimi-plugin", pluginName);
}

function launcherName(platform) {
  return platform === "win32" ? "run-server.cmd" : "run-server.sh";
}

function launcherContents(platform, execPath) {
  if (platform === "win32") {
    return [
      "@echo off",
      "set ELECTRON_RUN_AS_NODE=1",
      `"${execPath}" "%~dp0mcp\\server.cjs" %*`,
      ""
    ].join("\r\n");
  }
  return `#!/bin/sh\nELECTRON_RUN_AS_NODE=1 exec "${execPath}" "$(dirname "$0")/mcp/server.cjs" "$@"\n`;
}

async function exportKimiPlugin(options) {
  const platform = options.platform || process.platform;
  const sourcePath = await findBundledPluginPath(options);
  const targetPath = pluginRoot(options.userDataPath);

  await fs.rm(targetPath, { recursive: true, force: true });
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.cp(sourcePath, targetPath, { recursive: true });

  const launcher = launcherName(platform);
  const launcherPath = path.join(targetPath, launcher);
  await fs.writeFile(launcherPath, launcherContents(platform, options.execPath), "utf8");
  if (platform !== "win32") await fs.chmod(launcherPath, 0o755);

  const manifestPath = path.join(targetPath, "kimi.plugin.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const server = manifest?.mcpServers?.[pluginName];
  if (!server) throw new Error("MarkNote 插件缺少 Kimi Code MCP 服务配置");
  server.command = `./${launcher}`;
  server.args = [];
  server.cwd = "./";
  delete server.env;
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  return {
    pluginPath: targetPath,
    manifestPath,
    launcherPath,
    version: manifest.version,
    installCommand: `/plugins install ${targetPath}`
  };
}

function kimiCliCandidates({ env = process.env, platform = process.platform, home = os.homedir() } = {}) {
  const explicit = env.KIMI_CLI_PATH ? [env.KIMI_CLI_PATH] : [];
  if (platform === "win32") {
    return [
      ...explicit,
      "kimi.exe",
      "kimi",
      path.win32.join(home, ".kimi-code", "bin", "kimi.exe")
    ];
  }
  return [
    ...explicit,
    "kimi",
    path.join(home, ".kimi-code", "bin", "kimi")
  ];
}

async function findKimiCli(options = {}) {
  const runner = options.runner || defaultRunner;
  for (const candidate of kimiCliCandidates(options)) {
    try {
      await runner(candidate, ["--version"]);
      return candidate;
    } catch {}
  }
  return "";
}

function kimiHomeDir({ env = process.env, home = os.homedir() } = {}) {
  return env.KIMI_CODE_HOME || path.join(home, ".kimi-code");
}

function parseInstalledPlugins(raw) {
  try {
    const parsed = JSON.parse(String(raw));
    if (!parsed || !Array.isArray(parsed.plugins)) return [];
    return parsed.plugins;
  } catch {
    return [];
  }
}

function pluginRecordInstalled(records) {
  return records.some((record) => {
    if (!record || typeof record !== "object") return false;
    const id = typeof record.id === "string" ? record.id : "";
    const root = typeof record.root === "string" ? record.root : "";
    const matches = id === pluginName || (root && path.basename(root) === pluginName);
    return matches && record.enabled !== false;
  });
}

async function readInstalledStatus(options = {}) {
  try {
    const installedPath = path.join(kimiHomeDir(options), "plugins", "installed.json");
    const raw = await fs.readFile(installedPath, "utf8");
    return pluginRecordInstalled(parseInstalledPlugins(raw));
  } catch {
    return false;
  }
}

async function getKimiPluginStatus(options) {
  const targetPath = pluginRoot(options.userDataPath);
  let exported = null;
  try {
    const manifest = JSON.parse(await fs.readFile(path.join(targetPath, "kimi.plugin.json"), "utf8"));
    exported = {
      pluginPath: targetPath,
      version: manifest.version,
      installCommand: `/plugins install ${targetPath}`
    };
  } catch {}

  const runner = options.runner || defaultRunner;
  const cli = await findKimiCli({ ...options, runner });
  const installed = await readInstalledStatus(options);
  return {
    installed,
    cliAvailable: Boolean(cli),
    exported: Boolean(exported),
    ...(cli ? { cli } : {}),
    ...exported
  };
}

async function installKimiPlugin(options) {
  const runner = options.runner || defaultRunner;
  const exported = await exportKimiPlugin(options);
  const cli = await findKimiCli({ ...options, runner });
  const installed = await readInstalledStatus(options);
  return {
    ok: true,
    exported: true,
    installed,
    cliAvailable: Boolean(cli),
    message: cli
      ? "插件已释放，安装命令已复制。请在 Kimi Code 中粘贴执行并确认信任提示，然后运行 /reload。"
      : "插件已释放，安装命令已复制。没有检测到 Kimi Code CLI，请确认已安装 Kimi Code。",
    ...exported
  };
}

module.exports = {
  exportKimiPlugin,
  findBundledPluginPath,
  findKimiCli,
  getKimiPluginStatus,
  installKimiPlugin,
  kimiCliCandidates,
  kimiHomeDir,
  launcherContents,
  launcherName,
  parseInstalledPlugins,
  pluginName,
  pluginRecordInstalled,
  pluginRoot
};
