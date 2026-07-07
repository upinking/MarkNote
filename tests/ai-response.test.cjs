const test = require("node:test");
const assert = require("node:assert/strict");

const {
  extractPartialJsonStringField,
  normalizeAiContent
} = require("../electron/ai-response.cjs");

test("keeps reply details when a provider places them in markdown", () => {
  const result = normalizeAiContent(JSON.stringify({
    type: "reply",
    message: "以下是重点和待办：",
    markdown: "## 重点\n\n- 掌握变量\n\n## 待办\n\n- 完成练习"
  }));

  assert.equal(result.type, "reply");
  assert.match(result.message, /以下是重点和待办/);
  assert.match(result.message, /掌握变量/);
  assert.match(result.message, /完成练习/);
  assert.equal(result.markdown, "");
});

test("keeps draft markdown separate for editable responses", () => {
  const result = normalizeAiContent(JSON.stringify({
    type: "draft",
    message: "草案已准备好。",
    markdown: "# 新笔记"
  }), { needsDraft: true });

  assert.equal(result.type, "draft");
  assert.equal(result.message, "草案已准备好。");
  assert.equal(result.markdown, "# 新笔记");
});

test("recovers visible reply fields from incomplete JSON", () => {
  const raw = '{"type":"reply","message":"重点如下：","markdown":"- 变量\\n- \\u51fd\\u6570';
  const result = normalizeAiContent(raw);

  assert.equal(extractPartialJsonStringField(raw, "markdown"), "- 变量\n- 函数");
  assert.match(result.message, /重点如下/);
  assert.match(result.message, /函数/);
});
