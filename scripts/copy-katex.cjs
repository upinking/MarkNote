const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "node_modules/katex/dist");
const target = path.join(root, "app/vendor/katex");

if (!fs.existsSync(source)) {
  console.error("KaTeX is not installed. Run npm install first.");
  process.exit(1);
}

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(target, { recursive: true });

for (const name of ["katex.min.js", "katex.min.css", "fonts"]) {
  copyRecursive(path.join(source, name), path.join(target, name));
}

function copyRecursive(from, to) {
  const stat = fs.statSync(from);
  if (!stat.isDirectory()) {
    fs.copyFileSync(from, to);
    return;
  }

  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from)) {
    copyRecursive(path.join(from, entry), path.join(to, entry));
  }
}
