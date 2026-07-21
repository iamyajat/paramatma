import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorksByType } from "@/lib/data";
import { WorkCard } from "@/components/work-card";
import { CONTENT_TYPES, CONTENT_TYPE_META, isContentType } from "@/lib/content-types";

export async function generateStaticParams() {
  return CONTENT_TYPES.map((type) => ({ type }));
}

type Props = { params: Promise<{ type: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  if (!isContentType(type)) return {};
  const meta = CONTENT_TYPE_META[type];
  return {
    title: meta.plural,
    description: `${meta.description} — browse all ${meta.plural.toLowerCase()} on Paramatma.`,
  };
}

export default async function TypeIndexPage({ params }: Props) {
  const { type } = await params;
  if (!isContentType(type)) notFound();

  const meta = CONTENT_TYPE_META[type];
  const works = await getWorksByType(type);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <span lang="sa-Deva" className="font-scripture text-4xl text-gold">
          {meta.devanagari}
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          {meta.plural}
        </h1>
        <p className="mt-2 text-ink-muted">{meta.description}</p>
      </div>

      {works.length === 0 ? (
        <p className="mt-12 text-center text-ink-muted">
          No {meta.plural.toLowerCase()} have been added yet.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      )}
    </div>
  );
}
