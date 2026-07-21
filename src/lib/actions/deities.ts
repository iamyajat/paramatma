"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Deity, Work } from "@/models";

const deitySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  nameDev: z.string().trim().min(1, "Devanagari name is required"),
  nameEn: z.string().trim().min(1, "English name is required"),
  aka: z.string().optional(),
  description: z.string().optional(),
  order: z.coerce.number().int().default(0),
});

export type DeityFormState = { error?: string } | undefined;

function parseDeityForm(formData: FormData) {
  const parsed = deitySchema.safeParse({
    slug: formData.get("slug"),
    nameDev: formData.get("nameDev"),
    nameEn: formData.get("nameEn"),
    aka: formData.get("aka"),
    description: formData.get("description"),
    order: formData.get("order") || 0,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." } as const;
  }
  return { data: parsed.data } as const;
}

export async function createDeity(
  _prevState: DeityFormState,
  formData: FormData
): Promise<DeityFormState> {
  await requireAdmin();
  const result = parseDeityForm(formData);
  if ("error" in result) return { error: result.error };

  await connectToDatabase();
  const existing = await Deity.findOne({ slug: result.data.slug });
  if (existing) return { error: "A deity with this slug already exists." };

  await Deity.create({
    slug: result.data.slug,
    name: { dev: result.data.nameDev, en: result.data.nameEn },
    aka: result.data.aka
      ? result.data.aka.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    description: result.data.description || undefined,
    order: result.data.order,
  });

  revalidatePath("/deities");
  revalidatePath("/admin/deities");
  redirect("/admin/deities");
}

export async function updateDeity(
  id: string,
  _prevState: DeityFormState,
  formData: FormData
): Promise<DeityFormState> {
  await requireAdmin();
  const result = parseDeityForm(formData);
  if ("error" in result) return { error: result.error };

  await connectToDatabase();
  const existing = await Deity.findOne({ slug: result.data.slug, _id: { $ne: id } });
  if (existing) return { error: "A deity with this slug already exists." };

  const before = await Deity.findById(id);
  await Deity.findByIdAndUpdate(id, {
    $set: {
      slug: result.data.slug,
      name: { dev: result.data.nameDev, en: result.data.nameEn },
      aka: result.data.aka
        ? result.data.aka.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      description: result.data.description || undefined,
      order: result.data.order,
    },
  });

  if (before && before.slug !== result.data.slug) {
    await Work.updateMany({ deitySlug: before.slug }, { $set: { deitySlug: result.data.slug } });
  }

  revalidatePath("/deities");
  revalidatePath(`/deities/${result.data.slug}`);
  if (before && before.slug !== result.data.slug) {
    revalidatePath(`/deities/${before.slug}`);
  }
  revalidatePath("/admin/deities");
  redirect("/admin/deities");
}

export async function deleteDeity(id: string) {
  await requireAdmin();
  await connectToDatabase();

  const workCount = await Work.countDocuments({ deity: id });
  if (workCount > 0) {
    throw new Error(
      `Cannot delete: ${workCount} work(s) still reference this deity. Reassign or delete them first.`
    );
  }

  await Deity.findByIdAndDelete(id);
  revalidatePath("/deities");
  revalidatePath("/admin/deities");
}
