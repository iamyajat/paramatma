"use client";

import type { WorkSummary } from "@/lib/data";

export type Bookmark = WorkSummary & { bookmarkedAt: string };

const STORAGE_KEY = "paramatma:bookmarks";
const listeners = new Set<() => void>();

// Sorted-array snapshot, cached until the next write. useSyncExternalStore
// needs getSnapshot() to return the same reference when nothing changed —
// re-parsing + re-sorting on every call would produce a new array each time
// and cause React to think the store changes on every render.
let cache: Bookmark[] | null = null;

function readAll(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(next: Bookmark[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // private browsing / storage disabled / quota exceeded — no-op
  }
  cache = null;
  listeners.forEach((cb) => cb());
}

export function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getAllSnapshot(): Bookmark[] {
  if (cache === null) {
    cache = readAll().sort((a, b) => b.bookmarkedAt.localeCompare(a.bookmarkedAt));
  }
  return cache;
}

// Must be the same reference on every call, for the same reason as `cache`
// above — a fresh `[]` literal each call fails useSyncExternalStore's
// reference-stability check just as badly as an uncached sort would.
const EMPTY: Bookmark[] = [];
export function getAllServerSnapshot(): Bookmark[] {
  return EMPTY;
}

export function isBookmarkedSnapshot(id: string): boolean {
  return readAll().some((b) => b.id === id);
}

export function toggleBookmark(work: WorkSummary) {
  const existing = readAll();
  if (existing.some((b) => b.id === work.id)) {
    writeAll(existing.filter((b) => b.id !== work.id));
  } else {
    writeAll([...existing, { ...work, bookmarkedAt: new Date().toISOString() }]);
  }
}

export function removeBookmark(id: string) {
  writeAll(readAll().filter((b) => b.id !== id));
}
