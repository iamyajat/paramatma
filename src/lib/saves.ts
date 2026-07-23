"use client";

import type { WorkSummary } from "@/lib/data";
import {
  MAX_NAME_LEN,
  MAX_ITEMS_PER_COLLECTION,
  MAX_COLLECTIONS,
} from "@/lib/save-limits";

export { MAX_NAME_LEN, MAX_ITEMS_PER_COLLECTION, MAX_COLLECTIONS };

/** A saved work, plus when it was saved and which collections it belongs to. */
export type Save = WorkSummary & { savedAt: string; collectionIds: string[] };

/** A user-named group of saves (a folder). Membership lives on each Save. */
export type Collection = { id: string; name: string; createdAt: string };

const SAVES_KEY = "paramatma:saves";
const COLLECTIONS_KEY = "paramatma:collections";
const LEGACY_BOOKMARKS_KEY = "paramatma:bookmarks";

const listeners = new Set<() => void>();

// Cached, sorted snapshots. useSyncExternalStore requires getSnapshot() to
// return the same reference when nothing changed, so we cache until the next
// write (which sets the cache back to null) rather than re-parse every call.
let savesCache: Save[] | null = null;
let collectionsCache: Collection[] | null = null;

// --- raw storage helpers -----------------------------------------------------

function readSaves(): Save[] {
  try {
    const raw = localStorage.getItem(SAVES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeSave) : [];
    }
    // One-time migration from the old flat bookmarks list.
    const legacy = localStorage.getItem(LEGACY_BOOKMARKS_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed)) {
        const migrated = parsed.map(normalizeSave);
        try {
          localStorage.setItem(SAVES_KEY, JSON.stringify(migrated));
        } catch {
          // ignore write failures — we still return the migrated list
        }
        return migrated;
      }
    }
    return [];
  } catch {
    return [];
  }
}

// Backfill defaults for entries written by older versions (or migrated
// bookmarks, which used `bookmarkedAt` and had no collections).
function normalizeSave(raw: Save & { bookmarkedAt?: string }): Save {
  return {
    ...raw,
    savedAt: raw.savedAt ?? raw.bookmarkedAt ?? new Date(0).toISOString(),
    collectionIds: Array.isArray(raw.collectionIds) ? raw.collectionIds : [],
  };
}

function writeSaves(next: Save[]) {
  try {
    localStorage.setItem(SAVES_KEY, JSON.stringify(next));
  } catch {
    // private browsing / storage disabled / quota exceeded — no-op
  }
  savesCache = null;
  listeners.forEach((cb) => cb());
}

function readCollections(): Collection[] {
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCollections(next: Collection[]) {
  try {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
  } catch {
    // no-op
  }
  collectionsCache = null;
  listeners.forEach((cb) => cb());
}

// --- subscription + snapshots (useSyncExternalStore) -------------------------

export function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getSavesSnapshot(): Save[] {
  if (savesCache === null) {
    savesCache = readSaves().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  }
  return savesCache;
}

export function getCollectionsSnapshot(): Collection[] {
  if (collectionsCache === null) {
    collectionsCache = readCollections().sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }
  return collectionsCache;
}

// Stable empty references for server rendering (same reasoning as the caches).
const EMPTY_SAVES: Save[] = [];
const EMPTY_COLLECTIONS: Collection[] = [];
export function getSavesServerSnapshot(): Save[] {
  return EMPTY_SAVES;
}
export function getCollectionsServerSnapshot(): Collection[] {
  return EMPTY_COLLECTIONS;
}

export function isSavedSnapshot(id: string): boolean {
  return readSaves().some((s) => s.id === id);
}

// --- save mutations ----------------------------------------------------------

export function toggleSave(work: WorkSummary) {
  const existing = readSaves();
  if (existing.some((s) => s.id === work.id)) {
    writeSaves(existing.filter((s) => s.id !== work.id));
  } else {
    writeSaves([
      ...existing,
      { ...work, savedAt: new Date().toISOString(), collectionIds: [] },
    ]);
  }
}

export function removeSave(id: string) {
  writeSaves(readSaves().filter((s) => s.id !== id));
}

/**
 * Get the existing save for a work, or create one (with no collections yet)
 * if it isn't saved. Used when assigning a collection from a context — like
 * the reader's more-menu — where the work may not be saved yet.
 */
export function ensureSaved(work: WorkSummary): Save {
  const existing = readSaves();
  const found = existing.find((s) => s.id === work.id);
  if (found) return found;
  const created: Save = { ...work, savedAt: new Date().toISOString(), collectionIds: [] };
  writeSaves([...existing, created]);
  return created;
}

// --- collection mutations ----------------------------------------------------

function sanitizeName(name: string): string {
  return name.trim().slice(0, MAX_NAME_LEN);
}

function newId(): string {
  return `c_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Create a collection. Returns its id, or null if invalid / at the limit. */
export function createCollection(name: string): string | null {
  const clean = sanitizeName(name);
  if (!clean) return null;
  const existing = readCollections();
  if (existing.length >= MAX_COLLECTIONS) return null;
  const id = newId();
  writeCollections([
    ...existing,
    { id, name: clean, createdAt: new Date().toISOString() },
  ]);
  return id;
}

export function renameCollection(id: string, name: string) {
  const clean = sanitizeName(name);
  if (!clean) return;
  writeCollections(
    readCollections().map((c) => (c.id === id ? { ...c, name: clean } : c))
  );
}

/** Delete a collection and strip its id from every save (saves survive in All). */
export function deleteCollection(id: string) {
  writeCollections(readCollections().filter((c) => c.id !== id));
  const saves = readSaves();
  if (saves.some((s) => s.collectionIds.includes(id))) {
    writeSaves(
      saves.map((s) =>
        s.collectionIds.includes(id)
          ? { ...s, collectionIds: s.collectionIds.filter((cid) => cid !== id) }
          : s
      )
    );
  }
}

/** Remove a save from one collection only — it stays in All and any other collections. */
export function removeFromCollection(saveId: string, collectionId: string) {
  const saves = readSaves();
  const target = saves.find((s) => s.id === saveId);
  if (!target || !target.collectionIds.includes(collectionId)) return;
  writeSaves(
    saves.map((s) =>
      s.id === saveId
        ? { ...s, collectionIds: s.collectionIds.filter((id) => id !== collectionId) }
        : s
    )
  );
}

/** Count how many saves currently belong to a collection. */
export function collectionItemCount(collectionId: string, saves: Save[]): number {
  return saves.reduce(
    (n, s) => (s.collectionIds.includes(collectionId) ? n + 1 : n),
    0
  );
}

/**
 * Replace a save's collection membership. Ignores unknown collection ids and
 * refuses to push any collection past MAX_ITEMS_PER_COLLECTION.
 */
export function setCollectionsForSave(saveId: string, collectionIds: string[]) {
  const collections = readCollections();
  const validIds = new Set(collections.map((c) => c.id));
  const saves = readSaves();
  const target = saves.find((s) => s.id === saveId);
  if (!target) return;

  const requested = collectionIds.filter((id) => validIds.has(id));
  const allowed = requested.filter((id) => {
    if (target.collectionIds.includes(id)) return true; // already a member
    return collectionItemCount(id, saves) < MAX_ITEMS_PER_COLLECTION;
  });

  writeSaves(
    saves.map((s) => (s.id === saveId ? { ...s, collectionIds: allowed } : s))
  );
}

/**
 * Import a shared collection into local storage: ensure a collection with the
 * given name exists, then save every work (dedup by id) and add the collection
 * id to each. Returns the number of works saved into the collection.
 */
export function importCollection(name: string, works: WorkSummary[]): number {
  const clean = sanitizeName(name);
  if (!clean || works.length === 0) return 0;

  // Reuse an existing collection with the same name, else create one.
  const collections = readCollections();
  let collection = collections.find((c) => c.name === clean);
  if (!collection) {
    if (collections.length >= MAX_COLLECTIONS) return 0;
    collection = { id: newId(), name: clean, createdAt: new Date().toISOString() };
    writeCollections([...collections, collection]);
  }
  const collectionId = collection.id;

  const saves = readSaves();
  const byId = new Map(saves.map((s) => [s.id, s]));
  const now = new Date().toISOString();

  const capped = works.slice(0, MAX_ITEMS_PER_COLLECTION);
  let added = 0;
  for (const work of capped) {
    const existing = byId.get(work.id);
    if (existing) {
      if (!existing.collectionIds.includes(collectionId)) {
        existing.collectionIds = [...existing.collectionIds, collectionId];
      }
    } else {
      byId.set(work.id, {
        ...work,
        savedAt: now,
        collectionIds: [collectionId],
      });
    }
    added += 1;
  }

  writeSaves(Array.from(byId.values()));
  return added;
}
