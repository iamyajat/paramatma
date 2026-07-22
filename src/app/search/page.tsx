import type { Metadata } from "next";
import Link from "next/link";
import { searchWorks } from "@/lib/data";
import { WorkCard } from "@/components/work-card";
import { SearchBar } from "@/components/search-bar";
import { CONTENT_TYPES, CONTENT_TYPE_META } from "@/lib/content-types";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Hindu scriptures by title, deity, or tag.",
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchWorks(query) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <SearchBar autoFocus defaultValue={query} size="lg" />

      <div className="mt-12">
        {!query ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CONTENT_TYPES.map((type) => (
              <Link
                key={type}
                href={`/${type}`}
                className="rounded-full border border-border px-4 py-1.5 text-sm text-ink-muted transition-colors hover:border-gold hover:text-gold"
              >
                {CONTENT_TYPE_META[type].plural}
              </Link>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center">
            <p className="text-ink-muted">
              No results for &ldquo;{query}&rdquo;.
            </p>
            <Link
              href="/deities"
              className="mt-3 inline-block text-sm text-maroon hover:underline"
            >
              Browse by deity instead →
            </Link>
          </div>
        ) : (
          <>
            <p className="text-center text-sm text-ink-muted">
              {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {results.map((work) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
