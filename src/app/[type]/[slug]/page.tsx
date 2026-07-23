import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllPublishedWorkParams,
  getWorkBySlug,
  getSegmentsForWork,
} from "@/lib/data";
import { CONTENT_TYPE_META, isContentType } from "@/lib/content-types";
import { ReaderToolbar } from "@/components/reader-toolbar";
import { SegmentBlock } from "@/components/segment-block";
import { VerseAudioPlayer } from "@/components/verse-audio-player";
import { VerseDivider } from "@/components/icons/verse-divider";
import { ReadingProgress } from "@/components/reading-progress";
import { ViewTracker } from "@/components/view-tracker";
import { formatCompactNumber } from "@/lib/format";

export async function generateStaticParams() {
  const params = await getAllPublishedWorkParams();
  return params.map((p) => ({ type: p.type, slug: p.slug }));
}

type Props = { params: Promise<{ type: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, slug } = await params;
  if (!isContentType(type)) return {};
  const work = await getWorkBySlug(type, slug);
  if (!work) return {};

  const title = `${work.title.en} (${work.title.dev})`;
  const description =
    work.description ??
    `${CONTENT_TYPE_META[work.type].label} of ${work.deityName.en} — ${work.title.dev}.`;

  return {
    title,
    description,
    alternates: { canonical: `/${type}/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/${type}/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ContentPage({ params }: Props) {
  const { type, slug } = await params;
  if (!isContentType(type)) notFound();

  const work = await getWorkBySlug(type, slug);
  if (!work) notFound();

  const segments = await getSegmentsForWork(work.id);
  const meta = CONTENT_TYPE_META[work.type];
  const hasAudio = segments.some((s) => Boolean(s.audioUrl));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: work.title.en,
    alternateName: work.title.dev,
    about: work.deityName.en,
    inLanguage: "sa",
    description: work.description,
    ...(work.sources.length > 0
      ? { isBasedOn: work.sources.map((s) => s.url) }
      : {}),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />

      <header className="mx-auto max-w-3xl px-4 pt-14 pb-6 text-center sm:px-6">
        <div className="flex items-center justify-center gap-2 text-sm text-ink-muted">
          <Link href={`/${work.type}`} className="hover:text-gold">
            {meta.label}
          </Link>
          <span>·</span>
          <Link href={`/deities/${work.deitySlug}`} className="hover:text-gold">
            {work.deityName.en}
          </Link>
        </div>
        <h1
          lang="sa-Deva"
          className="mt-3 font-scripture text-4xl leading-snug text-ink sm:text-5xl"
        >
          {work.title.dev}
        </h1>
        <p className="mt-1 font-display text-lg text-ink-muted">{work.title.en}</p>
        {work.description ? (
          <p className="mx-auto mt-4 max-w-xl text-ink-muted">{work.description}</p>
        ) : null}
        <p className="mt-3 text-xs uppercase tracking-wide text-ink-muted">
          {segments.length} {segments.length === 1 ? "part" : "parts"} ·{" "}
          {formatCompactNumber(work.viewCount)} views ·{" "}
          {formatCompactNumber(work.shareCount)} shares
        </p>
      </header>

      <VerseDivider className="mb-2" />

      <ReaderToolbar work={work} />
      <ViewTracker workId={work.id} />

      <div
        id="reader-content"
        data-pronunciation="on"
        style={{ ["--reader-scale" as string]: 1 }}
        className="mx-auto max-w-3xl divide-y divide-border px-4 sm:px-6"
      >
        {segments.map((segment) => (
          <SegmentBlock key={segment.id} segment={segment} />
        ))}
      </div>

      {work.sources.length > 0 ? (
        <div className="mx-auto mt-12 max-w-3xl px-4 pb-16 sm:px-6">
          <h2 className="font-display text-sm font-semibold text-ink">
            Sources
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-ink-muted">
            {work.sources.map((source, i) => (
              <li key={i}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="hover:text-gold hover:underline"
                >
                  {source.title}
                </a>
                {source.siteName ? (
                  <span className="text-ink-muted"> — {source.siteName}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="pb-16" />
      )}

      {hasAudio ? (
        <>
          {/* Spacer so the last verse clears the fixed player bar. */}
          <div aria-hidden className="h-28" />
          <VerseAudioPlayer title={`${work.title.en} · ${work.title.dev}`} />
        </>
      ) : null}
    </div>
  );
}
