"use client";

import { useEffect, useRef, useState } from "react";
import type { WorkSummary } from "@/lib/data";
import {
  ensureSaved,
  setCollectionsForSave,
  createCollection,
  collectionItemCount,
  MAX_COLLECTIONS,
  MAX_ITEMS_PER_COLLECTION,
  MAX_NAME_LEN,
  type Collection,
  type Save,
} from "@/lib/saves";
import { PlusIcon, CheckIcon } from "@/components/save-icons";

/**
 * The collection-assignment UI (checkbox list + inline "new collection"),
 * shared by the save-card picker and the reader's more-menu. A pure component
 * fed by `saves`/`collections` props: a single subscriber in each host owns the
 * store subscription. (Self-subscribing here caused a one-render-behind bug in
 * the card, where an ancestor — SavedView — also subscribes to the same store.)
 * Since a work may not be saved yet (e.g. from the reader), it saves on first
 * assignment.
 */
export function CollectionAssignPanel({
  work,
  saves,
  collections,
}: {
  work: WorkSummary;
  saves: Save[];
  collections: Collection[];
}) {
  const current = saves.find((s) => s.id === work.id);
  const memberIds = current?.collectionIds ?? [];

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const newInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating) newInputRef.current?.focus();
  }, [creating]);

  function toggleMembership(collectionId: string, isMember: boolean) {
    setNotice(null);
    if (
      !isMember &&
      collectionItemCount(collectionId, saves) >= MAX_ITEMS_PER_COLLECTION
    ) {
      setNotice(`Collections hold up to ${MAX_ITEMS_PER_COLLECTION} items.`);
      return;
    }
    // A work assigned to a collection is implicitly saved.
    ensureSaved(work);
    const next = isMember
      ? memberIds.filter((id) => id !== collectionId)
      : [...memberIds, collectionId];
    setCollectionsForSave(work.id, next);
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
    ensureSaved(work);
    setCollectionsForSave(work.id, [...memberIds, id]);
    setNewName("");
    setCreating(false);
    setNotice(null);
  }

  return (
    <div>
      <p className="px-3.5 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
        Collections
      </p>
      <div className="max-h-52 overflow-y-auto">
        {collections.length === 0 ? (
          <p className="px-3.5 py-2 text-sm text-ink-muted">No collections yet.</p>
        ) : (
          collections.map((c) => {
            const isMember = memberIds.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                role="menuitemcheckbox"
                aria-checked={isMember}
                // preventDefault so that when this panel lives inside the card
                // link, the click doesn't navigate. We render a custom check box
                // (not a native <input>) because a controlled readOnly checkbox's
                // DOM `.checked` wasn't reliably syncing to React's rendered value.
                onClick={(e) => {
                  e.preventDefault();
                  toggleMembership(c.id, isMember);
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-sm text-ink hover:bg-gold-soft"
              >
                <span
                  aria-hidden
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    isMember
                      ? "border-gold bg-gold text-ivory"
                      : "border-border bg-surface"
                  }`}
                >
                  {isMember ? <CheckIcon className="h-3 w-3" /> : null}
                </span>
                <span className="truncate">{c.name}</span>
              </button>
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
        {notice ? <p className="mt-1.5 text-xs text-maroon">{notice}</p> : null}
      </div>
    </div>
  );
}
