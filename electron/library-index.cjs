const fs = require("node:fs/promises");
const path = require("node:path");

async function scanLibrary(rootPath) {
  const root = resolveLibraryRoot(rootPath);
  const notes = [];
  const folders = new Set();

  async function walk(directory) {
    for (const child of await fs.readdir(directory, { withFileTypes: true })) {
      if (child.name.startsWith(".") || child.name === "node_modules") continue;
      const childPath = path.join(directory, child.name);
      if (child.isDirectory()) {
        folders.add(toPosixPath(path.relative(root, childPath)));
        await walk(childPath);
      } else if (child.isFile() && isMarkdownFile(child.name)) {
        notes.push(await readLibraryNote(root, toPosixPath(path.relative(root, childPath))));
      }
    }
  }

  await walk(root);
  return { notes: sortNotes(notes), folders: sortFolders(folders) };
}

async function refreshLibraryPaths(rootPath, changedPaths = []) {
  const root = resolveLibraryRoot(rootPath);
  const paths = [...new Set(changedPaths.map(normalizeChangedPath).filter(Boolean))];
  if (!paths.length || paths.some((entry) => !isMarkdownFile(entry))) {
    return { full: true, ...await scanLibrary(root) };
  }

  const notes = [];
  const removedPaths = [];
  for (const relativePath of paths) {
    const filePath = resolveInsideRoot(root, relativePath);
    try {
      const stat = await fs.stat(filePath);
      if (stat.isFile()) notes.push(await readLibraryNote(root, relativePath, stat));
      else removedPaths.push(relativePath);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      removedPaths.push(relativePath);
    }
  }

  return {
    full: false,
    notes: sortNotes(notes),
    removedPaths,
    folders: await scanLibraryFolders(root)
  };
}

async function scanLibraryFolders(rootPath) {
  const root = resolveLibraryRoot(rootPath);
  const folders = new Set();
  async function walk(directory) {
    for (const child of await fs.readdir(directory, { withFileTypes: true })) {
      if (child.name.startsWith(".") || child.name === "node_modules" || !child.isDirectory()) continue;
      const childPath = path.join(directory, child.name);
      folders.add(toPosixPath(path.relative(root, childPath)));
      await walk(childPath);
    }
  }
  await walk(root);
  return sortFolders(folders);
}

async function readLibraryNote(rootPath, relativePath, knownStat) {
  const filePath = resolveLibraryPath(rootPath, relativePath);
  const [content, stat] = await Promise.all([
    fs.readFile(filePath, "utf8"),
    knownStat ? Promise.resolve(knownStat) : fs.stat(filePath)
  ]);
  return libraryNoteFromContent(rootPath, relativePath, content, stat);
}

function libraryNoteFromContent(rootPath, relativePath, content, stat) {
  const normalized = normalizeLibraryRelativePath(relativePath);
  return {
    id: normalized,
    title: path.basename(normalized, path.extname(normalized)),
    content,
    relativePath: normalized,
    folder: folderFromRelativePath(normalized),
    updatedAt: stat?.mtime ? stat.mtime.toISOString() : new Date().toISOString(),
    syncState: "synced",
    filePath: resolveLibraryPath(rootPath, normalized)
  };
}

function resolveLibraryRoot(rootPath) {
  if (!String(rootPath || "").trim()) throw new Error("Missing library root");
  return path.resolve(String(rootPath));
}

function resolveLibraryPath(rootPath, relativePath) {
  const root = resolveLibraryRoot(rootPath);
  const normalized = normalizeLibraryRelativePath(relativePath);
  if (!normalized) throw new Error("Invalid library path");
  return resolveInsideRoot(root, normalized);
}

function resolveLibraryFolderPath(rootPath, relativePath) {
  const root = resolveLibraryRoot(rootPath);
  const normalized = normalizeLibraryFolderPath(relativePath);
  if (!normalized) throw new Error("Invalid library folder");
  return resolveInsideRoot(root, normalized);
}

function resolveInsideRoot(root, relativePath) {
  const filePath = path.resolve(root, relativePath);
  if (filePath !== root && !filePath.startsWith(root + path.sep)) throw new Error("Path is outside the library folder");
  return filePath;
}

function normalizeLibraryRelativePath(value) {
  const normalized = toPosixPath(String(value || ""))
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .map(sanitizeLibraryFileName)
    .join("/");
  if (!normalized) return "";
  const extension = path.posix.extname(normalized).toLowerCase();
  if (!extension) return `${normalized}.md`;
  return isMarkdownFile(normalized) ? normalized : `${normalized}.md`;
}

function normalizeChangedPath(value) {
  const normalized = toPosixPath(String(value || "")).replace(/^\/+|\/+$/g, "");
  if (!normalized || normalized.split("/").some((part) => !part || part === "." || part === "..")) return "";
  return normalized;
}

function normalizeLibraryFolderPath(value) {
  return toPosixPath(String(value || ""))
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .map((part) => String(part).replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("/");
}

function sanitizeLibraryFileName(value) {
  return String(value || "Untitled.md").replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim() || "Untitled.md";
}

function folderFromRelativePath(relativePath) {
  const folder = toPosixPath(path.posix.dirname(relativePath));
  return folder === "." ? "" : folder;
}

function isMarkdownFile(filePath) {
  return [".md", ".markdown"].includes(path.extname(String(filePath)).toLowerCase());
}

function sortNotes(notes) {
  return [...notes].sort((a, b) => a.folder === b.folder
    ? a.title.localeCompare(b.title, "zh-Hans-CN")
    : a.folder.localeCompare(b.folder, "zh-Hans-CN"));
}

function sortFolders(folders) {
  return [...folders].sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}

function toPosixPath(value) {
  return String(value || "").split(path.sep).join("/");
}

module.exports = {
  isMarkdownFile,
  libraryNoteFromContent,
  normalizeLibraryFolderPath,
  normalizeLibraryRelativePath,
  refreshLibraryPaths,
  resolveLibraryFolderPath,
  resolveLibraryPath,
  sanitizeLibraryFileName,
  scanLibrary
};
