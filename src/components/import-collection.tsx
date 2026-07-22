"use client";

import { useState } from "react";
import Link from "next/link";
import { WorkCard } from "@/components/work-card";
import { importCollection } from "@/lib/saves";
import type { WorkSummary } from "@/lib/data";

export function ImportCollection({
  name,
  works,
  requested,
}: {
  name: string;
  works: WorkSummary[];
  requested: number;
}) {
  const [saved, setSaved] = useState(false);
  const missing = requested - works.length;

  function saveAll() {
    importCollection(name, works);
    setSaved(true);
  }

  return (
    <div>
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-gold">
          Shared collection
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          {name}
        </h1>
        <p className="mt-2 text-ink-muted">
          {works.length} {works.length === 1 ? "scripture" : "scriptures"}
          {missing > 0
            ? ` · ${missing} no longer available and skipped`
            : ""}
        </p>

        {saved ? (
          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-sm text-ink">
              Added <span className="font-medium">{name}</span> to your collections.
            </p>
            <Link
              href="/saved"
              className="inline-block rounded-full border border-gold bg-gold-soft px-5 py-2 text-sm font-medium text-ink transition-colors hover:shadow-soft"
            >
              View in your saves →
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={saveAll}
            className="mt-6 rounded-full border border-gold bg-gold-soft px-6 py-2.5 text-sm font-medium text-ink transition-all hover:-translate-y-0.5 hover:shadow-soft"
          >
            Add to my collections
          </button>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </div>
    </div>
  );
}
