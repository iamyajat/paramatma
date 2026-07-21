import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Shared render for every favicon/app-icon size — one design, one place, so
// the browser tab icon, the iOS home-screen icon, and the PWA manifest icons
// (generated once by scripts/generate-icons.ts) never drift from each other.
// Uses next/og (satori) with the same static Eczar TTF already used for OG
// images — that pairing is already proven to shape the standalone ॐ glyph
// correctly (see opengraph-image.tsx; the conjunct-shaping bug it works
// around doesn't apply to this single codepoint).

const MAROON = "#7a2e2e";
const RING = "#cbb27e";
const MARK = "#f3ead9";

let fontPromise: Promise<Buffer> | null = null;
function loadEczarBold() {
  if (!fontPromise) {
    fontPromise = readFile(
      path.join(process.cwd(), "src/assets/fonts/Eczar-Bold.ttf")
    );
  }
  return fontPromise;
}

export function brandIconElement(size: number, options?: { maskable?: boolean }) {
  const maskable = options?.maskable ?? false;
  const ringInset = Math.round(size * 0.07);
  const ringWidth = Math.max(1, Math.round(size * 0.035));
  const glyphSize = Math.round(size * (maskable ? 0.4 : 0.54));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: MAROON,
        position: "relative",
        fontFamily: "Eczar",
      }}
    >
      {maskable ? null : (
        <div
          style={{
            position: "absolute",
            top: ringInset,
            left: ringInset,
            right: ringInset,
            bottom: ringInset,
            border: `${ringWidth}px solid ${RING}`,
            borderRadius: Math.round(size * 0.22),
          }}
        />
      )}
      <div style={{ display: "flex", fontSize: glyphSize, color: MARK }}>ॐ</div>
    </div>
  );
}

export async function renderBrandIcon(
  size: number,
  options?: { maskable?: boolean }
) {
  const bold = await loadEczarBold();
  return new ImageResponse(brandIconElement(size, options), {
    width: size,
    height: size,
    fonts: [{ name: "Eczar", data: bold, weight: 700, style: "normal" }],
  });
}
