/**
 * Lớp truy cập dữ liệu (repository) dùng Prisma.
 *
 * Toàn bộ ứng dụng chỉ gọi qua `db.*` và làm việc với các kiểu trong `types.ts`,
 * nên phần còn lại của code không phụ thuộc vào lược đồ Prisma.
 */
import type { Article as PrismaArticle, Category as PrismaCategory, Epaper as PrismaEpaper } from "@prisma/client";
import { prisma } from "./prisma";
import type { Article, ArticleStatus, ArticleType, Category, Epaper, MenuPlacement, SiteSettings } from "./types";

/* ---------- chuyển đổi Prisma <-> kiểu ứng dụng ---------- */

function parseTags(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  }
}

export function toArticle(a: PrismaArticle): Article {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    subtitle: a.subtitle,
    sapo: a.sapo,
    description: a.description,
    content: a.content,
    image: a.image,
    ogImage: a.ogImage,
    category: a.categorySlug,
    tags: parseTags(a.tags),
    author: a.author,
    source: a.source,
    type: a.type as ArticleType,
    status: a.status as ArticleStatus,
    isFeatured: a.isFeatured,
    isSpotlight: a.isSpotlight,
    views: a.views,
    publishedAt: a.publishedAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    createdAt: a.createdAt.toISOString(),
  };
}

/** Bỏ `content` để danh sách nhẹ hơn */
export function toArticleSummary(a: Omit<PrismaArticle, "content">): Article {
  return toArticle({ ...a, content: "" });
}

function toCategory(c: PrismaCategory): Category {
  return { slug: c.slug, name: c.name, parent: c.parentSlug, description: c.description, menu: c.menu as MenuPlacement, order: c.order };
}

function toEpaper(e: PrismaEpaper): Epaper {
  return { id: e.id, title: e.title, slug: e.slug, cover: e.cover, link: e.link, publishedAt: e.publishedAt.toISOString() };
}

function toPrismaArticle(a: Article) {
  return {
    slug: a.slug,
    title: a.title,
    subtitle: a.subtitle ?? "",
    sapo: a.sapo ?? "",
    description: a.description ?? "",
    content: a.content ?? "",
    image: a.image ?? "",
    ogImage: a.ogImage ?? "",
    categorySlug: a.category,
    tags: JSON.stringify(a.tags ?? []),
    author: a.author ?? "",
    source: a.source ?? "",
    type: a.type ?? "article",
    status: a.status ?? "published",
    isFeatured: !!a.isFeatured,
    isSpotlight: !!a.isSpotlight,
    views: a.views ?? 0,
    publishedAt: new Date(a.publishedAt),
  };
}

/** Các cột dùng cho danh sách (không lấy content để nhẹ) */
const summarySelect = {
  id: true, slug: true, title: true, subtitle: true, sapo: true, description: true, image: true, ogImage: true,
  categorySlug: true, tags: true, author: true, source: true, type: true, status: true, isFeatured: true,
  isSpotlight: true, views: true, publishedAt: true, updatedAt: true, createdAt: true,
} as const;

export interface ArticleListQuery {
  status?: ArticleStatus;
  /** danh sách slug chuyên mục (bao gồm chuyên mục con) */
  categories?: string[];
  featured?: boolean;
  spotlight?: boolean;
  types?: ArticleType[];
  excludeIds?: number[];
  publishedBefore?: Date;
  search?: string;
  orderBy?: "publishedAt" | "views" | "updatedAt";
  skip?: number;
  take?: number;
}

function buildWhere(q: ArticleListQuery) {
  return {
    ...(q.status ? { status: q.status } : {}),
    ...(q.categories ? { categorySlug: { in: q.categories } } : {}),
    ...(typeof q.featured === "boolean" ? { isFeatured: q.featured } : {}),
    ...(typeof q.spotlight === "boolean" ? { isSpotlight: q.spotlight } : {}),
    ...(q.types ? { type: { in: q.types } } : {}),
    ...(q.excludeIds?.length ? { id: { notIn: q.excludeIds } } : {}),
    ...(q.publishedBefore ? { publishedAt: { lte: q.publishedBefore } } : {}),
    ...(q.search
      ? {
          OR: [
            { title: { contains: q.search, mode: "insensitive" as const } },
            { description: { contains: q.search, mode: "insensitive" as const } },
            { author: { contains: q.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export const db = {
  articles: {
    /** Danh sách bài viết (không kèm content) */
    async list(q: ArticleListQuery = {}): Promise<Article[]> {
      const rows = await prisma.article.findMany({
        where: buildWhere(q),
        orderBy: q.orderBy === "views" ? [{ views: "desc" }, { publishedAt: "desc" }] : q.orderBy === "updatedAt" ? { updatedAt: "desc" } : { publishedAt: "desc" },
        skip: q.skip,
        take: q.take,
        select: summarySelect,
      });
      return rows.map(toArticleSummary);
    },
    async count(q: ArticleListQuery = {}): Promise<number> {
      return prisma.article.count({ where: buildWhere(q) });
    },
    async get(id: number): Promise<Article | undefined> {
      const row = await prisma.article.findUnique({ where: { id } });
      return row ? toArticle(row) : undefined;
    },
    async create(a: Omit<Article, "id" | "createdAt" | "updatedAt">): Promise<Article> {
      const row = await prisma.article.create({ data: toPrismaArticle(a as Article) });
      return toArticle(row);
    },
    async update(id: number, a: Partial<Article>): Promise<Article> {
      const current = await prisma.article.findUniqueOrThrow({ where: { id } });
      const merged = { ...toArticle(current), ...a, id };
      const row = await prisma.article.update({ where: { id }, data: toPrismaArticle(merged) });
      return toArticle(row);
    },
    async remove(id: number): Promise<boolean> {
      try {
        await prisma.article.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
    async incrementViews(id: number): Promise<void> {
      // Dùng SQL thuần để không kích hoạt @updatedAt (lượt xem không phải là "sửa bài")
      await prisma.$executeRaw`UPDATE "Article" SET "views" = "views" + 1 WHERE "id" = ${id}`.catch(() => undefined);
    },
    /** id + slug + updatedAt của toàn bộ bài đã đăng (cho sitemap / static params) */
    async publishedRefs(): Promise<{ id: number; slug: string; updatedAt: string; image: string; title: string; publishedAt: string }[]> {
      const rows = await prisma.article.findMany({
        where: { status: "published", publishedAt: { lte: new Date() } },
        select: { id: true, slug: true, updatedAt: true, image: true, title: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
      });
      return rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString(), publishedAt: r.publishedAt.toISOString() }));
    },
  },
  categories: {
    async all(): Promise<Category[]> {
      const rows = await prisma.category.findMany({ orderBy: { order: "asc" } });
      return rows.map(toCategory);
    },
    async get(slug: string): Promise<Category | undefined> {
      const row = await prisma.category.findUnique({ where: { slug } });
      return row ? toCategory(row) : undefined;
    },
    async upsert(c: Category): Promise<Category> {
      const data = { name: c.name, parentSlug: c.parent || null, description: c.description ?? "", menu: c.menu ?? "main", order: c.order ?? 0 };
      const row = await prisma.category.upsert({ where: { slug: c.slug }, create: { slug: c.slug, ...data }, update: data });
      return toCategory(row);
    },
    async remove(slug: string): Promise<{ ok: boolean; reason?: string }> {
      const used = await prisma.article.count({ where: { categorySlug: slug } });
      if (used > 0) return { ok: false, reason: `Chuyên mục đang có ${used} bài viết` };
      const children = await prisma.category.count({ where: { parentSlug: slug } });
      if (children > 0) return { ok: false, reason: "Chuyên mục đang có chuyên mục con" };
      await prisma.category.delete({ where: { slug } });
      return { ok: true };
    },
    async countArticles(): Promise<Record<string, number>> {
      const rows = await prisma.article.groupBy({ by: ["categorySlug"], _count: { _all: true } });
      return Object.fromEntries(rows.map((r) => [r.categorySlug, r._count._all]));
    },
  },
  settings: {
    async get(): Promise<SiteSettings> {
      const row = await prisma.setting.findUnique({ where: { key: "site" } });
      if (!row) throw new Error("Chưa có cài đặt site. Hãy chạy `npm run db:seed`.");
      return JSON.parse(row.value) as SiteSettings;
    },
    async save(settings: SiteSettings): Promise<SiteSettings> {
      await prisma.setting.upsert({ where: { key: "site" }, create: { key: "site", value: JSON.stringify(settings) }, update: { value: JSON.stringify(settings) } });
      return settings;
    },
  },
  epapers: {
    async all(): Promise<Epaper[]> {
      const rows = await prisma.epaper.findMany({ orderBy: { publishedAt: "desc" } });
      return rows.map(toEpaper);
    },
  },
  stats: {
    async dashboard() {
      const [articles, published, drafts, categories, latest] = await Promise.all([
        prisma.article.count(),
        prisma.article.count({ where: { status: "published" } }),
        prisma.article.count({ where: { status: "draft" } }),
        prisma.category.count(),
        prisma.article.findMany({ orderBy: { updatedAt: "desc" }, take: 8, select: summarySelect }),
      ]);
      const totalViews = await prisma.article.aggregate({ _sum: { views: true } });
      return { articles, published, drafts, categories, totalViews: totalViews._sum.views ?? 0, latest: latest.map(toArticleSummary) };
    },
  },
};
