"use client";

import { useEffect, useRef, useState } from "react";

export function ReaderMoreMenu({
  meaningsExpanded,
  onToggleMeanings,
}: {
  meaningsExpanded: boolean;
  onToggleMeanings: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
          className="absolute right-0 top-full z-10 mt-2 min-w-44 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lifted"
        >
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
