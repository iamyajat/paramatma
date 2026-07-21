"use client";

import { useState } from "react";

export function VerseActions({
  anchor,
  copyText,
}: {
  anchor: string;
  copyText: string;
}) {
  const [copied, setCopied] = useState<"link" | "text" | null>(null);

  async function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}#${anchor}`;
    await navigator.clipboard.writeText(url);
    setCopied("link");
    window.setTimeout(() => setCopied(null), 1500);
  }

  async function copyVerseText() {
    await navigator.clipboard.writeText(copyText);
    setCopied("text");
    window.setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="no-print flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/verse:opacity-100 focus-within:opacity-100">
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link to this verse"
        title="Copy link"
        className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted hover:bg-gold-soft hover:text-ink"
      >
        {copied === "link" ? (
          <CheckIcon />
        ) : (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 1 0-5-5l-1 1M13.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 1 0 5 5l1-1"
            />
          </svg>
        )}
      </button>
      <button
        type="button"
        onClick={copyVerseText}
        aria-label="Copy verse text"
        title="Copy text"
        className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted hover:bg-gold-soft hover:text-ink"
      >
        {copied === "text" ? (
          <CheckIcon />
        ) : (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="8" y="8" width="12" height="12" rx="2" />
            <path strokeLinecap="round" d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
          </svg>
        )}
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-gold" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
