"use client";

import { CONTENT_TYPE_META } from "@/lib/content-types";
import type { ContentType } from "@/lib/content-types";
import { SearchIcon, ChevronDownIcon } from "@/components/save-icons";

export type SortOrder = "newest" | "oldest" | "az";

export type DeityOption = { slug: string; name: string };

export function SavesFilterBar({
  types,
  deities,
  selectedType,
  onSelectType,
  selectedDeity,
  onSelectDeity,
  query,
  onQuery,
  sort,
  onSort,
}: {
  types: ContentType[];
  deities: DeityOption[];
  selectedType: ContentType | "all";
  onSelectType: (t: ContentType | "all") => void;
  selectedDeity: string | "all";
  onSelectDeity: (slug: string | "all") => void;
  query: string;
  onQuery: (q: string) => void;
  sort: SortOrder;
  onSort: (s: SortOrder) => void;
}) {
  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search your saves…"
            aria-label="Search your saves"
            className="w-full rounded-full border border-border bg-surface py-2 pl-10 pr-4 text-sm text-ink shadow-soft placeholder:text-ink-muted focus:border-gold focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          {deities.length > 1 ? (
            <StyledSelect
              value={selectedDeity}
              onChange={(e) => onSelectDeity(e.target.value)}
              aria-label="Filter by deity"
            >
              <option value="all">All deities</option>
              {deities.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </StyledSelect>
          ) : null}
          <StyledSelect
            value={sort}
            onChange={(e) => onSort(e.target.value as SortOrder)}
            aria-label="Sort saves"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="az">A–Z</option>
          </StyledSelect>
        </div>
      </div>

      {types.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          <TypePill active={selectedType === "all"} onClick={() => onSelectType("all")}>
            All
          </TypePill>
          {types.map((t) => (
            <TypePill
              key={t}
              active={selectedType === t}
              onClick={() => onSelectType(t)}
            >
              {CONTENT_TYPE_META[t].plural}
            </TypePill>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StyledSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className="appearance-none rounded-full border border-border bg-surface py-2 pl-3.5 pr-8 text-sm text-ink shadow-soft focus:border-gold focus:outline-none"
      >
        {props.children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
    </div>
  );
}

function TypePill({
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
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active
          ? "border-gold bg-gold-soft text-ink"
          : "border-border text-ink-muted hover:border-gold hover:text-gold"
      }`}
    >
      {children}
    </button>
  );
}
