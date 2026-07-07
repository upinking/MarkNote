const path = require("node:path");
const fs = require("node:fs/promises");
const { execFile } = require("node:child_process");
const { randomUUID } = require("node:crypto");
const { promisify } = require("node:util");

const execFileAsync = promisify(execFile);

const limits = Object.freeze({
  maxCount: 6,
  maxImageBytes: 8 * 1024 * 1024,
  maxFileBytes: 12 * 1024 * 1024,
  maxTotalBytes: 24 * 1024 * 1024,
  maxTextCharacters: 120000
});

const imageMimeTypes = Object.freeze({
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif"
});

const documentMimeTypes = Object.freeze({
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".rtf": "application/rtf",
  ".odt": "application/vnd.oasis.opendocument.text",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".csv": "text/csv",
  ".tsv": "text/tab-separated-values",
  ".json": "application/json",
  ".html": "text/html",
  ".htm": "text/html",
  ".xml": "text/xml",
  ".yaml": "text/yaml",
  ".yml": "text/yaml",
  ".md": "text/markdown",
  ".markdown": "text/markdown",
  ".txt": "text/plain",
  ".text": "text/plain",
  ".log": "text/plain",
  ".tex": "text/x-tex"
});

const textExtensions = new Set([
  ".txt", ".text", ".md", ".markdown", ".csv", ".tsv", ".json", ".html", ".htm", ".xml",
  ".yaml", ".yml", ".log", ".tex", ".css", ".scss", ".less", ".js", ".mjs", ".cjs", ".ts",
  ".tsx", ".jsx", ".py", ".java", ".c", ".h", ".cpp", ".hpp", ".cs", ".go", ".rs", ".swift",
  ".kt", ".kts", ".php", ".rb", ".sh", ".zsh", ".bash", ".sql", ".toml", ".ini", ".conf",
  ".properties", ".gradle", ".vue", ".svelte", ".astro", ".graphql", ".gql"
]);

const richDocumentExtensions = new Set([
  ".pdf", ".doc", ".docx", ".rtf", ".odt", ".ppt", ".pptx", ".xls", ".xlsx"
]);

const wordExtensions = new Set([".doc", ".docx", ".rtf", ".odt"]);

const selectableExtensions = Object.freeze([
  ...Object.keys(imageMimeTypes).map((extension) => extension.slice(1)),
  ...new Set([...textExtensions, ...richDocumentExtensions].map((extension) => extension.slice(1)))
]);

function extensionFor(fileName) {
  return path.extname(String(fileName || "")).toLowerCase();
}

function mimeTypeFor(fileName) {
  const extension = extensionFor(fileName);
  if (imageMimeTypes[extension]) return imageMimeTypes[extension];
  if (documentMimeTypes[extension]) return documentMimeTypes[extension];
  if (textExtensions.has(extension)) return "text/plain";
  return "application/octet-stream";
}

function isSupportedFileName(fileName) {
  const extension = extensionFor(fileName);
  return Boolean(imageMimeTypes[extension] || textExtensions.has(extension) || richDocumentExtensions.has(extension));
}

function truncateText(text) {
  const value = String(text || "").replace(/\u0000/g, "").trim();
  if (value.length <= limits.maxTextCharacters) {
    return { text: value, truncated: false };
  }
  return {
    text: `${value.slice(0, limits.maxTextCharacters)}\n\n[Attachment text truncated by MarkNote]`,
    truncated: true
  };
}

async function extractPdfText(filePath) {
  if (process.platform !== "darwin") return "";

  const script = [
    "ObjC.import('PDFKit');",
    "function run(argv) {",
    "  const url = $.NSURL.fileURLWithPath(argv[0]);",
    "  const doc = $.PDFDocument.alloc.initWithURL(url);",
    "  if (!doc) throw new Error('Unable to open PDF');",
    "  const parts = [];",
    "  for (let i = 0; i < Number(doc.pageCount); i += 1) {",
    "    const page = doc.pageAtIndex(i);",
    "    const value = page.string;",
    "    if (value) parts.push(ObjC.unwrap(value));",
    "  }",
    "  return parts.join('\\n\\n');",
    "}"
  ].join("\n");

  const result = await execFileAsync("/usr/bin/osascript", ["-l", "JavaScript", "-e", script, filePath], {
    maxBuffer: 16 * 1024 * 1024
  });
  return result.stdout || "";
}

async function extractWordText(filePath) {
  if (process.platform !== "darwin") return "";
  const result = await execFileAsync("/usr/bin/textutil", ["-convert", "txt", "-stdout", filePath], {
    maxBuffer: 16 * 1024 * 1024
  });
  return result.stdout || "";
}

async function extractDocumentText(filePath, extension) {
  if (textExtensions.has(extension)) {
    return fs.readFile(filePath, "utf8");
  }
  if (extension === ".pdf") {
    return extractPdfText(filePath).catch(() => "");
  }
  if (wordExtensions.has(extension)) {
    return extractWordText(filePath).catch(() => "");
  }
  return "";
}

async function prepareAiAttachment(filePath) {
  const name = path.basename(filePath);
  const extension = extensionFor(name);
  if (!isSupportedFileName(name)) {
    return { ok: false, error: "unsupported", name };
  }

  const stat = await fs.stat(filePath);
  if (!stat.isFile()) {
    return { ok: false, error: "not-file", name };
  }

  const isImage = Boolean(imageMimeTypes[extension]);
  const maxBytes = isImage ? limits.maxImageBytes : limits.maxFileBytes;
  if (stat.size > maxBytes) {
    return { ok: false, error: "too-large", name, size: stat.size, maxBytes };
  }

  const buffer = await fs.readFile(filePath);
  const mimeType = mimeTypeFor(name);
  if (isImage) {
    return {
      ok: true,
      attachment: {
        id: randomUUID(),
        kind: "image",
        name,
        mimeType,
        size: stat.size,
        dataUrl: `data:${mimeType};base64,${buffer.toString("base64")}`
      }
    };
  }

  const extracted = truncateText(await extractDocumentText(filePath, extension));
  return {
    ok: true,
    attachment: {
      id: randomUUID(),
      kind: "document",
      name,
      mimeType,
      size: stat.size,
      text: extracted.text,
      truncated: extracted.truncated,
      fileData: richDocumentExtensions.has(extension) ? buffer.toString("base64") : ""
    }
  };
}

async function prepareAiAttachmentPaths(filePaths) {
  const requestedPaths = Array.isArray(filePaths) ? filePaths : [];
  const paths = [...new Set(requestedPaths.filter(Boolean))].slice(0, limits.maxCount);
  const attachments = [];
  const errors = [];
  let totalBytes = 0;

  for (const filePath of paths) {
    try {
      const result = await prepareAiAttachment(filePath);
      if (!result.ok) {
        errors.push(result);
        continue;
      }
      if (totalBytes + result.attachment.size > limits.maxTotalBytes) {
        errors.push({ ok: false, error: "total-too-large", name: result.attachment.name });
        continue;
      }
      totalBytes += result.attachment.size;
      attachments.push(result.attachment);
    } catch {
      errors.push({ ok: false, error: "read-failed", name: path.basename(filePath) });
    }
  }

  if (requestedPaths.length > limits.maxCount) {
    errors.push({ ok: false, error: "too-many", maxCount: limits.maxCount });
  }

  return { ok: true, attachments, errors };
}

function normalizeAiAttachments(attachments) {
  return (attachments || []).slice(0, limits.maxCount).flatMap((attachment) => {
    const kind = attachment?.kind === "image" ? "image" : attachment?.kind === "document" ? "document" : "";
    const name = path.basename(String(attachment?.name || "attachment"));
    const mimeType = String(attachment?.mimeType || mimeTypeFor(name));
    const size = Number(attachment?.size || 0);
    if (!kind || !Number.isFinite(size) || size < 0) return [];

    if (kind === "image") {
      const dataUrl = String(attachment?.dataUrl || "");
      if (!/^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(dataUrl)) return [];
      return [{ kind, name, mimeType, size, dataUrl }];
    }

    const normalizedText = truncateText(attachment?.text || "");
    const fileData = String(attachment?.fileData || "");
    return [{
      kind,
      name,
      mimeType,
      size,
      text: normalizedText.text,
      truncated: Boolean(attachment?.truncated || normalizedText.truncated),
      fileData: /^[A-Za-z0-9+/]*={0,2}$/.test(fileData) ? fileData : ""
    }];
  });
}

function buildAiAttachmentPrompt(provider, attachments) {
  const sections = [];
  const nativeFiles = [];
  const images = [];

  for (const attachment of normalizeAiAttachments(attachments)) {
    if (attachment.kind === "image") {
      images.push(attachment.name);
      continue;
    }

    if (provider === "openai" && attachment.fileData) {
      nativeFiles.push(attachment.name);
      continue;
    }

    if (attachment.text) {
      sections.push(`--- Attachment: ${attachment.name} ---\n${attachment.text}`);
    } else {
      sections.push(`--- Attachment: ${attachment.name} ---\n[No text could be extracted from this file.]`);
    }
  }

  const notes = [];
  if (images.length) notes.push(`Attached images: ${images.join(", ")}. Inspect them as part of the request.`);
  if (nativeFiles.length) notes.push(`Attached files supplied directly to the model: ${nativeFiles.join(", ")}.`);
  if (sections.length) notes.push(`Extracted attachment contents:\n\n${sections.join("\n\n")}`);
  return notes.join("\n\n");
}

function buildAiUserContent(provider, userPrompt, attachments) {
  const normalized = normalizeAiAttachments(attachments);
  if (provider === "deepseek") return userPrompt;

  const parts = [{ type: "text", text: userPrompt }];
  for (const attachment of normalized) {
    if (attachment.kind === "image") {
      parts.push({
        type: "image_url",
        image_url: { url: attachment.dataUrl, detail: "auto" }
      });
    } else if (provider === "openai" && attachment.fileData) {
      parts.push({
        type: "file",
        file: {
          filename: attachment.name,
          file_data: `data:${attachment.mimeType};base64,${attachment.fileData}`
        }
      });
    }
  }

  return parts.length === 1 ? userPrompt : parts;
}

module.exports = {
  buildAiAttachmentPrompt,
  buildAiUserContent,
  isSupportedFileName,
  limits,
  mimeTypeFor,
  normalizeAiAttachments,
  prepareAiAttachment,
  prepareAiAttachmentPaths,
  selectableExtensions
};
