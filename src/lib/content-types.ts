// APPEND ONLY: collection-share.ts encodes a work's type as its index into this
// array inside shareable link tokens. Reordering or inserting would silently
// break every previously shared collection link — always add new types at the end.
export const CONTENT_TYPES = [
  "ashtottara",
  "aarti",
  "bhajan",
  "stotra",
  "sahasranama",
  "gita",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export function isContentType(value: string): value is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(value);
}

export const CONTENT_TYPE_META: Record<
  ContentType,
  { label: string; plural: string; devanagari: string; description: string }
> = {
  ashtottara: {
    label: "Ashtottara",
    plural: "Ashtottaras",
    devanagari: "अष्टोत्तरशतनामावली",
    description: "108 sacred names",
  },
  aarti: {
    label: "Aarti",
    plural: "Aartis",
    devanagari: "आरती",
    description: "Devotional lamp-offering hymns",
  },
  bhajan: {
    label: "Bhajan",
    plural: "Bhajans",
    devanagari: "भजन",
    description: "Devotional songs",
  },
  stotra: {
    label: "Stotra",
    plural: "Stotras",
    devanagari: "स्तोत्र",
    description: "Hymns of praise",
  },
  sahasranama: {
    label: "Sahasranama",
    plural: "Sahasranamas",
    devanagari: "सहस्रनाम",
    description: "1,000 sacred names",
  },
  gita: {
    label: "Bhagavad Gita",
    plural: "Bhagavad Gita",
    devanagari: "भगवद्गीता",
    description: "The Song of the Lord — 18 chapters, 700 verses",
  },
};
