"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { WorkSummary } from "@/lib/data";
import { CollectionAssignPanel } from "@/components/collection-assign-panel";
import {
  subscribe,
  getSavesSnapshot,
  getSavesServerSnapshot,
  getCollectionsSnapshot,
  getCollectionsServerSnapshot,
} from "@/lib/saves";

type View = "menu" | "collections";

export function ReaderMoreMenu({
  work,
  meaningsExpanded,
  onToggleMeanings,
}: {
  work: WorkSummary;
  meaningsExpanded: boolean;
  onToggleMeanings: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const rootRef = useRef<HTMLDivElement>(null);

  const saves = useSyncExternalStore(subscribe, getSavesSnapshot, getSavesServerSnapshot);
  const collections = useSyncExternalStore(
    subscribe,
    getCollectionsSnapshot,
    getCollectionsServerSnapshot
  );

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Reset to the top-level menu whenever the popover closes.
  useEffect(() => {
    if (!open) setView("menu");
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
          open
            ? "border-gold bg-gold-soft text-gold"
            : "border-border text-ink-muted hover:border-gold hover:text-gold"
        }`}
      >
        <MoreIcon />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lifted"
        >
          {view === "collections" ? (
            <>
              <button
                type="button"
                onClick={() => setView("menu")}
                className="flex w-full items-center gap-1 px-3 py-2 text-left text-sm text-maroon hover:underline"
              >
                <ChevronLeftIcon />
                Back
              </button>
              <CollectionAssignPanel work={work} saves={saves} collections={collections} />
            </>
          ) : (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => setView("collections")}
                className="block w-full px-3.5 py-2 text-left text-sm text-ink-muted hover:bg-gold-soft hover:text-ink"
              >
                Add to collection
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onToggleMeanings();
                  setOpen(false);
                }}
                className="block w-full px-3.5 py-2 text-left text-sm text-ink-muted hover:bg-gold-soft hover:text-ink"
              >
                {meaningsExpanded ? "Collapse meanings" : "Expand meanings"}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  window.print();
                }}
                className="block w-full px-3.5 py-2 text-left text-sm text-ink-muted hover:bg-gold-soft hover:text-ink"
              >
                Print
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}
