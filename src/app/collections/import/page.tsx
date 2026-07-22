import type { Metadata } from "next";
import Link from "next/link";
import { decodeCollection } from "@/lib/collection-share";
import { getWorkSummariesBySlugs, type WorkSummary } from "@/lib/data";
import { ImportCollection } from "@/components/import-collection";

export const metadata: Metadata = {
  title: "Shared collection",
  description: "A collection of scriptures someone shared with you.",
};

function Invalid() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">
        This shared link is invalid
      </h1>
      <p className="mt-2 text-ink-muted">
        The link may be broken, or the scriptures it points to are no longer
        available.
      </p>
      <Link
        href="/saved"
        className="mt-6 inline-block text-sm text-maroon hover:underline"
      >
        Go to your saves →
      </Link>
    </div>
  );
}

export default async function ImportCollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  if (!c) return <Invalid />;

  const decoded = decodeCollection(c);
  if (!decoded) return <Invalid />;

  const found = await getWorkSummariesBySlugs(decoded.refs.map((r) => r.slug));
  // Preserve the shared order; keep only refs whose work still exists.
  const bySlug = new Map<string, WorkSummary>(found.map((w) => [w.slug, w]));
  const works = decoded.refs
    .map((r) => bySlug.get(r.slug))
    .filter((w): w is WorkSummary => Boolean(w));

  if (works.length === 0) return <Invalid />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <ImportCollection
        name={decoded.name}
        works={works}
        requested={decoded.refs.length}
      />
    </div>
  );
}
