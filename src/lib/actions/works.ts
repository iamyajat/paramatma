"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Deity, Work, Segment, type SegmentKind } from "@/models";
import { CONTENT_TYPES, type ContentType } from "@/lib/content-types";
import {
  parseAshtottaraBlocks,
  parseVerseBlocks,
  splitOnBlankLines,
} from "@/lib/segment-parsing";

const sourceSchema = z.object({
  title: z.string().trim().min(1),
  url: z.string().trim().url(),
  siteName: z.string().trim().optional(),
});

const workSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  type: z.enum(CONTENT_TYPES),
  titleDev: z.string().trim().min(1, "Devanagari title is required"),
  titleEn: z.string().trim().min(1, "English title is required"),
  deityId: z.string().trim().min(1, "Choose a deity"),
  description: z.string().optional(),
  status: z.enum(["draft", "published"]),
  tags: z.string().optional(),
  occasions: z.string().optional(),
  audioUrl: z.string().trim().optional(),
  content: z.string().trim().min(1, "Content is required"),
});

export type WorkFormState = { error?: string } | undefined;

function parseSources(formData: FormData) {
  const titles = formData.getAll("sourceTitle[]").map(String);
  const urls = formData.getAll("sourceUrl[]").map(String);
  const siteNames = formData.getAll("sourceSiteName[]").map(String);

  const sources: { title: string; url: string; siteName?: string }[] = [];
  for (let i = 0; i < Math.max(titles.length, urls.length); i++) {
    const title = titles[i]?.trim();
    const url = urls[i]?.trim();
    if (!title && !url) continue;
    const parsed = sourceSchema.safeParse({
      title,
      url,
      siteName: siteNames[i]?.trim() || undefined,
    });
    if (parsed.success) sources.push(parsed.data);
  }
  return sources;
}

interface BuiltSegment {
  order: number;
  number?: number;
  kind: SegmentKind;
  text: { dev: string; en?: string };
  mantra?: { dev: string; en?: string };
  meaning?: string;
}

function buildSegments(type: ContentType, content: string): BuiltSegment[] {
  if (type === "ashtottara") {
    return parseAshtottaraBlocks(content).map((n, i) => ({
      order: i,
      number: i + 1,
      kind: "name" as const,
      text: n.text,
      mantra: n.mantra,
      meaning: n.meaning,
    }));
  }
  if (type === "aarti" || type === "bhajan") {
    return splitOnBlankLines(content).map((dev, i) => ({
      order: i,
      number: i + 1,
      kind: "stanza" as const,
      text: { dev },
    }));
  }
  return parseVerseBlocks(content).map((v, i) => ({
    order: i,
    number: i + 1,
    kind: "verse" as const,
    text: v.text,
  }));
}

function parseWorkForm(formData: FormData) {
  const parsed = workSchema.safeParse({
    slug: formData.get("slug"),
    type: formData.get("type"),
    titleDev: formData.get("titleDev"),
    titleEn: formData.get("titleEn"),
    deityId: formData.get("deityId"),
    description: formData.get("description"),
    status: formData.get("status"),
    tags: formData.get("tags"),
    occasions: formData.get("occasions"),
    audioUrl: formData.get("audioUrl"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." } as const;
  }
  return { data: parsed.data } as const;
}

export async function createWork(
  _prevState: WorkFormState,
  formData: FormData
): Promise<WorkFormState> {
  await requireAdmin();
  const result = parseWorkForm(formData);
  if ("error" in result) return { error: result.error };
  const { data } = result;

  await connectToDatabase();

  const existing = await Work.findOne({ slug: data.slug });
  if (existing) return { error: "A work with this slug already exists." };

  const deity = await Deity.findById(data.deityId);
  if (!deity) return { error: "Selected deity was not found." };

  const segments = buildSegments(data.type, data.content);
  if (segments.length === 0) return { error: "No content could be parsed." };

  const work = await Work.create({
    slug: data.slug,
    type: data.type,
    title: { dev: data.titleDev, en: data.titleEn },
    deity: deity._id,
    deitySlug: deity.slug,
    description: data.description || undefined,
    status: data.status,
    tags: data.tags ? data.tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
    occasions: data.occasions
      ? data.occasions.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    audioUrl: data.audioUrl || undefined,
    sources: parseSources(formData),
    segmentCount: segments.length,
  });

  await Segment.insertMany(
    segments.map((s) => ({
      ...s,
      work: work._id,
      workSlug: work.slug,
      workType: work.type,
      deitySlug: work.deitySlug,
    }))
  );

  revalidatePath(`/${data.type}`);
  revalidatePath(`/${data.type}/${data.slug}`);
  revalidatePath(`/deities/${deity.slug}`);
  revalidatePath("/");
  revalidatePath("/admin/works");
  redirect("/admin/works");
}

export async function updateWork(
  id: string,
  _prevState: WorkFormState,
  formData: FormData
): Promise<WorkFormState> {
  await requireAdmin();
  const result = parseWorkForm(formData);
  if ("error" in result) return { error: result.error };
  const { data } = result;

  await connectToDatabase();

  const work = await Work.findById(id);
  if (!work) return { error: "Work not found." };

  const slugClash = await Work.findOne({ slug: data.slug, _id: { $ne: id } });
  if (slugClash) return { error: "A work with this slug already exists." };

  const deity = await Deity.findById(data.deityId);
  if (!deity) return { error: "Selected deity was not found." };

  const segments = buildSegments(data.type, data.content);
  if (segments.length === 0) return { error: "No content could be parsed." };

  const oldType = work.type;
  const oldSlug = work.slug;

  work.slug = data.slug;
  work.title = { dev: data.titleDev, en: data.titleEn };
  work.deity = deity._id;
  work.deitySlug = deity.slug;
  work.description = data.description || undefined;
  work.status = data.status;
  work.tags = data.tags ? data.tags.split(",").map((s) => s.trim()).filter(Boolean) : [];
  work.occasions = data.occasions
    ? data.occasions.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  work.audioUrl = data.audioUrl || undefined;
  work.sources = parseSources(formData);
  work.segmentCount = segments.length;
  await work.save();

  await Segment.deleteMany({ work: work._id });
  await Segment.insertMany(
    segments.map((s) => ({
      ...s,
      work: work._id,
      workSlug: work.slug,
      workType: work.type,
      deitySlug: work.deitySlug,
    }))
  );

  revalidatePath(`/${oldType}/${oldSlug}`);
  revalidatePath(`/${data.type}`);
  revalidatePath(`/${data.type}/${data.slug}`);
  revalidatePath(`/deities/${deity.slug}`);
  revalidatePath("/");
  revalidatePath("/admin/works");
  redirect("/admin/works");
}

export async function deleteWork(id: string) {
  await requireAdmin();
  await connectToDatabase();

  const work = await Work.findById(id);
  if (!work) return;

  await Segment.deleteMany({ work: work._id });
  await Work.findByIdAndDelete(id);

  revalidatePath(`/${work.type}`);
  revalidatePath(`/${work.type}/${work.slug}`);
  revalidatePath("/");
  revalidatePath("/admin/works");
}
