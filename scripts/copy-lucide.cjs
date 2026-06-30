const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "node_modules/lucide/dist/umd/lucide.min.js");
const target = path.join(root, "app/vendor/lucide.min.js");

if (!fs.existsSync(source)) {
  console.error("Lucide is not installed. Run npm install first.");
  process.exit(1);
}

fs.copyFileSync(source, target);
