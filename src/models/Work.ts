import { Schema, model, models, Types } from "mongoose";
import { CONTENT_TYPES, type ContentType } from "@/lib/content-types";

export interface WorkSource {
  title: string;
  url: string;
  siteName?: string;
}

export interface WorkDoc {
  _id: Types.ObjectId;
  slug: string;
  status: "draft" | "published";
  type: ContentType;
  title: { dev: string; en: string };
  deity: Types.ObjectId;
  deitySlug: string;
  description?: string;
  language: string;
  sources: WorkSource[];
  tags: string[];
  occasions: string[];
  audioUrl?: string;
  // Explicit display order within a type (e.g. Gita chapter number 1–18).
  // Absent for types that sort alphabetically by title.
  order?: number;
  segmentCount: number;
  viewCount: number;
  shareCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkSourceSchema = new Schema<WorkSource>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    siteName: { type: String },
  },
  { _id: false }
);

const WorkSchema = new Schema<WorkDoc>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    type: { type: String, enum: CONTENT_TYPES, required: true },
    title: {
      dev: { type: String, required: true },
      en: { type: String, required: true },
    },
    deity: { type: Schema.Types.ObjectId, ref: "Deity", required: true },
    deitySlug: { type: String, required: true },
    description: { type: String },
    language: { type: String, default: "sanskrit" },
    sources: { type: [WorkSourceSchema], default: [] },
    tags: { type: [String], default: [] },
    occasions: { type: [String], default: [] },
    audioUrl: { type: String },
    order: { type: Number },
    segmentCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

WorkSchema.index({ type: 1, status: 1 });
WorkSchema.index({ deitySlug: 1 });

export const Work = models.Work || model<WorkDoc>("Work", WorkSchema);
