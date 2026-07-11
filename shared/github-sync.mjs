const githubApiBase = "https://api.github.com";
const markdownExtensions = [".md", ".markdown"];

export class GitHubSyncError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "GitHubSyncError";
    this.status = options.status || 0;
    this.code = options.code || "sync-error";
  }
}

export function normalizeGitHubSettings(value = {}) {
  const owner = String(value.owner || "").trim();
  const repo = String(value.repo || "").trim();
  const branch = String(value.branch || "main").trim() || "main";
  const remoteFolder = normalizeRelativePath(value.remoteFolder || "notes", { allowEmpty: true });

  if (!/^[A-Za-z0-9_.-]+$/.test(owner)) {
    throw new GitHubSyncError("请填写正确的 GitHub 用户名。", { code: "invalid-owner" });
  }
  if (!/^[A-Za-z0-9_.-]+$/.test(repo)) {
    throw new GitHubSyncError("请填写正确的 GitHub 仓库名。", { code: "invalid-repo" });
  }
  if (!branch || branch.length > 255) {
    throw new GitHubSyncError("请填写正确的分支名。", { code: "invalid-branch" });
  }

  return { owner, repo, branch, remoteFolder };
}

export function normalizeLocalNotes(notes = []) {
  const result = [];
  const seen = new Set();
  for (const note of notes) {
    const path = normalizeRelativePath(note?.path || note?.relativePath || "");
    if (!isMarkdownPath(path)) continue;
    if (seen.has(path)) {
      throw new GitHubSyncError(`发现重复的笔记路径：${path}`, { code: "duplicate-path" });
    }
    seen.add(path);
    result.push({ path, content: String(note?.content || "") });
  }
  return result;
}

export function createGitHubClient({ settings, token, fetchImpl = globalThis.fetch }) {
  const normalized = normalizeGitHubSettings(settings);
  const accessToken = String(token || "").trim();
  if (!accessToken) {
    throw new GitHubSyncError("请先填写 GitHub Token。", { code: "missing-token" });
  }
  if (typeof fetchImpl !== "function") {
    throw new GitHubSyncError("当前环境无法连接 GitHub。", { code: "fetch-unavailable" });
  }

  const repositoryPath = `/repos/${encodeURIComponent(normalized.owner)}/${encodeURIComponent(normalized.repo)}`;

  async function request(method, endpoint, body, options = {}) {
    let response;
    try {
      response = await fetchImpl(`${githubApiBase}${endpoint}`, {
        method,
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
          ...(body === undefined ? {} : { "Content-Type": "application/json" })
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) })
      });
    } catch (error) {
      throw new GitHubSyncError(`无法连接 GitHub：${error?.message || "网络错误"}`, { code: "network-error" });
    }

    if (options.allow404 && response.status === 404) return null;
    if (!response.ok) {
      let detail = "";
      try {
        detail = (await response.json())?.message || "";
      } catch {
        detail = await response.text().catch(() => "");
      }
      const message = friendlyApiError(response.status, detail);
      throw new GitHubSyncError(message, { status: response.status, code: "github-api" });
    }
    if (response.status === 204) return null;
    return response.json();
  }

  function contentsEndpoint(remotePath = "") {
    const encoded = normalizeRelativePath(remotePath, { allowEmpty: true })
      .split("/")
      .filter(Boolean)
      .map(encodeURIComponent)
      .join("/");
    return `${repositoryPath}/contents${encoded ? `/${encoded}` : ""}`;
  }

  return {
    settings: normalized,
    async verifyRepository() {
      await request("GET", repositoryPath);
      const branch = await request("GET", `${repositoryPath}/branches/${encodeURIComponent(normalized.branch)}`, undefined, { allow404: true });
      if (!branch) {
        throw new GitHubSyncError(`找不到分支“${normalized.branch}”。请先在仓库中创建一个文件。`, { code: "missing-branch" });
      }
    },
    async listDirectory(remotePath = "") {
      const suffix = `?ref=${encodeURIComponent(normalized.branch)}`;
      const result = await request("GET", `${contentsEndpoint(remotePath)}${suffix}`, undefined, { allow404: true });
      if (result === null) return [];
      if (!Array.isArray(result)) return [result];
      return result;
    },
    async readFile(remotePath) {
      const suffix = `?ref=${encodeURIComponent(normalized.branch)}`;
      const result = await request("GET", `${contentsEndpoint(remotePath)}${suffix}`);
      if (result?.type !== "file" || result.encoding !== "base64" || typeof result.content !== "string") {
        throw new GitHubSyncError(`无法读取远端文件：${remotePath}`, { code: "invalid-remote-file" });
      }
      return { sha: result.sha, content: decodeBase64Utf8(result.content.replace(/\s/g, "")) };
    },
    async writeFile(remotePath, content, sha = "") {
      const body = {
        message: `MarkNote: 同步 ${normalizeRelativePath(remotePath)}`,
        content: encodeBase64Utf8(String(content || "")),
        branch: normalized.branch,
        ...(sha ? { sha } : {})
      };
      const result = await request("PUT", contentsEndpoint(remotePath), body);
      return { sha: result?.content?.sha || "" };
    },
    async deleteFile(remotePath, sha) {
      await request("DELETE", contentsEndpoint(remotePath), {
        message: `MarkNote: 删除 ${normalizeRelativePath(remotePath)}`,
        sha,
        branch: normalized.branch
      });
    }
  };
}

export async function readRemoteNotes(client) {
  await client.verifyRepository();
  const root = client.settings.remoteFolder;
  const files = [];

  async function walk(remotePath) {
    const entries = await client.listDirectory(remotePath);
    for (const entry of entries) {
      if (entry?.type === "dir") {
        await walk(entry.path);
      } else if (entry?.type === "file" && isMarkdownPath(entry.path || "")) {
        const file = await client.readFile(entry.path);
        const localPath = root ? entry.path.slice(root.length).replace(/^\/+/, "") : entry.path;
        if (localPath) files.push({ path: normalizeRelativePath(localPath), content: file.content, sha: file.sha });
      }
    }
  }

  await walk(root);
  return files.sort((a, b) => a.path.localeCompare(b.path, "zh-Hans-CN"));
}

export async function syncNotesWithGitHub(options = {}) {
  const client = options.client || createGitHubClient(options);
  const localNotes = normalizeLocalNotes(options.localNotes || []);
  const baseline = normalizeBaseline(options.baseline);
  const writeLocal = options.writeLocal;
  const deleteLocal = options.deleteLocal;
  if (typeof writeLocal !== "function" || typeof deleteLocal !== "function") {
    throw new GitHubSyncError("同步器缺少本地文件操作。", { code: "missing-local-operations" });
  }

  const remoteNotes = await readRemoteNotes(client);
  const local = new Map(localNotes.map((note) => [note.path, { ...note }]));
  const remote = new Map(remoteNotes.map((note) => [note.path, { ...note }]));
  const base = new Map(Object.entries(baseline.notes || {}));
  const summary = { uploaded: 0, downloaded: 0, deletedLocal: 0, deletedRemote: 0, conflicts: [] };
  const occupiedPaths = new Set([...local.keys(), ...remote.keys()]);
  const now = options.now instanceof Date ? options.now : new Date();
  const deviceLabel = sanitizeFilenamePart(options.deviceLabel || "本机");
  const resolveConflict = typeof options.resolveConflict === "function"
    ? options.resolveConflict
    : async () => "both";

  const remotePathFor = (localPath) => client.settings.remoteFolder
    ? `${client.settings.remoteFolder}/${localPath}`
    : localPath;

  async function storeLocal(path, content) {
    await writeLocal(path, content);
    local.set(path, { path, content });
    summary.downloaded += 1;
  }

  async function removeLocal(path) {
    await deleteLocal(path);
    local.delete(path);
    summary.deletedLocal += 1;
  }

  async function storeRemote(path, content, sha = "") {
    const result = await client.writeFile(remotePathFor(path), content, sha);
    remote.set(path, { path, content, sha: result.sha });
    summary.uploaded += 1;
  }

  async function removeRemote(path, sha) {
    await client.deleteFile(remotePathFor(path), sha);
    remote.delete(path);
    summary.deletedRemote += 1;
  }

  async function askConflict(details) {
    const choice = await resolveConflict(details);
    return ["local", "remote", "both"].includes(choice) ? choice : "both";
  }

  function recordConflict(path, reason, resolution, conflictPath = "") {
    summary.conflicts.push({ path, conflictPath, reason, resolution });
  }

  async function preserveConflictVersion(path, content, reason, label = deviceLabel) {
    const conflictPath = uniqueConflictPath(path, occupiedPaths, sanitizeFilenamePart(label), now);
    occupiedPaths.add(conflictPath);
    await writeLocal(conflictPath, content);
    local.set(conflictPath, { path: conflictPath, content });
    await storeRemote(conflictPath, content);
    recordConflict(path, reason, "both", conflictPath);
    return conflictPath;
  }

  const paths = [...new Set([...local.keys(), ...remote.keys(), ...base.keys()])].sort();
  for (const path of paths) {
    const localNote = local.get(path);
    const remoteNote = remote.get(path);
    const baseNote = base.get(path);

    if (!baseNote) {
      if (localNote && remoteNote) {
        if (localNote.content !== remoteNote.content) {
          const reason = "both-created";
          const choice = await askConflict({ path, reason, localContent: localNote.content, remoteContent: remoteNote.content });
          if (choice === "local") {
            await storeRemote(path, localNote.content, remoteNote.sha);
            recordConflict(path, reason, choice);
          } else if (choice === "remote") {
            await storeLocal(path, remoteNote.content);
            recordConflict(path, reason, choice);
          } else {
            await preserveConflictVersion(path, localNote.content, reason);
            await storeLocal(path, remoteNote.content);
          }
        }
      } else if (localNote) {
        await storeRemote(path, localNote.content);
      } else if (remoteNote) {
        await storeLocal(path, remoteNote.content);
      }
      continue;
    }

    if (localNote && remoteNote) {
      const localChanged = localNote.content !== String(baseNote.content || "");
      const remoteChanged = remoteNote.sha !== String(baseNote.remoteSha || "");
      if (localChanged && remoteChanged && localNote.content !== remoteNote.content) {
        const reason = "both-changed";
        const choice = await askConflict({ path, reason, localContent: localNote.content, remoteContent: remoteNote.content });
        if (choice === "local") {
          await storeRemote(path, localNote.content, remoteNote.sha);
          recordConflict(path, reason, choice);
        } else if (choice === "remote") {
          await storeLocal(path, remoteNote.content);
          recordConflict(path, reason, choice);
        } else {
          await preserveConflictVersion(path, localNote.content, reason);
          await storeLocal(path, remoteNote.content);
        }
      } else if (localChanged && !remoteChanged) {
        await storeRemote(path, localNote.content, remoteNote.sha);
      } else if (!localChanged && remoteChanged) {
        await storeLocal(path, remoteNote.content);
      }
      continue;
    }

    if (!localNote && remoteNote) {
      const remoteChanged = remoteNote.sha !== String(baseNote.remoteSha || "");
      if (remoteChanged) {
        const reason = "local-deleted-remote-changed";
        const choice = await askConflict({ path, reason, localContent: null, remoteContent: remoteNote.content });
        if (choice === "local") {
          await removeRemote(path, remoteNote.sha);
          recordConflict(path, reason, choice);
        } else if (choice === "remote") {
          await storeLocal(path, remoteNote.content);
          recordConflict(path, reason, choice);
        } else {
          await preserveConflictVersion(path, remoteNote.content, reason, "GitHub");
          await removeRemote(path, remoteNote.sha);
        }
      } else {
        await removeRemote(path, remoteNote.sha);
      }
      continue;
    }

    if (localNote && !remoteNote) {
      const localChanged = localNote.content !== String(baseNote.content || "");
      if (localChanged) {
        const reason = "remote-deleted-local-changed";
        const choice = await askConflict({ path, reason, localContent: localNote.content, remoteContent: null });
        if (choice === "local") {
          await storeRemote(path, localNote.content);
          recordConflict(path, reason, choice);
        } else if (choice === "remote") {
          await removeLocal(path);
          recordConflict(path, reason, choice);
        } else {
          await preserveConflictVersion(path, localNote.content, reason);
          await removeLocal(path);
        }
      } else {
        await removeLocal(path);
      }
    }
  }

  const nextBaseline = { version: 1, notes: {}, syncedAt: new Date().toISOString() };
  for (const [path, localNote] of local) {
    const remoteNote = remote.get(path);
    if (!remoteNote || localNote.content !== remoteNote.content || !remoteNote.sha) continue;
    nextBaseline.notes[path] = { content: localNote.content, remoteSha: remoteNote.sha };
  }

  return { summary, baseline: nextBaseline, notes: [...local.values()].sort((a, b) => a.path.localeCompare(b.path, "zh-Hans-CN")) };
}

function normalizeBaseline(value) {
  if (!value || value.version !== 1 || typeof value.notes !== "object" || Array.isArray(value.notes)) {
    return { version: 1, notes: {} };
  }
  return value;
}

function normalizeRelativePath(value, options = {}) {
  const path = String(value || "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "").replace(/\/{2,}/g, "/");
  if (!path && options.allowEmpty) return "";
  const parts = path.split("/");
  if (!path || parts.some((part) => !part || part === "." || part === ".." || part.includes("\0"))) {
    throw new GitHubSyncError(`不安全的笔记路径：${value || "（空）"}`, { code: "invalid-path" });
  }
  return path;
}

function isMarkdownPath(value) {
  const lower = String(value || "").toLowerCase();
  return markdownExtensions.some((extension) => lower.endsWith(extension));
}

function sanitizeFilenamePart(value) {
  return String(value || "本机").replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim() || "本机";
}

function uniqueConflictPath(originalPath, occupiedPaths, deviceLabel, now) {
  const slash = originalPath.lastIndexOf("/");
  const folder = slash >= 0 ? originalPath.slice(0, slash + 1) : "";
  const fileName = slash >= 0 ? originalPath.slice(slash + 1) : originalPath;
  const dot = fileName.lastIndexOf(".");
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  const extension = dot > 0 ? fileName.slice(dot) : ".md";
  const stamp = now.toISOString().slice(0, 19).replace(/[-:T]/g, "");
  let candidate = `${folder}${base} (冲突-${deviceLabel}-${stamp})${extension}`;
  let index = 2;
  while (occupiedPaths.has(candidate)) {
    candidate = `${folder}${base} (冲突-${deviceLabel}-${stamp}-${index})${extension}`;
    index += 1;
  }
  return candidate;
}

function encodeBase64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function decodeBase64Utf8(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new TextDecoder().decode(bytes);
}

function friendlyApiError(status, detail) {
  if (status === 401) return "GitHub Token 无效，请重新填写。";
  if (status === 403) return "GitHub 拒绝了请求。请检查 Token 的 Contents 读写权限或 API 限额。";
  if (status === 404) return "找不到 GitHub 仓库、分支或文件，请检查同步设置。";
  if (status === 409) return "GitHub 仓库尚未初始化，或远端版本刚刚发生变化。请检查仓库后再次同步。";
  if (status === 422) return `GitHub 无法接受这次修改：${detail || "远端版本可能已改变，请重新同步。"}`;
  return `GitHub 请求失败（${status}）${detail ? `：${detail}` : ""}`;
}
