import sharp from "sharp";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "../public/icons");
mkdirSync(iconsDir, { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="108" fill="#1a0f2e"/>
  <circle cx="256" cy="256" r="140" fill="#8b5cf6" opacity="0.25"/>
  <path d="M256 120c-75 0-136 61-136 136 0 50 27 94 68 117v-29c-28-18-46-49-46-88 0-56 45-101 101-101s101 45 101 101c0 39-18 70-46 88v29c41-23 68-67 68-117 0-75-61-136-136-136z" fill="#a78bfa"/>
  <circle cx="290" cy="230" r="18" fill="#67e8f9" opacity="0.9"/>
</svg>`;

for (const size of [192, 512]) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(join(iconsDir, `icon-${size}.png`));
  console.log(`Generated icon-${size}.png`);
}
