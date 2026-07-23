"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { SaveCard } from "@/components/save-card";
import { CollectionsPanel } from "@/components/collections-panel";
import {
  SavesFilterBar,
  type DeityOption,
  type SortOrder,
} from "@/components/saves-filter-bar";
import {
  subscribe,
  getSavesSnapshot,
  getSavesServerSnapshot,
  getCollectionsSnapshot,
  getCollectionsServerSnapshot,
} from "@/lib/saves";
import { CONTENT_TYPES, type ContentType } from "@/lib/content-types";

type Tab = "all" | "collections";

export function SavedView() {
  const saves = useSyncExternalStore(
    subscribe,
    getSavesSnapshot,
    getSavesServerSnapshot
  );
  const collections = useSyncExternalStore(
    subscribe,
    getCollectionsSnapshot,
    getCollectionsServerSnapshot
  );

  const [tab, setTab] = useState<Tab>("all");
  const [type, setType] = useState<ContentType | "all">("all");
  const [deity, setDeity] = useState<string | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");

  const availableTypes = useMemo(() => {
    const present = new Set(saves.map((s) => s.type));
    return CONTENT_TYPES.filter((t) => present.has(t));
  }, [saves]);

  const availableDeities = useMemo<DeityOption[]>(() => {
    const map = new Map<string, string>();
    for (const s of saves) {
      if (s.deitySlug && !map.has(s.deitySlug)) {
        map.set(s.deitySlug, s.deityName.en || s.deitySlug);
      }
    }
    return Array.from(map, ([slug, name]) => ({ slug, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [saves]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = saves.filter((s) => {
      if (type !== "all" && s.type !== type) return false;
      if (deity !== "all" && s.deitySlug !== deity) return false;
      if (q) {
        const hay = `${s.title.en} ${s.title.dev}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    // saves arrive newest-first; only re-sort when a different order is asked.
    if (sort === "oldest") return [...list].reverse();
    if (sort === "az") {
      return [...list].sort((a, b) => a.title.en.localeCompare(b.title.en));
    }
    return list;
  }, [saves, type, deity, query, sort]);

  const isEmpty = saves.length === 0;

  return (
    <div className="mt-8">
      <div className="flex justify-center gap-2">
        <TabButton active={tab === "all"} onClick={() => setTab("all")}>
          All {saves.length > 0 ? `(${saves.length})` : ""}
        </TabButton>
        <TabButton active={tab === "collections"} onClick={() => setTab("collections")}>
          Collections {collections.length > 0 ? `(${collections.length})` : ""}
        </TabButton>
      </div>

      {isEmpty ? (
        <div className="mt-12 text-center">
          <p className="text-ink-muted">You haven&rsquo;t saved anything yet.</p>
          <Link
            href="/deities"
            className="mt-3 inline-block text-sm text-maroon hover:underline"
          >
            Browse by deity instead →
          </Link>
        </div>
      ) : tab === "all" ? (
        <>
          <SavesFilterBar
            types={availableTypes}
            deities={availableDeities}
            selectedType={type}
            onSelectType={setType}
            selectedDeity={deity}
            onSelectDeity={setDeity}
            query={query}
            onQuery={setQuery}
            sort={sort}
            onSort={setSort}
          />
          {filtered.length === 0 ? (
            <p className="mt-12 text-center text-ink-muted">
              No saves match these filters.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <SaveCard key={s.id} save={s} saves={saves} collections={collections} />
              ))}
            </div>
          )}
        </>
      ) : (
        <CollectionsPanel collections={collections} saves={saves} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-gold bg-gold-soft text-ink"
          : "border-border text-ink-muted hover:border-gold hover:text-gold"
      }`}
    >
      {children}
    </button>
  );
}
