import DOMPurify from "dompurify";
import katex from "katex";
import { marked } from "marked";

export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function slugifyHeading(text, lineIndex = 0) {
  const slug = String(text)
    .toLowerCase()
    .trim()
    .replace(/[`*_~[\]()#>!.?:"']/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "");
  return `${slug || "heading"}-${lineIndex}`;
}

export function extractHeadings(markdown = "") {
  return String(markdown)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line, lineIndex) => {
      const match = /^(#{1,3})\s+(.+?)\s*$/.exec(line);
      if (!match) return null;
      const text = match[2].replace(/[*_`~]/g, "").trim();
      return {
        id: slugifyHeading(text, lineIndex),
        level: match[1].length,
        line: lineIndex,
        text
      };
    })
    .filter(Boolean);
}

export function markdownToHtml(markdown = "") {
  marked.setOptions({
    breaks: true,
    gfm: true
  });

  const html = markdownToHtmlWithMath(markdown);
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["math", "semantics", "mrow", "mi", "mn", "mo", "msup", "msub", "msubsup", "mfrac", "msqrt", "mroot", "mtext", "annotation"],
    ADD_ATTR: ["target", "rel", "checked", "disabled", "type", "class", "style", "aria-hidden", "xmlns", "encoding", "tabindex"]
  });
}

export function markdownDocumentToHtml(markdown = "") {
  const headings = extractHeadings(markdown);
  const template = document.createElement("template");
  template.innerHTML = markdownToHtml(markdown);

  [...template.content.querySelectorAll("h1, h2, h3")].forEach((headingElement, index) => {
    const heading = headings[index];
    if (heading) {
      headingElement.id = heading.id;
    }
  });

  template.content.querySelectorAll("a[href]").forEach((link) => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noreferrer");
  });

  const wrapper = document.createElement("div");
  wrapper.append(template.content.cloneNode(true));
  return wrapper.innerHTML;
}

function markdownToHtmlWithMath(markdown) {
  const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  const renderedLines = [];
  let inCodeFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!inCodeFence && mathCodeFenceInfo(line)) {
      const end = findCodeFenceEnd(lines, index);
      if (end > index) {
        const math = lines.slice(index + 1, end).join("\n");
        renderedLines.push(renderMathHtml(math, true));
        index = end;
        continue;
      }
    }

    if (!inCodeFence && singleLineDisplayMath(line)) {
      renderedLines.push(renderMathHtml(singleLineDisplayMath(line), true));
      continue;
    }

    if (codeFenceInfo(line)) {
      inCodeFence = !inCodeFence;
      renderedLines.push(line);
      continue;
    }

    if (!inCodeFence && isMathFenceLine(line)) {
      const end = findMathFenceEnd(lines, index);
      if (end > index) {
        const math = lines.slice(index + 1, end).join("\n");
        renderedLines.push(renderMathHtml(math, true));
        index = end;
        continue;
      }
    }

    renderedLines.push(inCodeFence ? line : renderInlineMath(line));
  }

  return marked.parse(renderedLines.join("\n"), { breaks: true, gfm: true });
}

function renderInlineMath(line) {
  return String(line || "").replace(/(^|[^\\$])\$([^$\n]+?)\$/g, (match, prefix, math) => {
    if (!math.trim()) return match;
    return `${prefix}${renderMathHtml(math, false)}`;
  });
}

function singleLineDisplayMath(line) {
  const match = /^\s*\$\$(.+?)\$\$\s*$/.exec(String(line || ""));
  return match?.[1]?.trim() || "";
}

function renderMathHtml(math, displayMode) {
  const source = String(math || "").trim();
  if (!source) return "";

  try {
    const html = katex.renderToString(source, {
      displayMode,
      throwOnError: false,
      strict: false
    });
    const className = displayMode ? "mathBlock" : "mathInline";
    return displayMode
      ? `<div class="${className}">${html}</div>`
      : `<span class="${className}">${html}</span>`;
  } catch {
    return `<code>${escapeHtml(source)}</code>`;
  }
}

function isMathFenceLine(line) {
  return line.trim() === "$$";
}

function findMathFenceEnd(lines, startIndex) {
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (isMathFenceLine(lines[index])) {
      return index;
    }
  }
  return startIndex;
}

function codeFenceInfo(line) {
  const match = /^(\s*)(`{3,}|~{3,})(.*)$/.exec(line);
  if (!match) return null;
  return {
    indent: match[1],
    marker: match[2],
    fence: match[2][0],
    size: match[2].length,
    meta: match[3].trim()
  };
}

function mathCodeFenceInfo(line) {
  const info = codeFenceInfo(line);
  if (!info) return null;

  const language = info.meta.split(/\s+/)[0]?.toLowerCase();
  return ["math", "latex", "tex"].includes(language) ? info : null;
}

function findCodeFenceEnd(lines, startIndex) {
  const opening = codeFenceInfo(lines[startIndex]);
  if (!opening) return startIndex;

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const closing = codeFenceInfo(lines[index]);
    if (closing && closing.fence === opening.fence && closing.size >= opening.size) {
      return index;
    }
  }

  return startIndex;
}
