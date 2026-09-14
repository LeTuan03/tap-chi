/**
 * Lớp truy cập dữ liệu (repository) dùng Prisma.
 *
 * Toàn bộ ứng dụng chỉ gọi qua `db.*` và làm việc với các kiểu trong `types.ts`,
 * nên phần còn lại của code không phụ thuộc vào lược đồ Prisma.
 */
import type { Article as PrismaArticle, Category as PrismaCategory, Epaper as PrismaEpaper } from "@prisma/client";
import { prisma } from "./prisma";
import type { Article, ArticleStatus, ArticleType, Category, Epaper, ListQueryDto, MenuPlacement, PagedResponse, SiteSettings } from "./types";

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
    deletedAt: a.deletedAt ? a.deletedAt.toISOString() : null,
    isDeleted: a.isDeleted,
    createdBy: a.createdBy ?? null,
    updatedBy: a.updatedBy ?? null,
    deletedBy: a.deletedBy ?? null,
    version: a.version,
  };
}

/** Bỏ `content` để danh sách nhẹ hơn */
export function toArticleSummary(a: Omit<PrismaArticle, "content">): Article {
  return toArticle({ ...a, content: "" });
}

function toCategory(c: PrismaCategory): Category {
  return {
    id: c.slug,
    slug: c.slug,
    name: c.name,
    parent: c.parentSlug,
    description: c.description,
    menu: c.menu as MenuPlacement,
    order: c.order,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    deletedAt: c.deletedAt ? c.deletedAt.toISOString() : null,
    isDeleted: c.isDeleted,
    createdBy: c.createdBy ?? null,
    updatedBy: c.updatedBy ?? null,
    deletedBy: c.deletedBy ?? null,
    version: c.version,
  };
}

function toEpaper(e: PrismaEpaper): Epaper {
  return {
    id: e.id,
    title: e.title,
    slug: e.slug,
    cover: e.cover,
    link: e.link,
    publishedAt: e.publishedAt.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    deletedAt: e.deletedAt ? e.deletedAt.toISOString() : null,
    isDeleted: e.isDeleted,
    createdBy: e.createdBy ?? null,
    updatedBy: e.updatedBy ?? null,
    deletedBy: e.deletedBy ?? null,
    version: e.version,
  };
}

function toPrismaArticle(a: Partial<Article>) {
  return {
    slug: a.slug!,
    title: a.title!,
    subtitle: a.subtitle ?? "",
    sapo: a.sapo ?? "",
    description: a.description ?? "",
    content: a.content ?? "",
    image: a.image ?? "",
    ogImage: a.ogImage ?? "",
    categorySlug: a.category!,
    tags: JSON.stringify(a.tags ?? []),
    author: a.author ?? "",
    source: a.source ?? "",
    type: a.type ?? "article",
    status: a.status ?? "published",
    isFeatured: !!a.isFeatured,
    isSpotlight: !!a.isSpotlight,
    views: a.views ?? 0,
    publishedAt: new Date(a.publishedAt!),
    createdBy: a.createdBy ?? null,
    updatedBy: a.updatedBy ?? null,
  };
}

/** Các cột dùng cho danh sách (không lấy content để nhẹ) */
const summarySelect = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  sapo: true,
  description: true,
  image: true,
  ogImage: true,
  categorySlug: true,
  tags: true,
  author: true,
  source: true,
  type: true,
  status: true,
  isFeatured: true,
  isSpotlight: true,
  views: true,
  publishedAt: true,
  updatedAt: true,
  createdAt: true,
  deletedAt: true,
  isDeleted: true,
  createdBy: true,
  updatedBy: true,
  deletedBy: true,
  version: true,
} as const;

export interface ArticleListQuery extends ListQueryDto {
  status?: ArticleStatus;
  /** danh sách slug chuyên mục (bao gồm chuyên mục con) */
  categories?: string[];
  featured?: boolean;
  spotlight?: boolean;
  types?: ArticleType[];
  excludeIds?: number[];
  publishedBefore?: Date;
  orderBy?: "publishedAt" | "views" | "updatedAt" | "createdAt";
  skip?: number;
  take?: number;
}

function buildWhere(q: ArticleListQuery) {
  const where: Record<string, unknown> = {
    isDeleted: q.includeDeleted ? undefined : false,
    ...(q.status ? { status: q.status } : {}),
    ...(q.categories ? { categorySlug: { in: q.categories } } : {}),
    ...(typeof q.featured === "boolean" ? { isFeatured: q.featured } : {}),
    ...(typeof q.spotlight === "boolean" ? { isSpotlight: q.spotlight } : {}),
    ...(q.types ? { type: { in: q.types } } : {}),
    ...(q.excludeIds?.length ? { id: { notIn: q.excludeIds } } : {}),
    ...(q.publishedBefore ? { publishedAt: { lte: q.publishedBefore } } : {}),
  };

  const search = q.search || q.q;
  if (typeof search === "string" && search.trim()) {
    const s = search.trim();
    where.OR = [
      { title: { contains: s, mode: "insensitive" } },
      { description: { contains: s, mode: "insensitive" } },
      { author: { contains: s, mode: "insensitive" } },
    ];
  }

  const dateField = q.dateField || "createdAt";
  const dateWhere: Record<string, Date> = {};
  if (q.fromDate) dateWhere.gte = new Date(q.fromDate);
  if (q.toDate) dateWhere.lte = new Date(q.toDate);
  if (Object.keys(dateWhere).length > 0) {
    where[dateField] = dateWhere;
  }

  return where;
}

export const db = {
  articles: {
    /** Danh sách bài viết (không kèm content) */
    async list(q: ArticleListQuery = {}): Promise<Article[]> {
      const orderByObj =
        q.orderBy === "views"
          ? [{ views: "desc" as const }, { publishedAt: "desc" as const }, { id: "desc" as const }]
          : q.orderBy === "updatedAt"
          ? [{ updatedAt: "desc" as const }, { id: "desc" as const }]
          : q.orderBy === "createdAt"
          ? [{ createdAt: "desc" as const }, { id: "desc" as const }]
          : [{ publishedAt: "desc" as const }, { id: "desc" as const }];

      const rows = await prisma.article.findMany({
        where: buildWhere(q),
        orderBy: orderByObj,
        skip: q.skip,
        take: q.take,
        select: summarySelect,
      });
      return rows.map(toArticleSummary);
    },
    async pagedList(q: ArticleListQuery = {}): Promise<PagedResponse<Article>> {
      const page = Math.max(1, q.page || 1);
      const pageSize = Math.min(100, Math.max(1, q.pageSize || 20));
      const skip = (page - 1) * pageSize;

      const [items, total] = await Promise.all([
        this.list({ ...q, skip, take: pageSize }),
        this.count(q),
      ]);
      const totalPages = Math.ceil(total / pageSize);
      return { items, total, page, pageSize, totalPages };
    },
    async count(q: ArticleListQuery = {}): Promise<number> {
      return prisma.article.count({ where: buildWhere(q) });
    },
    async get(id: number, includeDeleted = false): Promise<Article | undefined> {
      const row = await prisma.article.findFirst({
        where: { id, ...(includeDeleted ? {} : { isDeleted: false }) },
      });
      return row ? toArticle(row) : undefined;
    },
    async create(a: Omit<Article, "id" | "createdAt" | "updatedAt" | "deletedAt" | "isDeleted">): Promise<Article> {
      const row = await prisma.article.create({ data: toPrismaArticle(a as Article) });
      return toArticle(row);
    },
    async update(id: number, a: Partial<Article>, updatedBy?: string): Promise<Article> {
      const current = await prisma.article.findFirstOrThrow({ where: { id } });
      const merged = { ...toArticle(current), ...a, id, updatedBy: updatedBy ?? a.updatedBy ?? null };
      const row = await prisma.article.update({
        where: { id },
        data: {
          ...toPrismaArticle(merged),
          version: { increment: 1 },
        },
      });
      return toArticle(row);
    },
    async remove(id: number, deletedBy?: string): Promise<boolean> {
      try {
        await prisma.article.update({
          where: { id },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: deletedBy ?? null,
          },
        });
        return true;
      } catch {
        return false;
      }
    },
    async incrementViews(id: number): Promise<void> {
      // Dùng SQL thuần để không kích hoạt @updatedAt (lượt xem không phải là "sửa bài")
      await prisma.$executeRaw`UPDATE "Article" SET "views" = "views" + 1 WHERE "id" = ${id} AND "isDeleted" = false`.catch(() => undefined);
    },
    /** id + slug + updatedAt của toàn bộ bài đã đăng (cho sitemap / static params) */
    async publishedRefs(): Promise<{ id: number; slug: string; updatedAt: string; image: string; title: string; publishedAt: string }[]> {
      const rows = await prisma.article.findMany({
        where: { status: "published", publishedAt: { lte: new Date() }, isDeleted: false },
        select: { id: true, slug: true, updatedAt: true, image: true, title: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
      });
      return rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString(), publishedAt: r.publishedAt.toISOString() }));
    },
  },
  categories: {
    async all(includeDeleted = false): Promise<Category[]> {
      const rows = await prisma.category.findMany({
        where: includeDeleted ? {} : { isDeleted: false },
        orderBy: { order: "asc" },
      });
      return rows.map(toCategory);
    },
    async pagedList(q: ListQueryDto = {}): Promise<PagedResponse<Category>> {
      const page = Math.max(1, q.page || 1);
      const pageSize = Math.min(100, Math.max(1, q.pageSize || 20));
      const skip = (page - 1) * pageSize;

      const where: Record<string, unknown> = {
        isDeleted: q.includeDeleted ? undefined : false,
      };

      const search = q.search || q.q;
      if (typeof search === "string" && search.trim()) {
        const s = search.trim();
        where.OR = [
          { name: { contains: s, mode: "insensitive" } },
          { slug: { contains: s, mode: "insensitive" } },
          { description: { contains: s, mode: "insensitive" } },
        ];
      }

      const dateField = q.dateField || "createdAt";
      const dateWhere: Record<string, Date> = {};
      if (q.fromDate) dateWhere.gte = new Date(q.fromDate);
      if (q.toDate) dateWhere.lte = new Date(q.toDate);
      if (Object.keys(dateWhere).length > 0) {
        where[dateField] = dateWhere;
      }

      const [rows, total] = await Promise.all([
        prisma.category.findMany({
          where,
          orderBy: [{ order: "asc" }, { createdAt: "desc" }, { slug: "asc" }],
          skip,
          take: pageSize,
        }),
        prisma.category.count({ where }),
      ]);

      const items = rows.map(toCategory);
      const totalPages = Math.ceil(total / pageSize);
      return { items, total, page, pageSize, totalPages };
    },
    async get(slug: string, includeDeleted = false): Promise<Category | undefined> {
      const row = await prisma.category.findFirst({
        where: { slug, ...(includeDeleted ? {} : { isDeleted: false }) },
      });
      return row ? toCategory(row) : undefined;
    },
    async upsert(c: Partial<Category> & { slug: string; name: string }): Promise<Category> {
      const data = {
        name: c.name,
        parentSlug: c.parent || null,
        description: c.description ?? "",
        menu: c.menu ?? "main",
        order: c.order ?? 0,
        createdBy: c.createdBy ?? null,
        updatedBy: c.updatedBy ?? null,
        isDeleted: false,
        deletedAt: null,
      };
      const row = await prisma.category.upsert({
        where: { slug: c.slug },
        create: { slug: c.slug, ...data },
        update: { ...data, version: { increment: 1 } },
      });
      return toCategory(row);
    },
    async remove(slug: string, deletedBy?: string): Promise<{ ok: boolean; reason?: string }> {
      const used = await prisma.article.count({ where: { categorySlug: slug, isDeleted: false } });
      if (used > 0) return { ok: false, reason: `Chuyên mục đang có ${used} bài viết` };
      const children = await prisma.category.count({ where: { parentSlug: slug, isDeleted: false } });
      if (children > 0) return { ok: false, reason: "Chuyên mục đang có chuyên mục con" };

      try {
        await prisma.category.update({
          where: { slug },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: deletedBy ?? null,
          },
        });
        return { ok: true };
      } catch {
        return { ok: false, reason: "Lỗi hệ thống khi xóa chuyên mục" };
      }
    },
    async countArticles(): Promise<Record<string, number>> {
      const rows = await prisma.article.groupBy({
        where: { isDeleted: false },
        by: ["categorySlug"],
        _count: { _all: true },
      });
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
    async all(includeDeleted = false): Promise<Epaper[]> {
      const rows = await prisma.epaper.findMany({
        where: includeDeleted ? {} : { isDeleted: false },
        orderBy: { publishedAt: "desc" },
      });
      return rows.map(toEpaper);
    },
    async pagedList(q: ListQueryDto = {}): Promise<PagedResponse<Epaper>> {
      const page = Math.max(1, q.page || 1);
      const pageSize = Math.min(100, Math.max(1, q.pageSize || 20));
      const skip = (page - 1) * pageSize;

      const where: Record<string, unknown> = {
        isDeleted: q.includeDeleted ? undefined : false,
      };

      const dateField = q.dateField || "createdAt";
      const dateWhere: Record<string, Date> = {};
      if (q.fromDate) dateWhere.gte = new Date(q.fromDate);
      if (q.toDate) dateWhere.lte = new Date(q.toDate);
      if (Object.keys(dateWhere).length > 0) {
        where[dateField] = dateWhere;
      }

      const [rows, total] = await Promise.all([
        prisma.epaper.findMany({
          where,
          orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
          skip,
          take: pageSize,
        }),
        prisma.epaper.count({ where }),
      ]);

      const items = rows.map(toEpaper);
      const totalPages = Math.ceil(total / pageSize);
      return { items, total, page, pageSize, totalPages };
    },
  },
  stats: {
    async dashboard() {
      const [articles, published, drafts, categories, latest] = await Promise.all([
        prisma.article.count({ where: { isDeleted: false } }),
        prisma.article.count({ where: { status: "published", isDeleted: false } }),
        prisma.article.count({ where: { status: "draft", isDeleted: false } }),
        prisma.category.count({ where: { isDeleted: false } }),
        prisma.article.findMany({ where: { isDeleted: false }, orderBy: { updatedAt: "desc" }, take: 8, select: summarySelect }),
      ]);
      const totalViews = await prisma.article.aggregate({ where: { isDeleted: false }, _sum: { views: true } });
      return { articles, published, drafts, categories, totalViews: totalViews._sum.views ?? 0, latest: latest.map(toArticleSummary) };
    },
  },
};

