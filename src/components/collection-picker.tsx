"use client";

import { useEffect, useRef, useState } from "react";
import type { Collection, Save } from "@/lib/saves";
import { CollectionAssignPanel } from "@/components/collection-assign-panel";
import { FolderIcon } from "@/components/save-icons";

/** Button + popover that assigns a save to collections (and creates new ones). */
export function CollectionPicker({
  save,
  saves,
  collections,
}: {
  save: Save;
  saves: Save[];
  collections: Collection[];
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

  const memberCount = save.collectionIds.length;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          memberCount > 0
            ? `In ${memberCount} collection${memberCount === 1 ? "" : "s"} — edit`
            : "Add to a collection"
        }
        title="Add to collection"
        className={`flex h-8 w-8 items-center justify-center rounded-full border shadow-soft transition-colors ${
          memberCount > 0
            ? "border-gold bg-gold-soft text-gold"
            : "border-border bg-surface text-ink-muted hover:border-gold hover:text-gold"
        }`}
      >
        <FolderIcon className="h-3.5 w-3.5" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute bottom-full right-0 z-20 mb-2 w-56 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lifted"
        >
          <CollectionAssignPanel work={save} saves={saves} collections={collections} />
        </div>
      ) : null}
    </div>
  );
}
