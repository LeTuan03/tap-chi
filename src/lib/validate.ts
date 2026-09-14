import { db } from "./db";
import type { Article, ArticleStatus, ArticleType, Category, MenuPlacement } from "./types";
import { slugify } from "./utils";

/** Loại bỏ script và thuộc tính sự kiện trong HTML nội dung */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["']?)\s*javascript:[^"'>\s]*/gi, "$1=$2#");
}

import { ARTICLE_STATUSES, ARTICLE_TYPES, MENU_PLACEMENTS } from "./constants";

type ArticleInput = Omit<Article, "id" | "createdAt" | "updatedAt" | "deletedAt" | "isDeleted" | "createdBy" | "updatedBy" | "deletedBy" | "version">;
type Result<T> = { ok: true; value: T } | { ok: false; errors: string[] };

function str(v: unknown, max = 100000): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function parseArticleInput(body: unknown, existing?: Article): Promise<Result<ArticleInput>> {
  const b = (body ?? {}) as Record<string, unknown>;
  const errors: string[] = [];

  const title = str(b.title, 250);
  if (!title) errors.push("Tiêu đề không được để trống");

  let slug = slugify(str(b.slug, 200));
  if (!slug) slug = slugify(title);
  if (!slug) errors.push("Không tạo được đường dẫn (slug) từ tiêu đề");

  const category = str(b.category, 100);
  if (!category) errors.push("Chưa chọn chuyên mục");
  else if (!(await db.categories.get(category))) errors.push(`Chuyên mục "${category}" không tồn tại`);

  const type = ARTICLE_TYPES.includes(b.type as ArticleType) ? (b.type as ArticleType) : "article";
  const status = ARTICLE_STATUSES.includes(b.status as ArticleStatus) ? (b.status as ArticleStatus) : "draft";

  const publishedAtRaw = str(b.publishedAt, 40);
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : new Date();
  if (Number.isNaN(publishedAt.getTime())) errors.push("Thời gian đăng không hợp lệ");

  const tags = Array.isArray(b.tags)
    ? (b.tags as unknown[]).map((t) => str(t, 60)).filter(Boolean).slice(0, 20)
    : str(b.tags, 1000)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 20);

  const views = Number(b.views);

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      slug,
      title,
      subtitle: str(b.subtitle, 250),
      sapo: str(b.sapo, 2000),
      description: str(b.description, 320),
      content: sanitizeHtml(str(b.content, 2_000_000)),
      image: str(b.image, 1000),
      ogImage: str(b.ogImage, 1000),
      category,
      tags,
      author: str(b.author, 120) || existing?.author || "Ban biên tập",
      source: str(b.source, 250),
      type,
      status,
      isFeatured: !!b.isFeatured,
      isSpotlight: !!b.isSpotlight,
      views: Number.isFinite(views) && views >= 0 ? Math.floor(views) : existing?.views ?? 0,
      publishedAt: publishedAt.toISOString(),
    },
  };
}

type CategoryInput = Omit<Category, "id" | "createdAt" | "updatedAt" | "deletedAt" | "isDeleted" | "createdBy" | "updatedBy" | "deletedBy" | "version">;

export function parseCategoryInput(body: unknown): Result<CategoryInput> {
  const b = (body ?? {}) as Record<string, unknown>;
  const errors: string[] = [];
  const name = str(b.name, 120);
  if (!name) errors.push("Tên chuyên mục không được để trống");
  let slug = slugify(str(b.slug, 120));
  if (!slug) slug = slugify(name);
  if (!slug) errors.push("Không tạo được slug");
  const parent = str(b.parent, 120) || null;
  if (parent && parent === slug) errors.push("Chuyên mục không thể là cha của chính nó");
  const menu = MENU_PLACEMENTS.includes(b.menu as MenuPlacement) ? (b.menu as MenuPlacement) : "main";
  const order = Number(b.order);
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { slug, name, parent, description: str(b.description, 320), menu, order: Number.isFinite(order) ? order : 0 } };
}

import type { ListQueryDto } from "./types";

export function parseListQueryDto(input: URLSearchParams | Record<string, unknown>): Result<ListQueryDto> {
  const errors: string[] = [];
  const getParam = (key: string): string | undefined => {
    if (input instanceof URLSearchParams) {
      const v = input.get(key);
      return v !== null ? v.trim() : undefined;
    }
    const val = input[key];
    return typeof val === "string" ? val.trim() : typeof val === "number" ? String(val) : undefined;
  };

  const rawPage = getParam("page");
  const rawPageSize = getParam("pageSize");
  const page = Math.max(1, Number(rawPage) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(rawPageSize) || 20));

  const fromDateRaw = getParam("fromDate");
  const toDateRaw = getParam("toDate");
  const dateFieldRaw = getParam("dateField");

  const validDateFields = ["createdAt", "updatedAt", "publishedAt", "deletedAt"] as const;
  const dateField = validDateFields.includes(dateFieldRaw as (typeof validDateFields)[number])
    ? (dateFieldRaw as (typeof validDateFields)[number])
    : "createdAt";

  let parsedFromDate: Date | undefined;
  let parsedToDate: Date | undefined;

  if (fromDateRaw) {
    const d = new Date(fromDateRaw.includes("T") ? fromDateRaw : `${fromDateRaw}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime())) {
      errors.push("Ngày bắt đầu (fromDate) không hợp lệ");
    } else {
      parsedFromDate = d;
    }
  }

  if (toDateRaw) {
    const d = new Date(toDateRaw.includes("T") ? toDateRaw : `${toDateRaw}T23:59:59.999Z`);
    if (Number.isNaN(d.getTime())) {
      errors.push("Ngày kết thúc (toDate) không hợp lệ");
    } else {
      parsedToDate = d;
    }
  }

  if (parsedFromDate && parsedToDate && parsedFromDate.getTime() > parsedToDate.getTime()) {
    errors.push("Ngày bắt đầu không được lớn hơn ngày kết thúc");
  }

  const search = getParam("q") || getParam("search") || undefined;
  const includeDeletedRaw = getParam("includeDeleted");
  const includeDeleted = includeDeletedRaw === "true" || includeDeletedRaw === "1";

  const sortBy = getParam("sortBy") || undefined;
  const sortOrderRaw = getParam("sortOrder");
  const sortOrder = sortOrderRaw === "asc" ? "asc" : sortOrderRaw === "desc" ? "desc" : undefined;

  if (errors.length) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      page,
      pageSize,
      fromDate: parsedFromDate ? parsedFromDate.toISOString() : undefined,
      toDate: parsedToDate ? parsedToDate.toISOString() : undefined,
      dateField,
      search,
      includeDeleted,
      sortBy,
      sortOrder,
    },
  };
}

