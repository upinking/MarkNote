const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const mobileMain = fs.readFileSync(path.join(__dirname, "../mobile/src/main.js"), "utf8");
const mobileStyles = fs.readFileSync(path.join(__dirname, "../mobile/src/styles.css"), "utf8");

test("mobile home button toggles between the library and current note", () => {
  assert.match(
    mobileMain,
    /function toggleHomeMode\(\)\s*{[\s\S]*state\.mode === "list"[\s\S]*setMode\("reader"\)[\s\S]*setMode\("list"\)/
  );
  assert.match(mobileMain, /if \(action === "home"\) toggleHomeMode\(\)/);
  assert.match(mobileMain, /readerScrollPositions:\s*new Map\(\)/);
  assert.match(mobileMain, /rememberReaderScrollPosition\(\)/);
  assert.match(mobileMain, /restoreReaderScrollPosition\(\)/);
});

test("reader tap menu is viewport-fixed and does not rebuild long notes", () => {
  assert.match(
    mobileMain,
    /\$\{workspaceView\(note, headings\)\}[\s\S]*\$\{state\.mode === "reader"[\s\S]*readerQuickMenuView\(\)/
  );
  assert.match(mobileMain, /function toggleReaderQuickMenu\(\)\s*{\s*setReaderQuickMenuVisible\(!state\.quickMenuOpen\);\s*}/);
  assert.match(mobileMain, /moved > 12 \|\| scrolled > 4 \|\| held > 450 \|\| hasSelection/);
  assert.match(mobileMain, /data-panel="outline"[\s\S]*data-reader-action="top"/);
  assert.doesNotMatch(mobileMain, /class="bottomNav"/);
  assert.match(mobileStyles, /\.readerQuickMenu\s*{[\s\S]*position:\s*fixed;[\s\S]*z-index:\s*30;/);
  assert.match(mobileStyles, /\.readerQuickMenu\.isVisible/);
});

test("mobile sticky header and outline jumps respect the safe area", () => {
  assert.match(mobileStyles, /\.topBar\s*{[\s\S]*top:\s*env\(safe-area-inset-top, 0px\)/);
  assert.match(mobileStyles, /\.topBar::before\s*{[\s\S]*height:\s*env\(safe-area-inset-top, 0px\)/);
  assert.match(mobileStyles, /scroll-margin-top:\s*calc\(env\(safe-area-inset-top, 0px\) \+ 84px\)/);
});
