function normalizeAiContent(content, options = {}) {
  const raw = String(content || "").trim();
  const jsonText = extractAiJsonText(raw);

  try {
    const parsed = JSON.parse(jsonText);
    const parsedMessage = String(parsed.message || "").trim();
    const parsedMarkdown = String(parsed.markdown || "").trim();
    const type = parsed.type === "draft" || (options.needsDraft && parsedMarkdown) ? "draft" : "reply";
    if (options.needsDraft && !parsedMarkdown) {
      return {
        type: "reply",
        message: missingDraftMessage(parsedMessage || raw),
        markdown: ""
      };
    }

    if (type === "reply") {
      return {
        type,
        message: mergeReplyParts(parsedMessage, parsedMarkdown) || raw,
        markdown: ""
      };
    }

    return {
      type,
      message: parsedMessage || "已生成修改草案。",
      markdown: parsedMarkdown
    };
  } catch {
    if (options.needsDraft) {
      return {
        type: "reply",
        message: missingDraftMessage(raw),
        markdown: ""
      };
    }

    const partialMessage = extractPartialJsonStringField(raw, "message");
    const partialMarkdown = extractPartialJsonStringField(raw, "markdown");
    return {
      type: "reply",
      message: mergeReplyParts(partialMessage, partialMarkdown) || raw || "AI 没有返回内容。",
      markdown: ""
    };
  }
}

function mergeReplyParts(message, markdown) {
  const first = String(message || "").trim();
  const second = String(markdown || "").trim();
  if (!first) return second;
  if (!second) return first;
  if (second.includes(first)) return second;
  if (first.includes(second)) return first;
  return `${first}\n\n${second}`;
}

function extractAiJsonText(raw) {
  const trimmed = String(raw || "").trim();
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  if (unfenced.startsWith("{")) return unfenced;

  const start = trimmed.indexOf("{");
  if (start < 0) return unfenced;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < trimmed.length; index += 1) {
    const char = trimmed[index];
    if (escaped) {
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (char === "\"") {
      inString = !inString;
    } else if (!inString && char === "{") {
      depth += 1;
    } else if (!inString && char === "}") {
      depth -= 1;
      if (depth === 0) return trimmed.slice(start, index + 1);
    }
  }

  return unfenced;
}

function missingDraftMessage(message) {
  const detail = String(message || "").trim();
  const prefix = "AI 只返回了说明，没有返回可应用的完整 Markdown 草案，所以当前笔记还没有被修改。请再试一次，或明确要求它“返回完整 Markdown 草案”。";
  return detail ? `${prefix}\n\n原回复：${detail}` : prefix;
}

function extractPartialJsonStringField(jsonText, fieldName) {
  const fieldStart = String(jsonText || "").indexOf(`"${fieldName}"`);
  if (fieldStart < 0) return "";

  const colon = jsonText.indexOf(":", fieldStart);
  if (colon < 0) return "";

  const quote = jsonText.indexOf("\"", colon + 1);
  if (quote < 0) return "";

  let value = "";
  let escaped = false;
  for (let index = quote + 1; index < jsonText.length; index += 1) {
    const char = jsonText[index];
    if (escaped) {
      if (char === "u") {
        const code = jsonText.slice(index + 1, index + 5);
        if (/^[0-9a-f]{4}$/i.test(code)) {
          value += String.fromCharCode(Number.parseInt(code, 16));
          index += 4;
        }
      } else {
        value += decodeJsonEscape(char);
      }
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (char === "\"") {
      break;
    } else {
      value += char;
    }
  }

  return value;
}

function decodeJsonEscape(char) {
  return {
    "\"": "\"",
    "\\": "\\",
    "/": "/",
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t"
  }[char] || char;
}

module.exports = {
  extractPartialJsonStringField,
  mergeReplyParts,
  normalizeAiContent
};
