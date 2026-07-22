// Pure (no "use client") so the /collections/import server component can decode
// a shared link and this same module can encode one on the client.
import { CONTENT_TYPES, isContentType, type ContentType } from "@/lib/content-types";
import { MAX_NAME_LEN, MAX_ITEMS_PER_COLLECTION } from "@/lib/save-limits";

export type CollectionRef = { type: ContentType; slug: string };

export type DecodedCollection = {
  name: string;
  refs: CollectionRef[];
};

// Compact wire format, then base64url:
//   "1" ␟ <name> ␟ <typeIdx>:<slug> ␞ <typeIdx>:<slug> ␞ …
// typeIdx is the index into CONTENT_TYPES (1 char), which keeps URLs short.
// See save-limits.ts for how the item/name caps bound the resulting URL length.
const VERSION = "1";
const FIELD_SEP = "\x1f"; // between version / name / items block
const ITEM_SEP = "\x1e"; // between items
const SLUG_RE = /^[a-z0-9-]+$/;

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Encode a collection name + its item refs into a URL-safe token. */
export function encodeCollection(name: string, items: CollectionRef[]): string {
  const cleanName = name
    // strip our delimiters/control chars, trim, clamp to the same limit as storage
    .replace(/[\x00-\x1f]/g, " ")
    .trim()
    .slice(0, MAX_NAME_LEN);

  const encodedItems = items
    .slice(0, MAX_ITEMS_PER_COLLECTION)
    .filter((i) => isContentType(i.type) && SLUG_RE.test(i.slug))
    .map((i) => `${CONTENT_TYPES.indexOf(i.type)}:${i.slug}`)
    .join(ITEM_SEP);

  return toBase64Url([VERSION, cleanName, encodedItems].join(FIELD_SEP));
}

/** Decode a share token. Returns null if it's malformed or has no valid items. */
export function decodeCollection(token: string): DecodedCollection | null {
  let raw: string;
  try {
    raw = fromBase64Url(token);
  } catch {
    return null;
  }

  const parts = raw.split(FIELD_SEP);
  if (parts.length < 3 || parts[0] !== VERSION) return null;

  const name = parts[1].trim().slice(0, MAX_NAME_LEN);
  const refs: CollectionRef[] = [];
  for (const entry of parts[2].split(ITEM_SEP)) {
    if (!entry) continue;
    const sep = entry.indexOf(":");
    if (sep < 0) continue;
    const type = CONTENT_TYPES[Number(entry.slice(0, sep))];
    const slug = entry.slice(sep + 1);
    if (!type || !isContentType(type) || !SLUG_RE.test(slug)) continue;
    refs.push({ type, slug });
    if (refs.length >= MAX_ITEMS_PER_COLLECTION) break;
  }

  if (!name || refs.length === 0) return null;
  return { name, refs };
}
