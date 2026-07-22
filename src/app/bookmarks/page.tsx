import type { Metadata } from "next";
import { BookmarksList } from "@/components/bookmarks-list";
import { BackLink } from "@/components/back-link";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Scriptures you've saved on this device to read again.",
};

export default function BookmarksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <BackLink href="/" label="Home" />
      <div className="mt-6 text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Bookmarks
        </h1>
        <p className="mt-2 text-ink-muted">
          Scriptures you&rsquo;ve saved on this device, newest first.
        </p>
      </div>
      <BookmarksList />
    </div>
  );
}
