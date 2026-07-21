import { Eczar, Noto_Serif, Tiro_Devanagari_Sanskrit } from "next/font/google";

// Display font — headings, deity names, site title. Covers Devanagari + Latin
// with a warm, devotional character.
export const display = Eczar({
  subsets: ["devanagari", "latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

// Scripture font — shlokas, mantras, and names in Devanagari. Designed
// specifically for Sanskrit, including Vedic accent marks.
export const scripture = Tiro_Devanagari_Sanskrit({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["devanagari", "latin", "latin-ext"],
  variable: "--font-scripture",
  display: "swap",
});

// Body font — UI text and IAST pronunciation. Full diacritic coverage
// (ā ṛ ṣ ṭ ḥ ṅ ñ …) needed for transliteration.
export const serif = Noto_Serif({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

export const fontVariables = `${display.variable} ${scripture.variable} ${serif.variable}`;
