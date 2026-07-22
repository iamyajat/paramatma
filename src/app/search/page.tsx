import type { Metadata } from "next";
import Link from "next/link";
import { getAllDeities, searchWorks } from "@/lib/data";
import { WorkCard } from "@/components/work-card";
import { BackLink } from "@/components/back-link";
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
  const [results, deities] = await Promise.all([
    query ? searchWorks(query) : Promise.resolve([]),
    query ? Promise.resolve([]) : getAllDeities(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <BackLink href="/" label="Home" />
      <div className="mt-6 text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">Search</h1>
        <p className="mt-2 text-ink-muted">
          Find names, aartis, bhajans, stotras, and sahasranamas.
        </p>
      </div>

      <div className="mt-8">
        <SearchBar autoFocus defaultValue={query} />
      </div>

      <div className="mt-12">
        {!query ? (
          deities.length > 0 ? (
            <div className="text-center">
              <p className="text-sm uppercase tracking-wide text-ink-muted">
                Or browse by deity
              </p>
              <div className="mx-auto mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-2">
                {deities.map((deity) => (
                  <Link
                    key={deity.id}
                    href={`/search?q=${encodeURIComponent(deity.name.en)}`}
                    className="rounded-full border border-border px-4 py-1.5 text-sm text-ink transition-colors hover:border-gold hover:text-gold"
                  >
                    <span lang="sa-Deva" className="font-scripture">
                      {deity.name.dev}
                    </span>{" "}
                    {deity.name.en}
                  </Link>
                ))}
                {CONTENT_TYPES.map((type) => (
                  <Link
                    key={type}
                    href={`/${type}`}
                    className="rounded-full bg-gold-soft px-4 py-1.5 text-sm text-gold transition-colors hover:bg-gold hover:text-white"
                  >
                    {CONTENT_TYPE_META[type].plural}
                  </Link>
                ))}
              </div>
            </div>
          ) : null
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
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
