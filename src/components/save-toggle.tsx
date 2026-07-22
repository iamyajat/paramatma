"use client";

import { useSyncExternalStore } from "react";
import type { WorkSummary } from "@/lib/data";
import { subscribe, isSavedSnapshot, toggleSave } from "@/lib/saves";

export function SaveToggle({ work }: { work: WorkSummary }) {
  const saved = useSyncExternalStore(
    subscribe,
    () => isSavedSnapshot(work.id),
    () => false
  );

  return (
    <button
      type="button"
      onClick={() => toggleSave(work)}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saves" : "Save this page"}
      title={saved ? "Remove from saves" : "Save this page"}
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
        saved
          ? "border-gold bg-gold-soft text-gold"
          : "border-border text-ink-muted hover:border-gold hover:text-gold"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      >
        <path d="M6 4.5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 4.5V20l-6-4-6 4V4.5Z" />
      </svg>
    </button>
  );
}
