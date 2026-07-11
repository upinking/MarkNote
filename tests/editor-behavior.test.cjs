const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const renderer = fs.readFileSync(path.join(__dirname, "../app/renderer.js"), "utf8");
const index = fs.readFileSync(path.join(__dirname, "../app/index.html"), "utf8");
const styles = fs.readFileSync(path.join(__dirname, "../app/styles.css"), "utf8");
const main = fs.readFileSync(path.join(__dirname, "../electron/main.cjs"), "utf8");

test("new notes use placeholder UI instead of saving starter text", () => {
  assert.match(renderer, /state\.markdown\s*=\s*`# \$\{t\("untitledHeading"\)\}\\n\\n`/);
  assert.match(renderer, /const content\s*=\s*`# \$\{t\("untitledHeading"\)\}\\n\\n`/);
  assert.doesNotMatch(renderer, /state\.markdown\s*=\s*`# \$\{t\("untitledHeading"\)\}\\n\\n\$\{t\("startWriting"\)\}\\n`/);
  assert.doesNotMatch(renderer, /const content\s*=\s*`# \$\{t\("untitledHeading"\)\}\\n\\n\$\{t\("startWriting"\)\}\\n`/);
});

test("IME composition protects Enter shortcuts", () => {
  assert.match(renderer, /function isImeComposingEvent\(event\)/);
  assert.match(renderer, /this\.isComposing \|\| this\.compositionJustEnded \|\| isImeComposingEvent\(event\)/);
  assert.match(renderer, /state\.aiInputComposing \|\| isImeComposingEvent\(event\)/);
});

test("reading progress, back-to-top and outline bulk toggle are wired", () => {
  assert.match(renderer, /const readingProgressKey = "marknote\.readingProgress\.v1"/);
  assert.match(renderer, /function restoreCurrentReadingProgressSoon\(\)/);
  assert.match(renderer, /function toggleAllHeadingCollapse\(\)/);
  assert.match(index, /id="toggleAllOutlineButton"/);
  assert.match(index, /id="backToTopButton"/);
});

test("back-to-top clears the AI composer and returns with its closing animation", () => {
  assert.match(styles, /--ai-pane-expanded-width:\s*clamp\(288px, 30vw, 460px\)/);
  assert.match(styles, /right 420ms cubic-bezier\(0\.16, 1, 0\.3, 1\)/);
  assert.match(
    styles,
    /\.workspace\.aiMode \+ \.backToTopButton\s*{\s*right:\s*calc\(var\(--ai-pane-expanded-width\) \+ 22px\)/s
  );
  assert.doesNotMatch(styles, /aiModeClosing[^}]*backToTopButton/);
  assert.match(styles, /@media \(max-width: 1100px\)[\s\S]*--ai-pane-expanded-width:\s*clamp\(288px, 30vw, 340px\)/);
});

test("desktop library titles come from Markdown file names", () => {
  assert.match(main, /title:\s*path\.basename\(normalized,\s*path\.extname\(normalized\)\)/);
});
