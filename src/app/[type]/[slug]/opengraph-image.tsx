import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getWorkBySlug } from "@/lib/data";
import { CONTENT_TYPE_META, isContentType } from "@/lib/content-types";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Note: satori (the renderer behind ImageResponse) does not perform complex
// script shaping — Devanagari conjuncts render broken (e.g. "परमात्मा" loses
// the त्म ligature). Confirmed across multiple fonts, so this image sticks to
// English text plus the single-glyph ॐ mark, which needs no shaping. The
// actual site pages are unaffected — browsers shape Devanagari correctly.
async function loadFonts() {
  const dir = path.join(process.cwd(), "src/assets/fonts");
  const [bold, medium] = await Promise.all([
    readFile(path.join(dir, "Eczar-Bold.ttf")),
    readFile(path.join(dir, "Eczar-Medium.ttf")),
  ]);
  return { bold, medium };
}

export default async function Image({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}) {
  const { type, slug } = await params;
  const { bold, medium } = await loadFonts();

  const work = isContentType(type) ? await getWorkBySlug(type, slug) : null;
  const meta = work ? CONTENT_TYPE_META[work.type] : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf7ef",
          padding: "48px",
          position: "relative",
          fontFamily: "Eczar",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "28px",
            left: "28px",
            right: "28px",
            bottom: "28px",
            border: "2px solid #cbb27e",
            borderRadius: "12px",
          }}
        />

        <div style={{ display: "flex", fontSize: 64, color: "#a8792e" }}>
          ॐ
        </div>

        {work ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                marginTop: 32,
                fontSize: work.title.en.length > 28 ? 52 : 66,
                fontWeight: 700,
                color: "#2b2118",
                textAlign: "center",
                maxWidth: 980,
                lineHeight: 1.25,
              }}
            >
              {work.title.en}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontSize: 28,
                fontWeight: 500,
                color: "#7a2e2e",
                textAlign: "center",
              }}
            >
              {meta?.label} · {work.deityName.en}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 56,
              fontWeight: 700,
              color: "#2b2118",
            }}
          >
            Paramatma
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: 48,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 24,
            fontWeight: 700,
            color: "#a8792e",
            letterSpacing: 2,
          }}
        >
          PARAMATMA
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Eczar", data: bold, weight: 700, style: "normal" },
        { name: "Eczar", data: medium, weight: 500, style: "normal" },
      ],
    }
  );
}
