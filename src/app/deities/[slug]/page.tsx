import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllDeities, getDeityBySlug, getWorksByDeity } from "@/lib/data";
import { WorkCard } from "@/components/work-card";
import { BackLink } from "@/components/back-link";
import { CONTENT_TYPES, CONTENT_TYPE_META } from "@/lib/content-types";

export async function generateStaticParams() {
  const deities = await getAllDeities();
  return deities.map((d) => ({ slug: d.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const deity = await getDeityBySlug(slug);
  if (!deity) return {};
  return {
    title: deity.name.en,
    description:
      deity.description ??
      `Names, hymns, and prayers of ${deity.name.en} (${deity.name.dev}).`,
  };
}

export default async function DeityPage({ params }: Props) {
  const { slug } = await params;
  const deity = await getDeityBySlug(slug);
  if (!deity) notFound();

  const works = await getWorksByDeity(slug);
  const byType = new Map<string, typeof works>();
  for (const work of works) {
    const list = byType.get(work.type) ?? [];
    list.push(work);
    byType.set(work.type, list);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <BackLink href="/deities" label="All Deities" />
      <div className="mt-6 text-center">
        <span lang="sa-Deva" className="font-scripture text-4xl text-gold">
          {deity.name.dev}
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          {deity.name.en}
        </h1>
        {deity.aka.length > 0 ? (
          <p className="mt-1 text-sm text-ink-muted">
            Also known as {deity.aka.join(", ")}
          </p>
        ) : null}
        {deity.description ? (
          <p className="mx-auto mt-4 max-w-xl text-ink-muted">{deity.description}</p>
        ) : null}
      </div>

      {works.length === 0 ? (
        <p className="mt-12 text-center text-ink-muted">
          No scriptures have been added for {deity.name.en} yet.
        </p>
      ) : (
        <div className="mt-14 space-y-12">
          {CONTENT_TYPES.filter((type) => byType.has(type)).map((type) => (
            <section key={type}>
              <h2 className="font-display text-xl font-semibold text-ink">
                {CONTENT_TYPE_META[type].plural}
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {byType.get(type)!.map((work) => (
                  <WorkCard key={work.id} work={work} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
