import { Schema, model, models, Types } from "mongoose";
import { CONTENT_TYPES, type ContentType } from "@/lib/content-types";

// One document per verse/name/stanza — never nested in an array — so each
// segment can later hold its own vector `embedding` for Atlas Vector Search,
// which cannot index vectors inside subdocument arrays.
export type SegmentKind = "name" | "verse" | "stanza" | "section-heading";

export interface SegmentText {
  dev: string;
  en?: string;
}

export interface SegmentDoc {
  _id: Types.ObjectId;
  work: Types.ObjectId;
  workSlug: string;
  workType: ContentType;
  deitySlug: string;
  order: number;
  number?: number;
  kind: SegmentKind;
  text: SegmentText;
  mantra?: SegmentText;
  meaning?: string;
  embedding?: number[];
  embeddingText?: string;
  embeddedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SegmentTextSchema = new Schema<SegmentText>(
  {
    dev: { type: String, required: true },
    en: { type: String },
  },
  { _id: false }
);

const SegmentSchema = new Schema<SegmentDoc>(
  {
    work: { type: Schema.Types.ObjectId, ref: "Work", required: true },
    workSlug: { type: String, required: true },
    workType: { type: String, enum: CONTENT_TYPES, required: true },
    deitySlug: { type: String, required: true },
    order: { type: Number, required: true },
    number: { type: Number },
    kind: {
      type: String,
      enum: ["name", "verse", "stanza", "section-heading"],
      required: true,
    },
    text: { type: SegmentTextSchema, required: true },
    mantra: { type: SegmentTextSchema },
    meaning: { type: String },
    // Reserved for future Atlas Vector Search; excluded from default queries.
    embedding: { type: [Number], default: undefined, select: false },
    embeddingText: { type: String, select: false },
    embeddedAt: { type: Date, select: false },
  },
  { timestamps: true }
);

SegmentSchema.index({ work: 1, order: 1 }, { unique: true });
SegmentSchema.index({ workSlug: 1 });

export const Segment = models.Segment || model<SegmentDoc>("Segment", SegmentSchema);
