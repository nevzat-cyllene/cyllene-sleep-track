import sharp from "sharp";
import { readFileSync, mkdirSync, copyFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const iconsDir = join(root, "public/icons");
const appDir = join(root, "src/app");
mkdirSync(iconsDir, { recursive: true });

const svg = readFileSync(join(iconsDir, "icon.svg"), "utf8");
const svgBuffer = Buffer.from(svg);

async function writePng(size, outPath) {
  await sharp(svgBuffer).resize(size, size).png().toFile(outPath);
  console.log(`Generated ${outPath}`);
}

await writePng(192, join(iconsDir, "icon-192.png"));
await writePng(512, join(iconsDir, "icon-512.png"));
await writePng(180, join(iconsDir, "apple-touch-icon.png"));

// App Router metadata files — browsers/PWA install UI prefer these over random favicons.
await writePng(512, join(appDir, "icon.png"));
await writePng(180, join(appDir, "apple-icon.png"));

// Root public copies for Safari / older install flows.
copyFileSync(join(iconsDir, "apple-touch-icon.png"), join(root, "public/apple-touch-icon.png"));
copyFileSync(join(iconsDir, "icon-192.png"), join(root, "public/icon-192.png"));
console.log("App Router + public apple-touch icons ready");

