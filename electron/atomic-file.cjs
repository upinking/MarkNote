const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

async function atomicWriteFile(filePath, content, options = {}) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.${crypto.randomUUID()}.tmp`
  );

  try {
    await fs.writeFile(temporaryPath, content, options);
    await fs.rename(temporaryPath, filePath);
  } finally {
    await fs.rm(temporaryPath, { force: true }).catch(() => {});
  }
}

module.exports = { atomicWriteFile };
