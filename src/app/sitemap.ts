import type { MetadataRoute } from "next";
import { getAllDeities, getAllPublishedWorkParams } from "@/lib/data";
import { CONTENT_TYPES } from "@/lib/content-types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [deities, workParams] = await Promise.all([
    getAllDeities(),
    getAllPublishedWorkParams(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/deities`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/search`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    ...CONTENT_TYPES.map((type) => ({
      url: `${SITE_URL}/${type}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  const deityRoutes: MetadataRoute.Sitemap = deities.map((deity) => ({
    url: `${SITE_URL}/deities/${deity.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const workRoutes: MetadataRoute.Sitemap = workParams.map((w) => ({
    url: `${SITE_URL}/${w.type}/${w.slug}`,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...deityRoutes, ...workRoutes];
}
