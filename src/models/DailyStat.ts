import { Schema, model, models, Types } from "mongoose";

export interface DailyStatDoc {
  _id: Types.ObjectId;
  work: Types.ObjectId;
  date: string; // "YYYY-MM-DD", UTC calendar day — sorts correctly as a plain string
  viewCount: number;
  shareCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DailyStatSchema = new Schema<DailyStatDoc>(
  {
    work: { type: Schema.Types.ObjectId, ref: "Work", required: true },
    date: { type: String, required: true },
    viewCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One bucket per work per day.
DailyStatSchema.index({ work: 1, date: 1 }, { unique: true });
// Serves the site-wide rollup, which filters on date alone — a compound
// index can only serve queries on a leftmost prefix, so this needs its own.
DailyStatSchema.index({ date: 1 });

export const DailyStat = models.DailyStat || model<DailyStatDoc>("DailyStat", DailyStatSchema);
