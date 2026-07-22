"use client";

import { useState } from "react";
import { encodeCollection, type CollectionRef } from "@/lib/collection-share";
import { ShareIcon, CheckIcon } from "@/components/save-icons";

/** Share a collection as a URL that encodes its name + item refs. */
export function ShareCollectionButton({
  name,
  items,
}: {
  name: string;
  items: CollectionRef[];
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const token = encodeCollection(name, items);
    const url = `${window.location.origin}/collections/import?c=${token}`;
    const title = `Collection: ${name}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — nothing else we can do silently
    }
  }

  const disabled = items.length === 0;

  return (
    <button
      type="button"
      onClick={share}
      disabled={disabled}
      aria-label={copied ? "Link copied" : "Share this collection"}
      title={
        disabled ? "Add saves before sharing" : copied ? "Link copied" : "Share collection"
      }
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        copied
          ? "border-gold bg-gold-soft text-gold"
          : "border-border text-ink-muted hover:border-gold hover:text-gold"
      }`}
    >
      {copied ? <CheckIcon className="h-4 w-4" /> : <ShareIcon className="h-4 w-4" />}
    </button>
  );
}
