const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

const {
  buildAiAttachmentPrompt,
  buildAiUserContent,
  prepareAiAttachmentPaths
} = require("../electron/ai-attachments.cjs");

const execFileAsync = promisify(execFile);
const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z1ZQAAAAASUVORK5CYII=",
  "base64"
);

async function withTempDirectory(run) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "marknote-ai-attachments-"));
  try {
    await run(directory);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}

test("prepares text and image attachments", async () => {
  await withTempDirectory(async (directory) => {
    const markdownPath = path.join(directory, "notes.md");
    const imagePath = path.join(directory, "diagram.png");
    await fs.writeFile(markdownPath, "# Attachment\n\nImportant detail.");
    await fs.writeFile(imagePath, onePixelPng);

    const result = await prepareAiAttachmentPaths([markdownPath, imagePath]);
    assert.equal(result.errors.length, 0);
    assert.equal(result.attachments.length, 2);
    assert.equal(result.attachments[0].kind, "document");
    assert.match(result.attachments[0].text, /Important detail/);
    assert.equal(result.attachments[1].kind, "image");
    assert.match(result.attachments[1].dataUrl, /^data:image\/png;base64,/);
  });
});

test("builds provider-appropriate multimodal request content", () => {
  const attachments = [
    {
      kind: "image",
      name: "diagram.png",
      mimeType: "image/png",
      size: onePixelPng.length,
      dataUrl: `data:image/png;base64,${onePixelPng.toString("base64")}`
    },
    {
      kind: "document",
      name: "paper.pdf",
      mimeType: "application/pdf",
      size: 4,
      text: "Extracted paper text",
      fileData: Buffer.from("%PDF").toString("base64")
    }
  ];

  const openAiContent = buildAiUserContent("openai", "Analyze", attachments);
  const mimoContent = buildAiUserContent("mimo", "Analyze", attachments);
  const deepSeekContent = buildAiUserContent("deepseek", "Analyze", attachments);

  assert.deepEqual(openAiContent.map((part) => part.type), ["text", "image_url", "file"]);
  assert.deepEqual(mimoContent.map((part) => part.type), ["text", "image_url"]);
  assert.equal(deepSeekContent, "Analyze");
  assert.match(buildAiAttachmentPrompt("mimo", attachments), /Extracted paper text/);
  assert.match(buildAiAttachmentPrompt("openai", attachments), /supplied directly to the model/);
});

test("enforces attachment count and format limits", async () => {
  await withTempDirectory(async (directory) => {
    const paths = [];
    for (let index = 0; index < 7; index += 1) {
      const filePath = path.join(directory, `note-${index}.txt`);
      await fs.writeFile(filePath, `note ${index}`);
      paths.push(filePath);
    }
    const unsupportedPath = path.join(directory, "archive.bin");
    await fs.writeFile(unsupportedPath, "binary");

    const countResult = await prepareAiAttachmentPaths(paths);
    const formatResult = await prepareAiAttachmentPaths([unsupportedPath]);
    assert.equal(countResult.attachments.length, 6);
    assert.ok(countResult.errors.some((error) => error.error === "too-many"));
    assert.ok(formatResult.errors.some((error) => error.error === "unsupported"));
  });
});

test("extracts PDF and DOCX text on macOS", { skip: process.platform !== "darwin" }, async (t) => {
  await withTempDirectory(async (directory) => {
    const textPath = path.join(directory, "source.txt");
    const pdfPath = path.join(directory, "paper.pdf");
    const docxPath = path.join(directory, "paper.docx");
    await fs.writeFile(textPath, "MarkNote document extraction test\nSecond line.");

    try {
      const pdf = await execFileAsync("/usr/sbin/cupsfilter", [textPath], { encoding: "buffer", maxBuffer: 4 * 1024 * 1024 });
      await fs.writeFile(pdfPath, pdf.stdout);
      await execFileAsync("/usr/bin/textutil", ["-convert", "docx", "-output", docxPath, textPath]);
    } catch {
      t.skip("macOS document conversion tools are unavailable");
      return;
    }

    const result = await prepareAiAttachmentPaths([pdfPath, docxPath]);
    assert.equal(result.errors.length, 0);
    assert.match(result.attachments[0].text, /MarkNote document extraction test/);
    assert.match(result.attachments[1].text, /MarkNote document extraction test/);
  });
});
