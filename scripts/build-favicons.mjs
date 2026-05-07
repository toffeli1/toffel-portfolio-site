// One-shot favicon builder. Runs from project root via:
//   node scripts/build-favicons.mjs
//
// Reads public/favicon-source.png and writes:
//   public/favicon-16x16.png   (16×16 PNG)
//   public/favicon-32x32.png   (32×32 PNG)
//   public/apple-touch-icon.png (180×180 PNG)
//   app/favicon.ico            (single 32×32 PNG-encoded ICO)
//
// ICO format note: sharp does not emit ICO. We resize to 32×32 PNG and wrap
// it in a minimal single-image ICO container — supported by every browser
// that handles ICO at all.

import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const source = resolve(root, "public/favicon-source.png");

const png16  = await sharp(source).resize(16, 16).ensureAlpha().png().toBuffer();
const png32  = await sharp(source).resize(32, 32).ensureAlpha().png().toBuffer();
const png180 = await sharp(source).resize(180, 180).ensureAlpha().png().toBuffer();

writeFileSync(resolve(root, "public/favicon-16x16.png"), png16);
writeFileSync(resolve(root, "public/favicon-32x32.png"), png32);
writeFileSync(resolve(root, "public/apple-touch-icon.png"), png180);

// Wrap the 32×32 PNG in a single-image ICO.
const ico = Buffer.alloc(22 + png32.length);
ico.writeUInt16LE(0, 0);          // reserved
ico.writeUInt16LE(1, 2);          // type: 1 = icon
ico.writeUInt16LE(1, 4);          // count
ico.writeUInt8(32, 6);            // width
ico.writeUInt8(32, 7);            // height
ico.writeUInt8(0, 8);             // palette colors (0 = none)
ico.writeUInt8(0, 9);             // reserved
ico.writeUInt16LE(1, 10);         // color planes
ico.writeUInt16LE(32, 12);        // bits per pixel
ico.writeUInt32LE(png32.length, 14); // size of image data
ico.writeUInt32LE(22, 18);        // offset of image data
png32.copy(ico, 22);

writeFileSync(resolve(root, "app/favicon.ico"), ico);

console.log("Generated favicons:");
console.log("  app/favicon.ico");
console.log("  public/favicon-16x16.png");
console.log("  public/favicon-32x32.png");
console.log("  public/apple-touch-icon.png");
