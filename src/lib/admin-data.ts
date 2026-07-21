import "server-only";
import { connectToDatabase } from "@/lib/db";
import { Deity, Work, type DeityDoc } from "@/models";
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
