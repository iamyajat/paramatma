"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { WorkCard } from "@/components/work-card";
import { VerseDivider } from "@/components/icons/verse-divider";
import { subscribe, getSavesSnapshot, getSavesServerSnapshot } from "@/lib/saves";

const HOMEPAGE_LIMIT = 3;

export function HomeSaves() {
  const saves = useSyncExternalStore(subscribe, getSavesSnapshot, getSavesServerSnapshot);

  if (saves.length === 0) return null;

  return (
    <>
      <VerseDivider className="mb-16" />
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <h2 className="text-center font-display text-2xl font-semibold text-ink">
          Your Saves
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saves.slice(0, HOMEPAGE_LIMIT).map((save) => (
            <WorkCard key={save.id} work={save} />
          ))}
        </div>
        {saves.length > HOMEPAGE_LIMIT ? (
          <p className="mt-8 text-center">
            <Link href="/saved" className="text-sm text-maroon hover:underline">
              View all {saves.length} saves →
            </Link>
          </p>
        ) : null}
      </section>
    </>
  );
}
