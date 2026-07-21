import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Shared render for every favicon/app-icon size — one design, one place, so
// the browser tab icon, the iOS home-screen icon, and the PWA manifest icons
// (generated once by scripts/generate-icons.ts) never drift from each other.
// Matches the real on-page mark exactly: ivory background, gold ॐ, set in
// Tiro Devanagari Sanskrit (the same font src/components/icons/om-mark.tsx
// uses via --font-scripture) — not a separate invented brand treatment.

const IVORY = "#fbf7ef";
const GOLD = "#a8792e";

let fontPromise: Promise<Buffer> | null = null;
function loadTiro() {
  if (!fontPromise) {
    fontPromise = readFile(
      path.join(process.cwd(), "src/assets/fonts/TiroDevanagariSanskrit-Regular.ttf")
    );
  }
  return fontPromise;
}

export function brandIconElement(size: number, options?: { maskable?: boolean }) {
  const maskable = options?.maskable ?? false;
  const glyphSize = Math.round(size * (maskable ? 0.42 : 0.6));
  // Tiro Devanagari Sanskrit's line-box reserves more space above ॐ than
  // below it (vowel-mark ascender space the glyph itself doesn't use), so
  // flexbox centering alone renders it visibly high. Nudge down by a
  // font-size-relative amount, calibrated empirically against the actual
  // rendered pixel bounding box until top/bottom margins matched.
  const nudge = Math.round(glyphSize * 0.157);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: IVORY,
        fontFamily: "Tiro",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: glyphSize,
          color: GOLD,
          transform: `translateY(${nudge}px)`,
        }}
      >
        ॐ
      </div>
    </div>
  );
}

export async function renderBrandIcon(
  size: number,
  options?: { maskable?: boolean }
) {
  const font = await loadTiro();
  return new ImageResponse(brandIconElement(size, options), {
    width: size,
    height: size,
    fonts: [{ name: "Tiro", data: font, weight: 400, style: "normal" }],
  });
}
