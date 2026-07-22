"use client";

import { useState } from "react";
import type { WorkSummary } from "@/lib/data";

export function ShareButton({ work }: { work: WorkSummary }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    const title = `${work.title.en} (${work.title.dev})`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? "Link copied" : "Share this page"}
      title={copied ? "Link copied" : "Share"}
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
        copied
          ? "border-gold bg-gold-soft text-gold"
          : "border-border text-ink-muted hover:border-gold hover:text-gold"
      }`}
    >
      {copied ? <CheckIcon /> : <ShareIcon />}
    </button>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8 15.8 6.2M8.2 13.2l7.6 4.6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
