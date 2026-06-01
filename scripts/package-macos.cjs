const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = path.resolve(__dirname, "..");
const electronApp = path.join(root, "node_modules/electron/dist/Electron.app");
const outputDir = path.join(root, "dist/mac");
const outputApp = path.join(outputDir, "MarkNote.app");
const outputZip = path.join(root, "dist/MarkNote-mac.zip");
const resourcesApp = path.join(outputApp, "Contents/Resources/app");
const plistPath = path.join(outputApp, "Contents/Info.plist");
const iconPath = path.join(root, "build/icon.icns");
const resourcesIconPath = path.join(outputApp, "Contents/Resources/icon.icns");
const keepLocales = new Set(["zh_CN.lproj", "zh_TW.lproj", "en.lproj", "ja.lproj"]);

function copyRequiredBuildAssets() {
  const buildOutput = path.join(resourcesApp, "build");
  fs.mkdirSync(buildOutput, { recursive: true });

  for (const name of ["icon.icns", "icon.ico", "icon.png"]) {
    const source = path.join(root, "build", name);
    if (fs.existsSync(source)) {
      fs.cpSync(source, path.join(buildOutput, name));
    }
  }
}

function pruneLocales(directory) {
  if (!fs.existsSync(directory)) return;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.endsWith(".lproj") && !keepLocales.has(entry.name)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        continue;
      }
      pruneLocales(fullPath);
    }
  }
}

function signApp(appPath) {
  childProcess.execFileSync("xattr", ["-cr", appPath], { stdio: "ignore" });
  childProcess.execFileSync("codesign", ["--force", "--deep", "--sign", "-", appPath], {
    stdio: "inherit"
  });
}

function createSignedZip() {
  const tempApp = path.join("/tmp", "MarkNote.app");
  fs.rmSync(tempApp, { recursive: true, force: true });
  fs.rmSync(outputZip, { force: true });
  childProcess.execFileSync("ditto", ["--norsrc", outputApp, tempApp], { stdio: "inherit" });
  signApp(tempApp);
  childProcess.execFileSync("codesign", ["--verify", "--deep", "--strict", "--verbose=2", tempApp], {
    stdio: "inherit"
  });
  childProcess.execFileSync("ditto", ["-c", "-k", "--keepParent", tempApp, outputZip], {
    stdio: "inherit"
  });
  console.log(`Created ${outputZip}`);
}

if (!fs.existsSync(electronApp)) {
  console.error("Electron is not installed. Run npm install first.");
  process.exit(1);
}

fs.rmSync(outputApp, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
childProcess.execFileSync("ditto", [electronApp, outputApp], { stdio: "inherit" });

fs.rmSync(resourcesApp, { recursive: true, force: true });
fs.mkdirSync(resourcesApp, { recursive: true });

for (const name of ["app", "electron", "README.md", "package.json"]) {
  fs.cpSync(path.join(root, name), path.join(resourcesApp, name), { recursive: true });
}
copyRequiredBuildAssets();
pruneLocales(outputApp);

if (fs.existsSync(iconPath)) {
  fs.cpSync(iconPath, resourcesIconPath);
}

let info = fs.readFileSync(plistPath, "utf8");
info = info
  .replace(/(<key>CFBundleDisplayName<\/key>\s*)<string>.*?<\/string>/s, "$1<string>MarkNote</string>")
  .replace(/(<key>CFBundleName<\/key>\s*)<string>.*?<\/string>/s, "$1<string>MarkNote</string>")
  .replace(/(<key>CFBundleIdentifier<\/key>\s*)<string>.*?<\/string>/s, "$1<string>com.codex.marknote</string>");
if (info.includes("<key>CFBundleIconFile</key>")) {
  info = info.replace(/(<key>CFBundleIconFile<\/key>\s*)<string>.*?<\/string>/s, "$1<string>icon</string>");
} else {
  info = info.replace(
    "</dict>",
    "  <key>CFBundleIconFile</key>\n  <string>icon</string>\n</dict>"
  );
}
fs.writeFileSync(plistPath, info);

try {
  signApp(outputApp);
} catch {
  console.warn("Created an unsigned app. It can still be opened locally, but macOS may show a security prompt.");
}

console.log(`Created ${outputApp}`);

try {
  createSignedZip();
} catch (error) {
  console.warn(`Could not create signed zip: ${error.message}`);
}
