import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFonts() {
  const dir = path.join(process.cwd(), "src/assets/fonts");
  const [bold, medium] = await Promise.all([
    readFile(path.join(dir, "Eczar-Bold.ttf")),
    readFile(path.join(dir, "Eczar-Medium.ttf")),
  ]);
  return { bold, medium };
}

export default async function Image() {
  const { bold, medium } = await loadFonts();

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

        <div style={{ display: "flex", fontSize: 88, color: "#a8792e" }}>
          ॐ
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 80,
            fontWeight: 700,
            color: "#2b2118",
            letterSpacing: 1,
          }}
        >
          Paramatma
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 30,
            fontWeight: 500,
            color: "#6e5f4f",
            textAlign: "center",
            maxWidth: 780,
          }}
        >
          Names, hymns, and prayers of the Hindu tradition
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
