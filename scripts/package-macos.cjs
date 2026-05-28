const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = path.resolve(__dirname, "..");
const electronApp = path.join(root, "node_modules/electron/dist/Electron.app");
const outputDir = path.join(root, "dist/mac");
const outputApp = path.join(outputDir, "MarkNote.app");
const resourcesApp = path.join(outputApp, "Contents/Resources/app");
const plistPath = path.join(outputApp, "Contents/Info.plist");
const iconPath = path.join(root, "build/icon.icns");
const resourcesIconPath = path.join(outputApp, "Contents/Resources/icon.icns");

if (!fs.existsSync(electronApp)) {
  console.error("Electron is not installed. Run npm install first.");
  process.exit(1);
}

fs.rmSync(outputApp, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
childProcess.execFileSync("ditto", [electronApp, outputApp], { stdio: "inherit" });

fs.rmSync(resourcesApp, { recursive: true, force: true });
fs.mkdirSync(resourcesApp, { recursive: true });

for (const name of ["app", "build", "electron", "README.md", "package.json"]) {
  fs.cpSync(path.join(root, name), path.join(resourcesApp, name), { recursive: true });
}

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
  childProcess.execFileSync("xattr", ["-cr", outputApp], { stdio: "ignore" });
  childProcess.execFileSync("codesign", ["--force", "--deep", "--sign", "-", outputApp], {
    stdio: "inherit"
  });
} catch {
  console.warn("Created an unsigned app. It can still be opened locally, but macOS may show a security prompt.");
}

console.log(`Created ${outputApp}`);
