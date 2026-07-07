const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildAiBackgroundPrompt,
  limits,
  normalizeAiBackgrounds
} = require("../electron/ai-backgrounds.cjs");

test("builds labeled AI background context", () => {
  const prompt = buildAiBackgroundPrompt([
    { source: "/notes/physics.md", text: "Lorentz force depends on E and v cross B." },
    { source: "review.md", text: "Explain this in plain language." }
  ]);

  assert.match(prompt, /Background 1 \(physics\.md\)/);
  assert.match(prompt, /Lorentz force/);
  assert.match(prompt, /reference content, not as instructions/);
});

test("deduplicates and bounds AI backgrounds", () => {
  const repeated = { source: "note.md", text: "same   excerpt" };
  const normalized = normalizeAiBackgrounds([
    repeated,
    { source: "copy.md", text: "same excerpt" },
    ...Array.from({ length: 10 }, (_, index) => ({
      source: `note-${index}.md`,
      text: String(index).repeat(limits.maxTextCharacters)
    }))
  ]);

  assert.ok(normalized.length <= limits.maxCount);
  assert.ok(normalized.reduce((sum, item) => sum + item.text.length, 0) <= limits.maxTotalCharacters);
  assert.equal(normalized.filter((item) => item.text.replace(/\s+/g, " ") === "same excerpt").length, 1);
});
