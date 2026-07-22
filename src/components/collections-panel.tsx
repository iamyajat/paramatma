"use client";

import { useState } from "react";
import { SaveCard } from "@/components/save-card";
import { ShareCollectionButton } from "@/components/share-collection-button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { CollectionNameDialog } from "@/components/collection-name-dialog";
import {
  createCollection,
  renameCollection,
  deleteCollection,
  MAX_COLLECTIONS,
  MAX_NAME_LEN,
  type Collection,
  type Save,
} from "@/lib/saves";
import { FolderIcon, PencilIcon, TrashIcon, PlusIcon } from "@/components/save-icons";

export function CollectionsPanel({
  collections,
  saves,
}: {
  collections: Collection[];
  saves: Save[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);

  const openCollection = openId
    ? collections.find((c) => c.id === openId) ?? null
    : null;

  // If the opened collection was just deleted, fall back to the list.
  if (openId && !openCollection) {
    setOpenId(null);
  }

  function handleCreate(name: string): string | null {
    if (collections.length >= MAX_COLLECTIONS) {
      return `You can have up to ${MAX_COLLECTIONS} collections.`;
    }
    const id = createCollection(name);
    if (!id) return "Couldn't create that collection.";
    setDialogOpen(false);
    return null;
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteCollection(deleteTarget.id);
    if (openId === deleteTarget.id) setOpenId(null);
    setDeleteTarget(null);
  }

  if (openCollection) {
    const items = saves.filter((s) => s.collectionIds.includes(openCollection.id));
    return (
      <div className="mt-8">
        <button
          type="button"
          onClick={() => setOpenId(null)}
          className="text-sm text-maroon hover:underline"
        >
          ← All collections
        </button>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold text-ink">
            {openCollection.name}
          </h2>
          <div className="flex items-center gap-1.5">
            <ShareCollectionButton
              name={openCollection.name}
              items={items.map((s) => ({ type: s.type, slug: s.slug }))}
            />
            <IconButton
              label="Delete collection"
              tone="danger"
              onClick={() => setDeleteTarget(openCollection)}
            >
              <TrashIcon className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
        {items.length === 0 ? (
          <p className="mt-8 text-ink-muted">
            This collection is empty. Add saves to it from the All tab using the
            folder button on each card.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <SaveCard
                key={s.id}
                save={s}
                collections={collections}
                saves={saves}
                collectionId={openCollection.id}
              />
            ))}
          </div>
        )}

        <ConfirmDialog
          open={!!deleteTarget}
          title={`Delete "${deleteTarget?.name}"?`}
          description="This won't remove the scriptures from your saves — they'll still be in All."
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {collections.length}/{MAX_COLLECTIONS} collections
        </p>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-gold bg-gold-soft px-4 py-2 text-sm font-medium text-ink transition-all hover:-translate-y-0.5 hover:shadow-soft"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          New collection
        </button>
      </div>

      {collections.length === 0 ? (
        <p className="mt-10 text-center text-ink-muted">
          No collections yet. Create one above, then group your saves into it.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <CollectionCard
              key={c.id}
              collection={c}
              saves={saves}
              onOpen={() => setOpenId(c.id)}
              onRequestDelete={() => setDeleteTarget(c)}
            />
          ))}
        </div>
      )}

      <CollectionNameDialog
        open={dialogOpen}
        onSubmit={handleCreate}
        onClose={() => setDialogOpen(false)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This won't remove the scriptures from your saves — they'll still be in All."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function CollectionCard({
  collection,
  saves,
  onOpen,
  onRequestDelete,
}: {
  collection: Collection;
  saves: Save[];
  onOpen: () => void;
  onRequestDelete: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(collection.name);

  const items = saves.filter((s) => s.collectionIds.includes(collection.id));
  const count = items.length;

  function commitRename() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== collection.name) {
      renameCollection(collection.id, trimmed);
    } else {
      setName(collection.name);
    }
    setRenaming(false);
  }

  return (
    // A distinct, icon-forward layout (vs. the scripture-card style used for
    // saves) so collections read as a different kind of thing at a glance.
    <div className="flex flex-col rounded-2xl border border-border bg-gold-soft/40 p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-lifted">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft text-gold">
          <FolderIcon className="h-5 w-5" />
        </span>
        <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-ink-muted">
          {count} {count === 1 ? "save" : "saves"}
        </span>
      </div>

      {renaming ? (
        <input
          type="text"
          value={name}
          autoFocus
          maxLength={MAX_NAME_LEN}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitRename();
            } else if (e.key === "Escape") {
              setName(collection.name);
              setRenaming(false);
            }
          }}
          className="mt-4 rounded-md border border-border bg-surface px-2 py-1 font-display text-lg text-ink focus:border-gold focus:outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="mt-4 text-left font-display text-lg font-semibold text-ink hover:text-maroon"
        >
          {collection.name}
        </button>
      )}

      <div className="mt-auto flex items-center justify-end gap-1.5 pt-5">
        <ShareCollectionButton
          name={collection.name}
          items={items.map((s) => ({ type: s.type, slug: s.slug }))}
        />
        <IconButton label="Rename collection" onClick={() => setRenaming(true)}>
          <PencilIcon className="h-4 w-4" />
        </IconButton>
        <IconButton label="Delete collection" tone="danger" onClick={onRequestDelete}>
          <TrashIcon className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}

function IconButton({
  label,
  tone = "default",
  onClick,
  children,
}: {
  label: string;
  tone?: "default" | "danger";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
        tone === "danger"
          ? "border-border text-ink-muted hover:border-maroon hover:text-maroon"
          : "border-border text-ink-muted hover:border-gold hover:text-gold"
      }`}
    >
      {children}
    </button>
  );
}
