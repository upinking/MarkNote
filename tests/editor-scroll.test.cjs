const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const styles = fs.readFileSync(path.join(__dirname, "../app/styles.css"), "utf8");

function ruleFor(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return styles.match(new RegExp(`(?:^|\\n)\\s*${escapedSelector}\\s*\\{([^}]*)\\}`))?.[1] || "";
}

test("caret navigation does not use the large end-of-document spacer as scroll padding", () => {
  for (const selector of [".wysiwygEditor", ".markdownEditor"]) {
    const rule = ruleFor(selector);
    assert.match(rule, /padding:[^;]*var\(--writing-bottom-space\)/);
    assert.match(rule, /scroll-padding-block:\s*\d+px\s+\d+px/);
    assert.doesNotMatch(rule, /scroll-padding-block:[^;]*var\(--writing-bottom-space\)/);
  }
});
