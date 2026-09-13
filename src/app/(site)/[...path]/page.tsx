import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ArticleView from "@/components/site/views/ArticleView";
import CategoryView from "@/components/site/views/CategoryView";
import EpaperView from "@/components/site/views/EpaperView";
import { db } from "@/lib/db";
import { getArticleById, getCategories } from "@/lib/queries";
import { articleMetadata, categoryMetadata } from "@/lib/seo";
import type { Category } from "@/lib/types";
import { articlePath } from "@/lib/utils";

export const revalidate = 60;
export const dynamicParams = true;

type Params = { path: string[] };

/**
 * Bộ định tuyến cho các URL giữ nguyên cấu trúc của site gốc:
 *   /{chuyen-muc}                    trang chuyên mục
 *   /{chuyen-muc}/{chuyen-muc-con}   chuyên mục con
 *   /{...}/trang/{n}                 phân trang
 *   /{slug}-{id}                     bài viết (tương thích cả đuôi .html cũ)
 */
type Route = { kind: "article"; id: number; slug: string } | { kind: "category"; category: Category; page: number };

async function resolve(segments: string[]): Promise<Route | null> {
  if (segments.length === 1) {
    const m = segments[0].match(/^(.*)-(\d+)(?:\.html)?$/);
    if (m) return { kind: "article", id: Number(m[2]), slug: m[1] };
  }
  const segs = [...segments];
  let page = 1;
  if (segs.length >= 3 && segs[segs.length - 2] === "trang") {
    page = Number(segs[segs.length - 1]);
    if (!Number.isInteger(page) || page < 1) return null;
    segs.splice(-2, 2);
  }
  if (segs.length < 1 || segs.length > 2) return null;
  const category = await db.categories.get(segs[segs.length - 1]);
  if (!category) return null;
  if (segs.length === 1 && category.parent) return null;
  if (segs.length === 2 && category.parent !== segs[0]) return null;
  return { kind: "category", category, page };
}

export async function generateStaticParams(): Promise<Params[]> {
  const [categories, refs] = await Promise.all([db.categories.all(), db.articles.publishedRefs()]);
  const params: Params[] = [];
  for (const c of categories) params.push({ path: c.parent ? [c.parent, c.slug] : [c.slug] });
  // Chỉ dựng sẵn 200 bài mới nhất; các bài còn lại được sinh khi có người truy cập (ISR)
  for (const r of refs.slice(0, 200)) params.push({ path: [`${r.slug}-${r.id}`] });
  return params;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { path } = await params;
  const route = await resolve(path);
  if (!route) return { title: "Không tìm thấy trang", robots: { index: false } };
  const settings = await db.settings.get();
  if (route.kind === "article") {
    const a = await getArticleById(route.id);
    if (!a) return { title: "Không tìm thấy bài viết", robots: { index: false } };
    const c = await db.categories.get(a.category);
    return articleMetadata(a, c, settings);
  }
  const categories = await getCategories();
  return categoryMetadata(route.category, categories, settings, route.page);
}

export default async function DynamicPage({ params }: { params: Promise<Params> }) {
  const { path } = await params;
  const route = await resolve(path);
  if (!route) notFound();

  const [categories, settings] = await Promise.all([getCategories(), db.settings.get()]);

  if (route.kind === "article") {
    const a = await getArticleById(route.id);
    if (!a) notFound();
    // Ép về URL chuẩn nếu slug không khớp hoặc truy cập qua URL cũ .html
    if (path[0] !== `${a.slug}-${a.id}`) permanentRedirect(articlePath(a));
    return <ArticleView article={a} categories={categories} settings={settings} />;
  }

  if (route.category.slug === "doc-tap-chi-in") {
    return <EpaperView category={route.category} categories={categories} />;
  }
  return <CategoryView category={route.category} categories={categories} settings={settings} page={route.page} />;
}
