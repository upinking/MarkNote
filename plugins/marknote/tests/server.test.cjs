const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const readline = require("node:readline");

test("MCP server initializes and serves library tools over stdio", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-mcp-"));
  await fs.writeFile(path.join(root, "hello.md"), "# Hello\n\nCodex connection works.");
  const serverPath = path.join(__dirname, "../mcp/server.cjs");
  const child = spawn(process.execPath, [serverPath], {
    env: { ...process.env, MARKNOTE_LIBRARY_PATH: root },
    stdio: ["pipe", "pipe", "pipe"]
  });
  const lines = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
  const pending = new Map();
  lines.on("line", (line) => {
    const message = JSON.parse(line);
    pending.get(message.id)?.(message);
    pending.delete(message.id);
  });

  function request(id, method, params = {}) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), 3000);
      pending.set(id, (message) => {
        clearTimeout(timer);
        resolve(message);
      });
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
    });
  }

  try {
    const initialized = await request(1, "initialize", { protocolVersion: "2025-06-18" });
    assert.equal(initialized.result.serverInfo.name, "marknote");

    const listed = await request(2, "tools/list");
    assert.ok(listed.result.tools.some((tool) => tool.name === "read_note"));
    assert.ok(listed.result.tools.some((tool) => tool.name === "update_note"));

    const called = await request(3, "tools/call", { name: "read_note", arguments: { path: "hello.md" } });
    assert.equal(called.result.isError, undefined);
    assert.equal(called.result.structuredContent.note.title, "Hello");
    assert.match(called.result.structuredContent.note.content, /connection works/);
  } finally {
    child.kill();
    lines.close();
    await fs.rm(root, { recursive: true, force: true });
  }
});
