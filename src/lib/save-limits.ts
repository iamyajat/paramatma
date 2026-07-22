// Shared limits for saves/collections. Kept in a plain (non-"use client")
// module so both the client store (saves.ts) and the server-reachable share
// codec (collection-share.ts) can import them without crossing the client
// boundary.
//
// These bound the shared-collection URL length. Worst case — a 40-char name
// plus 50 items with ~40-char slugs — encodes to roughly 2.8 KB, which stays
// well inside modern browser URL limits (tens of KB) and server/CDN request
// limits (typically 8–16 KB). Keeping them here makes the bound explicit and
// easy to tighten if a stricter target (e.g. legacy 2 KB proxies) is needed.
export const MAX_NAME_LEN = 40;
export const MAX_ITEMS_PER_COLLECTION = 50;
export const MAX_COLLECTIONS = 30;
