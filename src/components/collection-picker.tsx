"use client";

import { useEffect, useRef, useState } from "react";
import {
  createCollection,
  setCollectionsForSave,
  collectionItemCount,
  MAX_COLLECTIONS,
  MAX_ITEMS_PER_COLLECTION,
  MAX_NAME_LEN,
  type Collection,
  type Save,
} from "@/lib/saves";
import { FolderIcon, PlusIcon } from "@/components/save-icons";

/** Popover that toggles a save's membership across collections + creates new ones. */
export function CollectionPicker({
  save,
  collections,
  saves,
}: {
  save: Save;
  collections: Collection[];
  saves: Save[];
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!open) {
      setCreating(false);
      setNewName("");
      setNotice(null);
    }
  }, [open]);

  useEffect(() => {
    if (creating) newInputRef.current?.focus();
  }, [creating]);

  const memberCount = save.collectionIds.length;

  function toggleMembership(collectionId: string, isMember: boolean) {
    setNotice(null);
    if (
      !isMember &&
      collectionItemCount(collectionId, saves) >= MAX_ITEMS_PER_COLLECTION
    ) {
      setNotice(`Collections hold up to ${MAX_ITEMS_PER_COLLECTION} items.`);
      return;
    }
    const next = isMember
      ? save.collectionIds.filter((id) => id !== collectionId)
      : [...save.collectionIds, collectionId];
    setCollectionsForSave(save.id, next);
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    if (collections.length >= MAX_COLLECTIONS) {
      setNotice(`You can have up to ${MAX_COLLECTIONS} collections.`);
      return;
    }
    const id = createCollection(name);
    if (!id) {
      setNotice("Couldn't create that collection.");
      return;
    }
    setCollectionsForSave(save.id, [...save.collectionIds, id]);
    setNewName("");
    setCreating(false);
    setNotice(null);
  }

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
        className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
          memberCount > 0
            ? "text-gold"
            : "text-ink-muted hover:text-gold"
        }`}
      >
        <FolderIcon />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute bottom-full right-0 z-20 mb-2 w-56 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lifted"
        >
          <p className="px-3.5 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
            Collections
          </p>
          <div className="max-h-52 overflow-y-auto">
            {collections.length === 0 ? (
              <p className="px-3.5 py-2 text-sm text-ink-muted">
                No collections yet.
              </p>
            ) : (
              collections.map((c) => {
                const isMember = save.collectionIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center gap-2.5 px-3.5 py-2 text-sm text-ink hover:bg-gold-soft"
                  >
                    <input
                      type="checkbox"
                      checked={isMember}
                      // The card link's wrapper calls preventDefault on this
                      // area's clicks (to stop it navigating), which also
                      // cancels the checkbox's native toggle — so the real
                      // toggle happens here in onClick instead of onChange.
                      onChange={() => {}}
                      onClick={() => toggleMembership(c.id, isMember)}
                      className="h-4 w-4 accent-[color:var(--color-gold)]"
                    />
                    <span className="truncate">{c.name}</span>
                  </label>
                );
              })
            )}
          </div>

          <div className="mt-1 border-t border-border px-3 pb-2 pt-2">
            {creating ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={newInputRef}
                  type="text"
                  value={newName}
                  maxLength={MAX_NAME_LEN}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreate();
                    } else if (e.key === "Escape") {
                      setCreating(false);
                    }
                  }}
                  placeholder="Collection name…"
                  className="min-w-0 flex-1 rounded-md border border-border bg-surface px-2 py-1 text-sm text-ink placeholder:text-ink-muted focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  className="shrink-0 rounded-md border border-border px-2 py-1 text-sm text-ink-muted transition-colors hover:border-gold hover:text-gold"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex items-center gap-1.5 px-0.5 py-1 text-sm text-maroon hover:underline"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                New collection
              </button>
            )}
            {notice ? (
              <p className="mt-1.5 text-xs text-maroon">{notice}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
