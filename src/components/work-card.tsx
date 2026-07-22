import Link from "next/link";
import type { ReactNode } from "react";
import type { WorkSummary } from "@/lib/data";
import { CONTENT_TYPE_META } from "@/lib/content-types";

export function WorkCard({
  work,
  actions,
}: {
  work: WorkSummary;
  /** Optional controls (e.g. save/collection actions) rendered inside the
   *  card's own link, bottom-right, so they share its hover animation. */
  actions?: ReactNode;
}) {
  const meta = CONTENT_TYPE_META[work.type];
  return (
    <Link
      href={`/${work.type}/${work.slug}`}
      className="group relative flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-lifted"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-medium text-gold">
          {meta.label}
        </span>
        {work.deityName.en ? (
          <span className="text-xs text-ink-muted">{work.deityName.en}</span>
        ) : null}
      </div>
      <h3 lang="sa-Deva" className="mt-3 font-scripture text-xl text-ink">
        {work.title.dev}
      </h3>
      <p className="mt-1 font-display text-sm font-medium text-ink-muted">
        {work.title.en}
      </p>
      {work.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
          {work.description}
        </p>
      ) : null}
      <span className="mt-4 inline-block text-sm text-maroon opacity-0 transition-opacity group-hover:opacity-100">
        Read →
      </span>

      {actions ? (
        // preventDefault is required here, not just stopPropagation — an <a>'s
        // navigation is a default action evaluated after the whole click
        // dispatch finishes, so only cancelling it (not just stopping bubbling)
        // keeps clicks inside this area from navigating the card's link.
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute bottom-3 right-3 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"
        >
          {actions}
        </div>
      ) : null}
    </Link>
  );
}
