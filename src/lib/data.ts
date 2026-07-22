import "server-only";
import { cache } from "react";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Deity, Work, Segment, type WorkDoc, type DeityDoc } from "@/models";
import type { ContentType } from "@/lib/content-types";

export interface DeityListItem {
  id: string;
  slug: string;
  name: { dev: string; en: string };
  aka: string[];
  description?: string;
}

export interface WorkSummary {
  id: string;
  slug: string;
  type: ContentType;
  title: { dev: string; en: string };
  deitySlug: string;
  deityName: { dev: string; en: string };
  description?: string;
  segmentCount: number;
  viewCount: number;
  shareCount: number;
  updatedAt: string;
}

export interface WorkSourceItem {
  title: string;
  url: string;
  siteName?: string;
}

export interface WorkDetail extends WorkSummary {
  status: "draft" | "published";
  language: string;
  sources: WorkSourceItem[];
  tags: string[];
  occasions: string[];
  audioUrl?: string;
  createdAt: string;
}

export interface SegmentItem {
  id: string;
  order: number;
  number?: number;
  kind: "name" | "verse" | "stanza" | "section-heading";
  text: { dev: string; en?: string };
  mantra?: { dev: string; en?: string };
  meaning?: string;
}

function toDeityListItem(doc: DeityDoc): DeityListItem {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    name: { dev: doc.name.dev, en: doc.name.en },
    aka: doc.aka ?? [],
    description: doc.description,
  };
}

type PopulatedWork = WorkDoc & { deity: DeityDoc | Types.ObjectId };

function toWorkSummary(doc: PopulatedWork): WorkSummary {
  const deity = doc.deity as DeityDoc;
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    type: doc.type,
    title: { dev: doc.title.dev, en: doc.title.en },
    deitySlug: doc.deitySlug,
    deityName: { dev: deity?.name?.dev ?? "", en: deity?.name?.en ?? "" },
    description: doc.description,
    segmentCount: doc.segmentCount,
    viewCount: doc.viewCount ?? 0,
    shareCount: doc.shareCount ?? 0,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function toWorkDetail(doc: PopulatedWork): WorkDetail {
  return {
    ...toWorkSummary(doc),
    status: doc.status,
    language: doc.language,
    sources: (doc.sources ?? []).map((s) => ({
      title: s.title,
      url: s.url,
      siteName: s.siteName,
    })),
    tags: doc.tags ?? [],
    occasions: doc.occasions ?? [],
    audioUrl: doc.audioUrl,
    createdAt: doc.createdAt.toISOString(),
  };
}

function toSegmentItem(doc: {
  _id: Types.ObjectId;
  order: number;
  number?: number;
  kind: SegmentItem["kind"];
  text: { dev: string; en?: string };
  mantra?: { dev: string; en?: string };
  meaning?: string;
}): SegmentItem {
  return {
    id: doc._id.toString(),
    order: doc.order,
    number: doc.number,
    kind: doc.kind,
    text: { dev: doc.text.dev, en: doc.text.en },
    mantra: doc.mantra ? { dev: doc.mantra.dev, en: doc.mantra.en } : undefined,
    meaning: doc.meaning,
  };
}

export const getAllDeities = cache(async (): Promise<DeityListItem[]> => {
  await connectToDatabase();
  const docs = await Deity.find().sort({ order: 1, "name.en": 1 }).lean<DeityDoc[]>();
  return docs.map(toDeityListItem);
});

export const getDeityBySlug = cache(
  async (slug: string): Promise<DeityListItem | null> => {
    await connectToDatabase();
    const doc = await Deity.findOne({ slug }).lean<DeityDoc | null>();
    return doc ? toDeityListItem(doc) : null;
  }
);

export const getWorksByDeity = cache(
  async (deitySlug: string, opts: { onlyPublished?: boolean } = {}): Promise<WorkSummary[]> => {
    await connectToDatabase();
    const filter: Record<string, unknown> = { deitySlug };
    if (opts.onlyPublished !== false) filter.status = "published";
    const docs = await Work.find(filter)
      .sort({ type: 1, "title.en": 1 })
      .populate("deity", "name slug")
      .lean<PopulatedWork[]>();
    return docs.map(toWorkSummary);
  }
);

export const getWorksByType = cache(
  async (
    type: ContentType,
    opts: { limit?: number; onlyPublished?: boolean } = {}
  ): Promise<WorkSummary[]> => {
    await connectToDatabase();
    const filter: Record<string, unknown> = { type };
    if (opts.onlyPublished !== false) filter.status = "published";
    let query = Work.find(filter)
      .sort({ "title.en": 1 })
      .populate("deity", "name slug");
    if (opts.limit) query = query.limit(opts.limit);
    const docs = await query.lean<PopulatedWork[]>();
    return docs.map(toWorkSummary);
  }
);

export const getWorkBySlug = cache(
  async (
    type: ContentType,
    slug: string,
    opts: { onlyPublished?: boolean } = {}
  ): Promise<WorkDetail | null> => {
    await connectToDatabase();
    const filter: Record<string, unknown> = { type, slug };
    if (opts.onlyPublished !== false) filter.status = "published";
    const doc = await Work.findOne(filter)
      .populate("deity", "name slug")
      .lean<PopulatedWork | null>();
    return doc ? toWorkDetail(doc) : null;
  }
);

export const getSegmentsForWork = cache(async (workId: string): Promise<SegmentItem[]> => {
  await connectToDatabase();
  const docs = await Segment.find({ work: workId })
    .sort({ order: 1 })
    .select("-embedding -embeddingText -embeddedAt")
    .lean();
  return docs.map(toSegmentItem);
});

export const getRecentWorks = cache(async (limit = 6): Promise<WorkSummary[]> => {
  await connectToDatabase();
  const docs = await Work.find({ status: "published" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("deity", "name slug")
    .lean<PopulatedWork[]>();
  return docs.map(toWorkSummary);
});

export const searchWorks = cache(async (query: string): Promise<WorkSummary[]> => {
  if (!query.trim()) return [];
  await connectToDatabase();
  const regex = new RegExp(query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const docs = await Work.find({
    status: "published",
    $or: [
      { "title.dev": regex },
      { "title.en": regex },
      { tags: regex },
      { deitySlug: regex },
    ],
  })
    .limit(30)
    .populate("deity", "name slug")
    .lean<PopulatedWork[]>();
  return docs.map(toWorkSummary);
});

export const getAllPublishedWorkParams = cache(
  async (): Promise<{ type: ContentType; slug: string }[]> => {
    await connectToDatabase();
    const docs = await Work.find({ status: "published" })
      .select("type slug")
      .lean<{ type: ContentType; slug: string }[]>();
    return docs.map((d) => ({ type: d.type, slug: d.slug }));
  }
);
