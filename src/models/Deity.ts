import { Schema, model, models, Types } from "mongoose";

export interface DeityDoc {
  _id: Types.ObjectId;
  slug: string;
  name: { dev: string; en: string };
  aka: string[];
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const DeitySchema = new Schema<DeityDoc>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: {
      dev: { type: String, required: true },
      en: { type: String, required: true },
    },
    aka: { type: [String], default: [] },
    description: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Deity = models.Deity || model<DeityDoc>("Deity", DeitySchema);
