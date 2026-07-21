import Link from "next/link";
import { OmMark } from "@/components/icons/om-mark";
import { VerseDivider } from "@/components/icons/verse-divider";
import { CONTENT_TYPES, CONTENT_TYPE_META } from "@/lib/content-types";
import { getRecentWorks } from "@/lib/data";
import { WorkCard } from "@/components/work-card";

export default async function HomePage() {
  const recentWorks = await getRecentWorks(6);

  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28">
        <OmMark className="text-6xl text-gold" />
        <h1 className="mt-6 font-display text-4xl font-semibold text-ink sm:text-5xl">
          <span lang="sa-Deva" className="block text-5xl sm:text-6xl">
            परमात्मा
          </span>
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          A quiet home for the names, hymns, and prayers of the Hindu tradition —
          offered here for reading, recitation, and remembrance.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/deities"
            className="rounded-full bg-maroon px-6 py-3 text-sm font-medium text-white shadow-soft transition-transform hover:scale-[1.02]"
          >
            Browse by Deity
          </Link>
          <Link
            href="/search"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-gold hover:text-gold"
          >
            Search Scriptures
          </Link>
        </div>
      </section>

      <VerseDivider className="mb-16" />

      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <h2 className="text-center font-display text-2xl font-semibold text-ink">
          Explore by Type
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENT_TYPES.map((type) => {
            const meta = CONTENT_TYPE_META[type];
            return (
              <Link
                key={type}
                href={`/${type}`}
                className="group rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-lifted"
              >
                <span lang="sa-Deva" className="text-2xl text-gold">
                  {meta.devanagari}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                  {meta.plural}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">{meta.description}</p>
                <span className="mt-4 inline-block text-sm text-maroon opacity-0 transition-opacity group-hover:opacity-100">
                  Explore →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {recentWorks.length > 0 ? (
        <>
          <VerseDivider className="mb-16" />
          <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
            <h2 className="text-center font-display text-2xl font-semibold text-ink">
              Recently Added
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentWorks.map((work) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
