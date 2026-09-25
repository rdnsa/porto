// Builds the web-ready images in media/ (mirrors the R2 bucket layout) from media-src/.
// Run `python3 scripts/extract-pdf-images.py` and `swift scripts/cutout.swift ...` first.
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const src = (file) => path.join(root, "media-src", file);
const out = (key) => path.join(root, "media", key);

// crop: region to keep (drops browser chrome, taskbars and scrollbars from the screenshots).
const jobs = [
  { key: "profile/portrait.webp", from: "portrait.jpg", width: 1024, quality: 82 },
  { key: "profile/portrait-cutout.webp", from: "portrait-cutout.png", width: 1024, quality: 88, alpha: true },
  { key: "education/graduation.webp", from: "graduation.jpg", width: 1600, quality: 80 },
  { key: "about/itb-gig-economy.webp", from: "pdf/itb-event.png", width: 1600, quality: 78 },
  { key: "projects/ifc-news/home.webp", from: "pdf/ifc-home.png", crop: { left: 0, top: 33, width: 794, height: 381 } },
  { key: "projects/ifc-news/news-stream.webp", from: "pdf/ifc-news-stream.png" },
  { key: "projects/ifc-news/search-console.webp", from: "pdf/ifc-search-console.png", crop: { left: 150, top: 88, width: 521, height: 226 } },
  { key: "projects/ifc-news/sprint-board.webp", from: "pdf/ifc-sprint-board.png", crop: { left: 0, top: 47, width: 547, height: 244 } },
  { key: "projects/ifc-news/team.webp", from: "pdf/ifc-team.png" },
  { key: "projects/satglow-erp/dashboard.webp", from: "pdf/satglow-dashboard.png", crop: { left: 0, top: 97, width: 1084, height: 484 } },
  { key: "projects/nose-one/dashboard.webp", from: "pdf/nose-one-dashboard.png" },
  { key: "projects/genius-ai/devices.webp", from: "pdf/genius-ai-devices.png" },
  { key: "projects/nordpartners/home.webp", from: "pdf/nordpartners-home.png" },
  { key: "projects/aix-expo/home.webp", from: "pdf/aix-home.png" },
];

await rm(path.join(root, "media"), { recursive: true, force: true });

for (const job of jobs) {
  await mkdir(path.dirname(out(job.key)), { recursive: true });
  let image = sharp(src(job.from));
  if (job.crop) image = image.extract(job.crop);
  if (job.width) image = image.resize({ width: job.width, withoutEnlargement: true });
  const info = await image
    .webp({ quality: job.quality ?? 84, alphaQuality: job.alpha ? 92 : undefined, effort: 6, smartSubsample: true })
    .toFile(out(job.key));
  console.log(`${job.key.padEnd(44)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}

// Open Graph card: Studio Mist canvas, name + role on the left, the cut-out portrait on the right.
const og = { width: 1200, height: 630 };
const text = `
<svg width="${og.width}" height="${og.height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .display { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; fill: #1d1d1f; }
  </style>
  <text x="72" y="118" class="display" font-size="26" font-weight="500" fill="#707070">Portfolio</text>
  <text x="68" y="262" class="display" font-size="112" font-weight="700" letter-spacing="-4">Raden</text>
  <text x="68" y="378" class="display" font-size="112" font-weight="700" letter-spacing="-4">Issa.</text>
  <text x="72" y="462" class="display" font-size="34" font-weight="500" letter-spacing="-0.5">Product &amp; Project Manager</text>
  <text x="72" y="508" class="display" font-size="26" font-weight="400" fill="#707070">Driving projects, products &amp; growth.</text>
  <rect x="72" y="548" width="128" height="4" rx="2" fill="#0071e3"/>
</svg>`;
const portrait = await sharp(src("portrait-cutout.png")).resize({ height: 600 }).png().toBuffer();
await mkdir(path.dirname(out("og/cover.jpg")), { recursive: true });
await sharp({ create: { ...og, channels: 3, background: "#f5f5f7" } })
  .composite([
    { input: Buffer.from(text), left: 0, top: 0 },
    { input: portrait, left: 640, top: og.height - 600 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(out("og/cover.jpg"));
console.log("og/cover.jpg                                 1200x630");
