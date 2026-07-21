"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { WorkCard } from "@/components/work-card";
import { VerseDivider } from "@/components/icons/verse-divider";
import { subscribe, getAllSnapshot, getAllServerSnapshot } from "@/lib/bookmarks";

const HOMEPAGE_LIMIT = 3;

export function HomeBookmarks() {
  const bookmarks = useSyncExternalStore(subscribe, getAllSnapshot, getAllServerSnapshot);

  if (bookmarks.length === 0) return null;

  return (
    <>
      <VerseDivider className="mb-16" />
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <h2 className="text-center font-display text-2xl font-semibold text-ink">
          Your Bookmarks
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.slice(0, HOMEPAGE_LIMIT).map((bookmark) => (
            <WorkCard key={bookmark.id} work={bookmark} />
          ))}
        </div>
        {bookmarks.length > HOMEPAGE_LIMIT ? (
          <p className="mt-8 text-center">
            <Link href="/bookmarks" className="text-sm text-maroon hover:underline">
              View all {bookmarks.length} bookmarks →
            </Link>
          </p>
        ) : null}
      </section>
    </>
  );
}
