const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const markdownExtensions = new Set([".md", ".markdown"]);
const archiveFolder = "归档";
const maxNoteBytes = 2 * 1024 * 1024;
const maxScanNotes = 10000;

class MarkNoteError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "MarkNoteError";
    this.code = code;
    this.details = details;
  }
}

function revisionFor(content) {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

function titleFromMarkdown(markdown = "", fallback = "Untitled") {
  const lines = String(markdown).split(/\r?\n/);
  const heading = lines.map((line) => line.trim()).find((line) => /^#{1,6}\s+/.test(line));
  if (heading) return heading.replace(/^#{1,6}\s+/, "").replace(/[*_`~]/g, "").trim().slice(0, 100);
  const firstText = lines.map((line) => line.trim()).find(Boolean);
  return (firstText ? firstText.replace(/[#*_`~>-]/g, "").trim() : fallback).slice(0, 100);
}

function normalizeRelativePath(value, options = {}) {
  const raw = String(value || "").trim().replace(/\\/g, "/");
  if (!raw || raw.includes("\0") || path.posix.isAbsolute(raw) || /^[A-Za-z]:\//.test(raw)) {
    throw new MarkNoteError("invalid_path", "A non-empty relative note path is required.");
  }

  const parts = raw.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) {
    throw new MarkNoteError("invalid_path", "The note path cannot contain empty, '.' or '..' segments.");
  }

  let normalized = parts.join("/");
  if (options.addMarkdownExtension && !path.posix.extname(normalized)) normalized += ".md";
  if (!markdownExtensions.has(path.posix.extname(normalized).toLowerCase())) {
    throw new MarkNoteError("invalid_extension", "MarkNote only supports .md and .markdown notes.");
  }
  return normalized;
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function resolveExistingNote(rootPath, relativePath) {
  const root = await fs.realpath(rootPath).catch(() => {
    throw new MarkNoteError("library_missing", "The configured MarkNote library folder does not exist.");
  });
  const normalized = normalizeRelativePath(relativePath);
  const candidate = path.resolve(root, ...normalized.split("/"));
  if (!isInside(root, candidate)) throw new MarkNoteError("outside_library", "The note path is outside the library.");

  const realCandidate = await fs.realpath(candidate).catch(() => {
    throw new MarkNoteError("not_found", `Note not found: ${normalized}`);
  });
  if (!isInside(root, realCandidate)) {
    throw new MarkNoteError("outside_library", "The note resolves outside the library through a symbolic link.");
  }
  return { root, normalized, filePath: realCandidate };
}

async function resolveNewNote(rootPath, relativePath) {
  const root = await fs.realpath(rootPath).catch(() => {
    throw new MarkNoteError("library_missing", "The configured MarkNote library folder does not exist.");
  });
  const normalized = normalizeRelativePath(relativePath, { addMarkdownExtension: true });
  const candidate = path.resolve(root, ...normalized.split("/"));
  if (!isInside(root, candidate)) throw new MarkNoteError("outside_library", "The note path is outside the library.");

  let ancestor = path.dirname(candidate);
  while (ancestor !== root) {
    try {
      const realAncestor = await fs.realpath(ancestor);
      if (!isInside(root, realAncestor)) {
        throw new MarkNoteError("outside_library", "The note folder resolves outside the library through a symbolic link.");
      }
      break;
    } catch (error) {
      if (error instanceof MarkNoteError) throw error;
      ancestor = path.dirname(ancestor);
    }
  }
  return { root, normalized, filePath: candidate };
}

function bridgeCandidates(env = process.env, platform = process.platform, home = os.homedir()) {
  const explicit = env.MARKNOTE_BRIDGE_CONFIG ? [path.resolve(env.MARKNOTE_BRIDGE_CONFIG)] : [];
  if (platform === "darwin") {
    return [
      ...explicit,
      path.join(home, "Library", "Application Support", "marknote", "codex-bridge.json"),
      path.join(home, "Library", "Application Support", "MarkNote", "codex-bridge.json")
    ];
  }
  if (platform === "win32") {
    const appData = env.APPDATA || path.join(home, "AppData", "Roaming");
    return [
      ...explicit,
      path.join(appData, "marknote", "codex-bridge.json"),
      path.join(appData, "MarkNote", "codex-bridge.json")
    ];
  }
  const configHome = env.XDG_CONFIG_HOME || path.join(home, ".config");
  return [...explicit, path.join(configHome, "marknote", "codex-bridge.json")];
}

async function resolveLibraryRoot(options = {}) {
  const explicitRoot = options.env?.MARKNOTE_LIBRARY_PATH || process.env.MARKNOTE_LIBRARY_PATH;
  if (explicitRoot) return validateLibraryRoot(explicitRoot, "environment variable");

  const env = options.env || process.env;
  const candidates = bridgeCandidates(env, options.platform || process.platform, options.home || os.homedir());
  for (const configPath of candidates) {
    try {
      const config = JSON.parse(await fs.readFile(configPath, "utf8"));
      if (config?.libraryRoot) return validateLibraryRoot(config.libraryRoot, configPath);
    } catch (error) {
      if (error instanceof MarkNoteError) throw error;
      if (error?.code !== "ENOENT" && !(error instanceof SyntaxError)) {
        throw new MarkNoteError("config_unreadable", `Could not read MarkNote bridge config: ${configPath}`);
      }
    }
  }
  throw new MarkNoteError(
    "not_configured",
    "No MarkNote library is configured. Open MarkNote and choose a library folder, or set MARKNOTE_LIBRARY_PATH."
  );
}

async function validateLibraryRoot(value, source) {
  const root = await fs.realpath(path.resolve(String(value))).catch(() => {
    throw new MarkNoteError("library_missing", `The MarkNote library from ${source} does not exist.`);
  });
  const stat = await fs.stat(root);
  if (!stat.isDirectory()) throw new MarkNoteError("library_missing", "The configured MarkNote library is not a folder.");
  return root;
}

async function readNote(rootPath, relativePath) {
  const resolved = await resolveExistingNote(rootPath, relativePath);
  const stat = await fs.stat(resolved.filePath);
  if (!stat.isFile()) throw new MarkNoteError("not_found", `Not a note file: ${resolved.normalized}`);
  if (stat.size > maxNoteBytes) {
    throw new MarkNoteError("note_too_large", `Note is larger than ${maxNoteBytes} bytes.`, { size: stat.size });
  }
  const content = await fs.readFile(resolved.filePath, "utf8");
  return noteFromContent(resolved.normalized, content, stat);
}

function noteFromContent(relativePath, content, stat) {
  return {
    path: relativePath,
    title: titleFromMarkdown(content, path.posix.basename(relativePath, path.posix.extname(relativePath))),
    content,
    updatedAt: stat.mtime.toISOString(),
    size: stat.size,
    revision: revisionFor(content),
    archived: relativePath === archiveFolder || relativePath.startsWith(`${archiveFolder}/`)
  };
}

async function scanNotes(rootPath) {
  const root = await validateLibraryRoot(rootPath, "configuration");
  const notes = [];

  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const filePath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        await walk(filePath);
        continue;
      }
      if (!entry.isFile() || !markdownExtensions.has(path.extname(entry.name).toLowerCase())) continue;
      if (notes.length >= maxScanNotes) {
        throw new MarkNoteError("library_too_large", `The library contains more than ${maxScanNotes} notes.`);
      }

      const stat = await fs.stat(filePath);
      if (stat.size > maxNoteBytes) continue;
      const content = await fs.readFile(filePath, "utf8").catch(() => "");
      const relativePath = path.relative(root, filePath).split(path.sep).join("/");
      notes.push(noteFromContent(relativePath, content, stat));
    }
  }

  await walk(root);
  return notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.path.localeCompare(b.path));
}

async function listNotes(rootPath, options = {}) {
  const limit = boundedLimit(options.limit);
  const folder = options.folder ? String(options.folder).replace(/\\/g, "/").replace(/^\/+|\/+$/g, "") : "";
  const notes = (await scanNotes(rootPath)).filter((note) => {
    if (!options.includeArchived && note.archived) return false;
    return !folder || path.posix.dirname(note.path) === folder || note.path.startsWith(`${folder}/`);
  });
  return notes.slice(0, limit).map(withoutContent);
}

async function searchNotes(rootPath, query, options = {}) {
  const normalizedQuery = String(query || "").trim().toLocaleLowerCase();
  if (!normalizedQuery) throw new MarkNoteError("invalid_query", "A search query is required.");
  const limit = boundedLimit(options.limit);
  const matches = [];
  for (const note of await scanNotes(rootPath)) {
    if (!options.includeArchived && note.archived) continue;
    const haystack = `${note.title}\n${note.content}`.toLocaleLowerCase();
    const index = haystack.indexOf(normalizedQuery);
    if (index < 0) continue;
    matches.push({ ...withoutContent(note), snippet: snippetAround(note.content, normalizedQuery) });
    if (matches.length >= limit) break;
  }
  return matches;
}

function boundedLimit(value) {
  const parsed = Number(value ?? 20);
  return Number.isFinite(parsed) ? Math.min(50, Math.max(1, Math.trunc(parsed))) : 20;
}

function withoutContent(note) {
  const { content, ...metadata } = note;
  return metadata;
}

function snippetAround(content, query) {
  const normalized = String(content).toLocaleLowerCase();
  const index = normalized.indexOf(query);
  const start = Math.max(0, index - 80);
  const end = Math.min(content.length, index + query.length + 120);
  return `${start > 0 ? "…" : ""}${content.slice(start, end).replace(/\s+/g, " ").trim()}${end < content.length ? "…" : ""}`;
}

async function atomicWrite(filePath, content) {
  const directory = path.dirname(filePath);
  await fs.mkdir(directory, { recursive: true });
  const temporaryPath = path.join(directory, `.${path.basename(filePath)}.${process.pid}.${crypto.randomUUID()}.tmp`);
  try {
    await fs.writeFile(temporaryPath, content, { encoding: "utf8", flag: "wx" });
    await fs.rename(temporaryPath, filePath);
  } finally {
    await fs.rm(temporaryPath, { force: true }).catch(() => {});
  }
}

async function createNote(rootPath, relativePath, content = "") {
  const resolved = await resolveNewNote(rootPath, relativePath);
  try {
    await fs.lstat(resolved.filePath);
    throw new MarkNoteError("already_exists", `A note already exists at ${resolved.normalized}.`);
  } catch (error) {
    if (error instanceof MarkNoteError) throw error;
    if (error?.code !== "ENOENT") throw error;
  }
  await atomicWrite(resolved.filePath, String(content));
  return readNote(rootPath, resolved.normalized);
}

async function updateNote(rootPath, relativePath, content, expectedRevision) {
  if (!expectedRevision) throw new MarkNoteError("revision_required", "expectedRevision is required for updates.");
  const current = await readNote(rootPath, relativePath);
  if (current.revision !== expectedRevision) {
    throw new MarkNoteError("conflict", "The note changed after it was read. Read it again before updating.", {
      expectedRevision,
      currentRevision: current.revision,
      updatedAt: current.updatedAt
    });
  }
  const resolved = await resolveExistingNote(rootPath, relativePath);
  await atomicWrite(resolved.filePath, String(content));
  return readNote(rootPath, resolved.normalized);
}

async function archiveNote(rootPath, relativePath, expectedRevision) {
  if (!expectedRevision) throw new MarkNoteError("revision_required", "expectedRevision is required for archiving.");
  const current = await readNote(rootPath, relativePath);
  if (current.revision !== expectedRevision) {
    throw new MarkNoteError("conflict", "The note changed after it was read. Read it again before archiving.", {
      expectedRevision,
      currentRevision: current.revision,
      updatedAt: current.updatedAt
    });
  }
  if (current.archived) throw new MarkNoteError("already_archived", "The note is already archived.");

  const source = await resolveExistingNote(rootPath, relativePath);
  const parsed = path.posix.parse(source.normalized);
  const baseTarget = `${archiveFolder}/${parsed.dir ? `${parsed.dir}/` : ""}${parsed.base}`;
  let target = baseTarget;
  let counter = 2;
  for (;;) {
    const resolvedTarget = await resolveNewNote(rootPath, target);
    try {
      await fs.lstat(resolvedTarget.filePath);
      target = `${archiveFolder}/${parsed.dir ? `${parsed.dir}/` : ""}${parsed.name} ${counter}${parsed.ext}`;
      counter += 1;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      await fs.mkdir(path.dirname(resolvedTarget.filePath), { recursive: true });
      await fs.rename(source.filePath, resolvedTarget.filePath);
      return readNote(rootPath, resolvedTarget.normalized);
    }
  }
}

module.exports = {
  MarkNoteError,
  archiveFolder,
  archiveNote,
  bridgeCandidates,
  createNote,
  listNotes,
  normalizeRelativePath,
  readNote,
  resolveLibraryRoot,
  revisionFor,
  scanNotes,
  searchNotes,
  titleFromMarkdown,
  updateNote
};
