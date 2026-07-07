#!/usr/bin/env node
const readline = require("node:readline");
const {
  MarkNoteError,
  archiveNote,
  createNote,
  listNotes,
  readNote,
  resolveLibraryRoot,
  searchNotes,
  updateNote
} = require("./library.cjs");

const serverInfo = { name: "marknote", version: "0.1.0" };
const instructions = "Use read/search tools freely. Before create, update, or archive, explain the intended change and obtain explicit user confirmation. Updates and archives require the revision returned by read_note; never retry a revision conflict automatically.";

const tools = [
  {
    name: "library_status",
    description: "Check which local MarkNote library is connected and whether it is available.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
  },
  {
    name: "list_notes",
    description: "List note metadata in the MarkNote library, newest first. Archived notes are excluded by default.",
    inputSchema: {
      type: "object",
      properties: {
        folder: { type: "string", description: "Optional relative folder to list." },
        includeArchived: { type: "boolean", default: false },
        limit: { type: "integer", minimum: 1, maximum: 50, default: 20 }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
  },
  {
    name: "search_notes",
    description: "Search note titles and Markdown content. Returns paths, metadata, revisions, and short snippets.",
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string", minLength: 1 },
        includeArchived: { type: "boolean", default: false },
        limit: { type: "integer", minimum: 1, maximum: 50, default: 20 }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
  },
  {
    name: "read_note",
    description: "Read one Markdown note and return its full content and revision identifier.",
    inputSchema: {
      type: "object",
      required: ["path"],
      properties: { path: { type: "string", description: "Library-relative .md or .markdown path." } },
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
  },
  {
    name: "create_note",
    description: "Create a new Markdown note. Requires explicit user confirmation before calling and fails if the path exists.",
    inputSchema: {
      type: "object",
      required: ["path", "content"],
      properties: {
        path: { type: "string", description: "Library-relative path; .md is added if omitted." },
        content: { type: "string" }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false }
  },
  {
    name: "update_note",
    description: "Replace one note after checking its revision. Requires explicit user confirmation before calling.",
    inputSchema: {
      type: "object",
      required: ["path", "content", "expectedRevision"],
      properties: {
        path: { type: "string" },
        content: { type: "string" },
        expectedRevision: { type: "string", description: "Exact revision returned by read_note." }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false }
  },
  {
    name: "archive_note",
    description: "Move a note into the MarkNote archive after checking its revision. Never permanently deletes it.",
    inputSchema: {
      type: "object",
      required: ["path", "expectedRevision"],
      properties: {
        path: { type: "string" },
        expectedRevision: { type: "string", description: "Exact revision returned by read_note." }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false }
  }
];

async function callTool(name, args = {}) {
  const root = await resolveLibraryRoot();
  if (name === "library_status") return { connected: true, libraryRoot: root };
  if (name === "list_notes") return { libraryRoot: root, notes: await listNotes(root, args) };
  if (name === "search_notes") return { libraryRoot: root, notes: await searchNotes(root, args.query, args) };
  if (name === "read_note") return { libraryRoot: root, note: await readNote(root, args.path) };
  if (name === "create_note") return { libraryRoot: root, note: await createNote(root, args.path, args.content) };
  if (name === "update_note") {
    return { libraryRoot: root, note: await updateNote(root, args.path, args.content, args.expectedRevision) };
  }
  if (name === "archive_note") {
    return { libraryRoot: root, note: await archiveNote(root, args.path, args.expectedRevision) };
  }
  throw new MarkNoteError("unknown_tool", `Unknown MarkNote tool: ${name}`);
}

function toolResult(data, isError = false) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
    ...(isError ? { isError: true } : {})
  };
}

async function handleRequest(message) {
  if (message.method === "initialize") {
    return {
      protocolVersion: message.params?.protocolVersion || "2025-06-18",
      capabilities: { tools: { listChanged: false } },
      serverInfo,
      instructions
    };
  }
  if (message.method === "ping") return {};
  if (message.method === "tools/list") return { tools };
  if (message.method === "tools/call") {
    try {
      return toolResult(await callTool(message.params?.name, message.params?.arguments || {}));
    } catch (error) {
      const data = error instanceof MarkNoteError
        ? { ok: false, error: error.code, message: error.message, ...error.details }
        : { ok: false, error: "internal_error", message: error?.message || "Unknown MarkNote error" };
      return toolResult(data, true);
    }
  }
  const error = new Error(`Method not found: ${message.method}`);
  error.rpcCode = -32601;
  throw error;
}

function start() {
  const input = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  input.on("line", async (line) => {
    if (!line.trim()) return;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } })}\n`);
      return;
    }
    if (message.id === undefined || message.method?.startsWith("notifications/")) return;
    try {
      const result = await handleRequest(message);
      process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: message.id, result })}\n`);
    } catch (error) {
      process.stdout.write(`${JSON.stringify({
        jsonrpc: "2.0",
        id: message.id,
        error: { code: error.rpcCode || -32603, message: error.message || "Internal error" }
      })}\n`);
    }
  });
}

if (require.main === module) start();

module.exports = { callTool, handleRequest, start, tools };
