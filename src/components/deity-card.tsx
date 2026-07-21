import Link from "next/link";
import type { DeityListItem } from "@/lib/data";

export function DeityCard({ deity }: { deity: DeityListItem }) {
  return (
    <Link
      href={`/deities/${deity.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-6 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-lifted"
    >
      <span lang="sa-Deva" className="font-scripture text-3xl text-gold">
        {deity.name.dev}
      </span>
      <h3 className="mt-2 font-display text-lg font-semibold text-ink">
        {deity.name.en}
      </h3>
      {deity.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
          {deity.description}
        </p>
      ) : null}
    </Link>
  );
}
