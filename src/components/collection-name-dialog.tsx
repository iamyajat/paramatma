"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_NAME_LEN } from "@/lib/save-limits";

/**
 * A centered modal for naming a new collection. `onSubmit` returns an error
 * message to keep the dialog open and show it, or null on success (the
 * caller is then responsible for closing via `onClose`).
 */
export function CollectionNameDialog({
  open,
  onSubmit,
  onClose,
}: {
  open: boolean;
  onSubmit: (name: string) => string | null;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setError(null);
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const err = onSubmit(trimmed);
    if (err) setError(err);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-collection-title"
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-lifted"
      >
        <h2 id="new-collection-title" className="font-display text-lg font-semibold text-ink">
          New collection
        </h2>
        <input
          ref={inputRef}
          type="text"
          value={name}
          maxLength={MAX_NAME_LEN}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="e.g. Morning Prayers"
          className="mt-4 w-full rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink shadow-soft placeholder:text-ink-muted focus:border-gold focus:outline-none"
        />
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-xs text-maroon">{error ?? ""}</p>
          <p className="shrink-0 text-xs text-ink-muted">
            {name.trim().length}/{MAX_NAME_LEN}
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-1.5 text-sm text-ink-muted transition-colors hover:border-gold hover:text-gold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim()}
            className="rounded-full border border-gold bg-gold-soft px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
