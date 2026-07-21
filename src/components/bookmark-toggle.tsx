"use client";

import { useSyncExternalStore } from "react";
import type { WorkSummary } from "@/lib/data";
import { subscribe, isBookmarkedSnapshot, toggleBookmark } from "@/lib/bookmarks";

export function BookmarkToggle({ work }: { work: WorkSummary }) {
  const bookmarked = useSyncExternalStore(
    subscribe,
    () => isBookmarkedSnapshot(work.id),
    () => false
  );

  return (
    <button
      type="button"
      onClick={() => toggleBookmark(work)}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark this page"}
      title={bookmarked ? "Remove bookmark" : "Bookmark this page"}
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
        bookmarked
          ? "border-gold bg-gold-soft text-gold"
          : "border-border text-ink-muted hover:border-gold hover:text-gold"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill={bookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      >
        <path d="M6 4.5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 4.5V20l-6-4-6 4V4.5Z" />
      </svg>
    </button>
  );
}
