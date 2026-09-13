/**
 * Các truy vấn đọc dùng cho giao diện công khai.
 * Tách riêng khỏi `db.ts` để logic hiển thị (trang chủ, chuyên mục...) không phụ thuộc
 * vào cách lưu trữ.
 */
import { db } from "./db";
import type { Article, Category, CategoryBlock, HomeData, Paged } from "./types";
import { normalizeForSearch } from "./utils";

export const PAGE_SIZE = 18;

const PUBLISHED = () => ({ status: "published" as const, publishedBefore: new Date() });

export async function getLatestArticles(limit: number, excludeIds: number[] = []): Promise<Article[]> {
  return db.articles.list({ ...PUBLISHED(), take: limit, excludeIds });
}

export async function getCategories(): Promise<Category[]> {
  return db.categories.all();
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return db.categories.get(slug);
}

/** Danh sách slug của chuyên mục và các chuyên mục con */
export async function categoryFamily(slug: string, all?: Category[]): Promise<string[]> {
  const cats = all ?? (await db.categories.all());
  const children = cats.filter((c) => c.parent === slug).map((c) => c.slug);
  return [slug, ...children];
}

export async function getArticlesByCategory(slug: string, limit?: number, excludeIds: number[] = [], all?: Category[]): Promise<Article[]> {
  const family = await categoryFamily(slug, all);
  return db.articles.list({ ...PUBLISHED(), categories: family, take: limit, excludeIds });
}

export async function getCategoryPage(slug: string, page = 1, pageSize = PAGE_SIZE): Promise<Paged<Article>> {
  const family = await categoryFamily(slug);
  const total = await db.articles.count({ ...PUBLISHED(), categories: family });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(Math.max(1, page), totalPages);
  const items = await db.articles.list({ ...PUBLISHED(), categories: family, skip: (p - 1) * pageSize, take: pageSize });
  return { items, page: p, pageSize, total, totalPages };
}

export async function getArticleById(id: number): Promise<Article | undefined> {
  const a = await db.articles.get(id);
  if (!a || a.status !== "published" || new Date(a.publishedAt).getTime() > Date.now()) return undefined;
  return a;
}

export async function getRelatedArticles(article: Article, limit = 6): Promise<Article[]> {
  const list = await getArticlesByCategory(article.category, 30, [article.id]);
  const tagSet = new Set(article.tags.map((t) => t.toLowerCase()));
  const score = (a: Article) => a.tags.reduce((s, t) => s + (tagSet.has(t.toLowerCase()) ? 1 : 0), 0);
  return [...list].sort((a, b) => score(b) - score(a)).slice(0, limit);
}

export async function getPopularArticles(limit = 5): Promise<Article[]> {
  return db.articles.list({ ...PUBLISHED(), orderBy: "views", take: limit });
}

/** Tìm kiếm không phân biệt dấu (lọc trong bộ nhớ trên tập bài đã đăng) */
export async function searchArticles(query: string, page = 1, pageSize = PAGE_SIZE): Promise<Paged<Article>> {
  const q = normalizeForSearch(query);
  const terms = q.split(" ").filter(Boolean);
  let list: Article[] = [];
  if (terms.length) {
    const all = await db.articles.list({ ...PUBLISHED() });
    list = all.filter((a) => {
      const hay = normalizeForSearch(`${a.title} ${a.description} ${a.sapo} ${a.tags.join(" ")} ${a.author}`);
      return terms.every((t) => hay.includes(t));
    });
  }
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(Math.max(1, page), totalPages);
  return { items: list.slice((p - 1) * pageSize, p * pageSize), page: p, pageSize, total, totalPages };
}

async function buildBlock(slug: string, limit: number, categories: Category[], used: Set<number>): Promise<CategoryBlock | null> {
  const category = categories.find((c) => c.slug === slug);
  if (!category) return null;
  const subs = categories.filter((c) => c.parent === slug);
  const articles = await getArticlesByCategory(slug, limit, [], categories);
  articles.forEach((a) => used.add(a.id));
  return { category, subs, articles };
}

export async function getHomeData(): Promise<HomeData> {
  const [categories, settings, epapers] = await Promise.all([db.categories.all(), db.settings.get(), db.epapers.all()]);
  const h = settings.home;
  const used = new Set<number>();

  let featured = await db.articles.list({ ...PUBLISHED(), featured: true, take: 3 });
  if (featured.length === 0) featured = await getLatestArticles(3);
  featured.forEach((a) => used.add(a.id));

  const coverList = await getLatestArticles(h.coverListCount || 5, [...used]);
  coverList.forEach((a) => used.add(a.id));

  let spotlight = await db.articles.list({ ...PUBLISHED(), spotlight: true, take: h.spotlightCount || 10 });
  if (spotlight.length < 4) spotlight = await getLatestArticles(h.spotlightCount || 10, [...used]);

  const breaking = await getLatestArticles(h.breakingCount || 10);

  const stage: CategoryBlock[] = [];
  for (const slug of h.stageCategories) {
    const b = await buildBlock(slug, 7, categories, used);
    if (b) stage.push(b);
  }

  const mmSubs = h.multimediaCategories.map((s) => categories.find((c) => c.slug === s)).filter((c): c is Category => !!c);
  let mmArticles = await db.articles.list({ ...PUBLISHED(), types: ["photo", "video"], take: 8 });
  if (mmArticles.length < 4) {
    const byCat = await db.articles.list({ ...PUBLISHED(), categories: h.multimediaCategories, take: 8 });
    mmArticles = byCat.length >= 4 ? byCat : await getLatestArticles(8, [...used]);
  }

  const grid: CategoryBlock[] = [];
  for (const slug of h.gridCategories) {
    const b = await buildBlock(slug, 4, categories, used);
    if (b && b.articles.length) grid.push(b);
  }

  const [latest, popular] = await Promise.all([getLatestArticles(5), getPopularArticles(5)]);
  const ticker = latest.slice(0, h.tickerCount || 5);

  return { featured, coverList, epaper: epapers[0] ?? null, spotlight, breaking, stage, multimedia: { articles: mmArticles, subs: mmSubs }, grid, latest, popular, ticker };
}

export async function getSidebarData() {
  const [latest, popular, settings] = await Promise.all([getLatestArticles(5), getPopularArticles(5), db.settings.get()]);
  return { latest, popular, ads: settings.ads.sidebar };
}

export async function getTicker(): Promise<Article[]> {
  const settings = await db.settings.get();
  return getLatestArticles(settings.home.tickerCount || 5);
}
