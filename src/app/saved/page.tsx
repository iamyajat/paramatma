import type { Metadata } from "next";
import { SavedView } from "@/components/saved-view";

export const metadata: Metadata = {
  title: "Saved",
  description: "Scriptures you've saved on this device, grouped into collections.",
};

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">Saved</h1>
        <p className="mt-2 text-ink-muted">
          Scriptures you&rsquo;ve saved on this device, and your collections.
        </p>
      </div>
      <SavedView />
    </div>
  );
}
