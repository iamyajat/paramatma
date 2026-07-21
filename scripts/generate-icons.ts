/**
 * Regenerates every favicon/app-icon asset from the shared brand-icon design
 * (src/lib/brand-icon.tsx). Re-run this after changing that file.
 *
 * icon.tsx and apple-icon.tsx render their own sizes live via Next.js's
 * metadata file convention — this script only produces the assets Next
 * *can't* generate itself: the legacy multi-resolution favicon.ico, and the
 * static PNGs the PWA manifest needs at fixed URLs.
 *
 * Usage: npm run generate-icons
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { renderBrandIcon } from "../src/lib/brand-icon";

const ROOT = process.cwd();

async function renderPng(size: number, maskable = false): Promise<Buffer> {
  const res = await renderBrandIcon(size, { maskable });
  return Buffer.from(await res.arrayBuffer());
}

// Packs PNGs into a classic ICO container (the "PNG-in-ICO" variant, valid
// since Vista and supported by every current browser/OS) — a few dozen lines
// by hand beats adding a dependency just to write one small binary format.
function buildIco(images: { size: number; png: Buffer }[]): Buffer {
  const HEADER_SIZE = 6;
  const ENTRY_SIZE = 16;
  let offset = HEADER_SIZE + ENTRY_SIZE * images.length;

  const header = Buffer.alloc(HEADER_SIZE);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(images.length, 4);

  const entries: Buffer[] = [];
  for (const { size, png } of images) {
    const entry = Buffer.alloc(ENTRY_SIZE);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256px)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color palette size (0 = no palette)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += png.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

async function main() {
  const iconsDir = path.join(ROOT, "public/icons");
  await mkdir(iconsDir, { recursive: true });

  const [ico16, ico32, ico48, pwa192, pwa512, pwa512Maskable] =
    await Promise.all([
      renderPng(16),
      renderPng(32),
      renderPng(48),
      renderPng(192),
      renderPng(512),
      renderPng(512, true),
    ]);

  const ico = buildIco([
    { size: 16, png: ico16 },
    { size: 32, png: ico32 },
    { size: 48, png: ico48 },
  ]);

  await writeFile(path.join(ROOT, "src/app/favicon.ico"), ico);
  await writeFile(path.join(iconsDir, "icon-192.png"), pwa192);
  await writeFile(path.join(iconsDir, "icon-512.png"), pwa512);
  await writeFile(path.join(iconsDir, "icon-512-maskable.png"), pwa512Maskable);

  console.log("Wrote src/app/favicon.ico (16/32/48)");
  console.log("Wrote public/icons/icon-192.png, icon-512.png, icon-512-maskable.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
