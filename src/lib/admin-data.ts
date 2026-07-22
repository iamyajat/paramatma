import "server-only";
import { connectToDatabase } from "@/lib/db";
import { Deity, Work, DailyStat, type DeityDoc, type DailyStatDoc } from "@/models";
import type { WorkDetail, WorkSummary } from "@/lib/data";
import type { Types } from "mongoose";
import type { ContentType } from "@/lib/content-types";

type PopulatedWork = {
  _id: Types.ObjectId;
  slug: string;
  status: "draft" | "published";
  type: ContentType;
  title: { dev: string; en: string };
  deity: DeityDoc | Types.ObjectId;
  deitySlug: string;
  description?: string;
  language: string;
  sources: { title: string; url: string; siteName?: string }[];
  tags: string[];
  occasions: string[];
  audioUrl?: string;
  segmentCount: number;
  viewCount: number;
  shareCount: number;
  createdAt: Date;
  updatedAt: Date;
};

function toWorkSummary(doc: PopulatedWork): WorkSummary & { status: "draft" | "published" } {
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
    status: doc.status,
  };
}

function toWorkDetail(doc: PopulatedWork): WorkDetail {
  return {
    ...toWorkSummary(doc),
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

export async function getAllWorksAdmin(): Promise<
  (WorkSummary & { status: "draft" | "published" })[]
> {
  await connectToDatabase();
  const docs = await Work.find()
    .sort({ updatedAt: -1 })
    .populate("deity", "name slug")
    .lean<PopulatedWork[]>();
  return docs.map(toWorkSummary);
}

export async function getWorkByIdAdmin(id: string): Promise<WorkDetail | null> {
  await connectToDatabase();
  const doc = await Work.findById(id).populate("deity", "name slug").lean<PopulatedWork | null>();
  return doc ? toWorkDetail(doc) : null;
}

export async function getDeityByIdAdmin(id: string) {
  await connectToDatabase();
  const doc = await Deity.findById(id).lean<DeityDoc | null>();
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    name: doc.name,
    aka: doc.aka ?? [],
    description: doc.description,
    order: doc.order,
  };
}

export async function getSiteTotals(): Promise<{ views: number; shares: number }> {
  await connectToDatabase();
  const [result] = await Work.aggregate<{ _id: null; views: number; shares: number }>([
    { $group: { _id: null, views: { $sum: "$viewCount" }, shares: { $sum: "$shareCount" } } },
  ]);
  return { views: result?.views ?? 0, shares: result?.shares ?? 0 };
}

export async function getTopWorksByViews(
  limit = 15
): Promise<(WorkSummary & { status: "draft" | "published" })[]> {
  await connectToDatabase();
  const docs = await Work.find()
    .sort({ viewCount: -1 })
    .limit(limit)
    .populate("deity", "name slug")
    .lean<PopulatedWork[]>();
  return docs.map(toWorkSummary);
}

export interface DailyPoint {
  date: string;
  viewCount: number;
  shareCount: number;
}

function lastNDates(days: number): string[] {
  const out: string[] = [];
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export async function getSiteDailyStats(days = 30): Promise<DailyPoint[]> {
  await connectToDatabase();
  const dates = lastNDates(days);
  const rows = await DailyStat.aggregate<{ _id: string; viewCount: number; shareCount: number }>([
    { $match: { date: { $gte: dates[0] } } },
    { $group: { _id: "$date", viewCount: { $sum: "$viewCount" }, shareCount: { $sum: "$shareCount" } } },
  ]);
  const byDate = new Map(rows.map((r) => [r._id, r]));
  return dates.map((date) => ({
    date,
    viewCount: byDate.get(date)?.viewCount ?? 0,
    shareCount: byDate.get(date)?.shareCount ?? 0,
  }));
}

export async function getWorkDailyStats(workId: string, days = 30): Promise<DailyPoint[]> {
  await connectToDatabase();
  const dates = lastNDates(days);
  const docs = await DailyStat.find({ work: workId, date: { $gte: dates[0] } }).lean<
    Pick<DailyStatDoc, "date" | "viewCount" | "shareCount">[]
  >();
  const byDate = new Map(docs.map((d) => [d.date, d]));
  return dates.map((date) => ({
    date,
    viewCount: byDate.get(date)?.viewCount ?? 0,
    shareCount: byDate.get(date)?.shareCount ?? 0,
  }));
}
