import type { ContentType } from "@/lib/content-types";

// Shared by the seed script and the admin bulk-paste editors.

// Splits a block of pasted text into stanzas/verses on blank lines, trimming each.
export function splitOnBlankLines(text: string): string[] {
  return text
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean);
}

const DEVANAGARI_RE = /[ऀ-ॿ]/;

// Splits a verse block's lines into Devanagari vs. Latin groups by script,
// preserving internal line breaks within each group (for multi-line shlokas).
export function splitByScript(block: string): { dev: string; en?: string } {
  const devLines: string[] = [];
  const enLines: string[] = [];
  for (const line of block.split("\n")) {
    if (!line.trim()) continue;
    if (DEVANAGARI_RE.test(line)) devLines.push(line);
    else enLines.push(line);
  }
  return {
    dev: devLines.join("\n"),
    en: enLines.length > 0 ? enLines.join("\n") : undefined,
  };
}

export interface ParsedVerse {
  text: { dev: string; en?: string };
}

// Stotra/Sahasranama bulk format: verses separated by blank lines, each verse
// containing its Devanagari shloka lines followed by optional pronunciation lines.
export function parseVerseBlocks(text: string): ParsedVerse[] {
  return splitOnBlankLines(text)
    .map(splitByScript)
    .filter((v) => v.dev)
    .map((v) => ({ text: v }));
}

export interface ParsedName {
  text: { dev: string; en?: string };
  mantra: { dev: string; en?: string };
  meaning?: string;
}

// Ashtottara bulk format: one block per name, separated by blank lines.
// Line 1: name (Devanagari). Line 2: mantra, e.g. "ॐ ... नमः" (Devanagari).
// Line 3 (optional): pronunciation of the mantra. Line 4 (optional): meaning.
export function parseAshtottaraBlocks(text: string): ParsedName[] {
  return splitOnBlankLines(text).map((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const [nameDev, mantraDev, pronunciation, meaning] = lines;
    return {
      text: { dev: nameDev ?? "" },
      mantra: { dev: mantraDev ?? "", en: pronunciation || undefined },
      meaning: meaning || undefined,
    };
  });
}

interface SegmentLike {
  text: { dev: string; en?: string };
  mantra?: { dev?: string; en?: string };
  meaning?: string;
}

function joinNonEmpty(lines: (string | undefined)[]): string {
  const trimmed = [...lines];
  while (trimmed.length && !trimmed[trimmed.length - 1]) trimmed.pop();
  return trimmed.map((l) => l ?? "").join("\n");
}

// Reverse of the parse functions above — reconstructs bulk-paste text from
// existing segments, so the admin editor can be pre-filled for editing.
export function segmentsToBulkText(type: ContentType, segments: SegmentLike[]): string {
  if (type === "ashtottara") {
    return segments
      .map((s) => joinNonEmpty([s.text.dev, s.mantra?.dev, s.mantra?.en, s.meaning]))
      .join("\n\n");
  }
  if (type === "aarti" || type === "bhajan") {
    return segments.map((s) => s.text.dev).join("\n\n");
  }
  return segments.map((s) => joinNonEmpty([s.text.dev, s.text.en])).join("\n\n");
}
