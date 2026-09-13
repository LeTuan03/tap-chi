import type { Article, Category } from "./types";

/** Bỏ dấu tiếng Việt, dùng cho slug và tìm kiếm */
export function removeDiacritics(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function slugify(input: string): string {
  return removeDiacritics(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function normalizeForSearch(input: string): string {
  return removeDiacritics(input).toLowerCase().replace(/\s+/g, " ").trim();
}

export function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerpt(text: string, max = 160): string {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), 80)).trim() + "…";
}

export function articlePath(a: Pick<Article, "slug" | "id">): string {
  return `/${a.slug}-${a.id}`;
}

export function categoryPath(c: Category, all?: Category[]): string {
  if (c.parent) {
    const parent = all?.find((x) => x.slug === c.parent);
    return parent ? `/${parent.slug}/${c.slug}` : `/${c.parent}/${c.slug}`;
  }
  return `/${c.slug}`;
}

const TZ = "Asia/Ho_Chi_Minh";

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TZ }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return `${formatTime(iso)} | ${formatDate(iso)}`;
}

export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric", timeZone: TZ }).format(new Date(iso));
}

/** Ước tính thời gian đọc (phút) */
export function readingTime(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function absoluteUrl(pathOrUrl: string, base: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, base).toString();
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
