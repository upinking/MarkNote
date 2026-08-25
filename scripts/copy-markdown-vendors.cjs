const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const files = [
  ["node_modules/marked/lib/marked.umd.js", "app/vendor/marked.umd.js"],
  ["node_modules/dompurify/dist/purify.min.js", "app/vendor/purify.min.js"]
];

for (const [source, target] of files) {
  const sourcePath = path.join(root, source);
  if (!fs.existsSync(sourcePath)) {
    console.error(`${source} is missing. Run npm install first.`);
    process.exit(1);
  }
  fs.copyFileSync(sourcePath, path.join(root, target));
}
