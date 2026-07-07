const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const renderer = fs.readFileSync(path.join(__dirname, "../app/renderer.js"), "utf8");

test("the hybrid editor opens with no line in edit mode", () => {
  assert.match(renderer, /hybridActiveLine:\s*-1/);
  assert.match(renderer, /this\.activeLine\s*=\s*-1;/);
  assert.match(
    renderer,
    /options\.activeLine\s*\?\?\s*\(options\.preserveActive\s*\?\s*this\.activeLine\s*:\s*-1\)/
  );
});
