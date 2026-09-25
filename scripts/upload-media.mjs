// Uploads every file in media/ to the R2 bucket "porto" under the same key.
// `node scripts/upload-media.mjs` → remote bucket; `--local` → Wrangler's local dev bucket.
import { execFileSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const mediaDir = path.join(root, "media");
const target = process.argv.includes("--local") ? "--local" : "--remote";

const TYPES = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

const files = (await readdir(mediaDir, { recursive: true, withFileTypes: true }))
  .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
  .map((entry) => path.join(entry.parentPath, entry.name));

for (const file of files) {
  const key = path.relative(mediaDir, file).split(path.sep).join("/");
  const type = TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream";
  execFileSync(
    "npx",
    ["wrangler", "r2", "object", "put", `porto/${key}`, "--file", file, "--content-type", type, target],
    { cwd: root, stdio: ["ignore", "ignore", "inherit"] },
  );
  console.log(`${target === "--local" ? "local" : "r2"}  porto/${key}`);
}
console.log(`Uploaded ${files.length} files.`);
