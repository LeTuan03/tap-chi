import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/seo";
import { articlePath, categoryPath } from "@/lib/utils";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [categories, refs] = await Promise.all([db.categories.all(), db.articles.publishedRefs()]);

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: refs[0]?.updatedAt ? new Date(refs[0].updatedAt) : new Date(), changeFrequency: "hourly", priority: 1 },
  ];

  for (const c of categories) {
    entries.push({ url: `${base}${categoryPath(c, categories)}`, changeFrequency: "daily", priority: 0.8 });
  }

  for (const r of refs) {
    entries.push({
      url: `${base}${articlePath(r)}`,
      lastModified: new Date(r.updatedAt),
      changeFrequency: "weekly",
      priority: 0.6,
      images: r.image ? [r.image.startsWith("http") ? r.image : `${base}${r.image}`] : undefined,
    });
  }
  return entries;
}
