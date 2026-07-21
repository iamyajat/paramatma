"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { WorkCard } from "@/components/work-card";
import { subscribe, getAllSnapshot, getAllServerSnapshot, removeBookmark } from "@/lib/bookmarks";

export function BookmarksList() {
  const bookmarks = useSyncExternalStore(subscribe, getAllSnapshot, getAllServerSnapshot);

  if (bookmarks.length === 0) {
    return (
      <div className="mt-12 text-center">
        <p className="text-ink-muted">You haven&rsquo;t bookmarked anything yet.</p>
        <Link
          href="/deities"
          className="mt-3 inline-block text-sm text-maroon hover:underline"
        >
          Browse by deity instead →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} className="relative">
          <WorkCard work={bookmark} />
          <button
            type="button"
            onClick={() => removeBookmark(bookmark.id)}
            aria-label={`Remove ${bookmark.title.en} from bookmarks`}
            title="Remove bookmark"
            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-ink-muted shadow-soft transition-colors hover:border-gold hover:text-gold"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
