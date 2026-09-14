import { api } from "./admin-client";
import type { Article, Category, PagedResponse, SiteSettings } from "./types";

function toQueryString(params?: URLSearchParams | string | Record<string, string>): string {
  if (!params) return "";
  if (typeof params === "string") return params;
  if (params instanceof URLSearchParams) return params.toString();
  return new URLSearchParams(params).toString();
}

export const ArticleService = {
  list: (params?: URLSearchParams | string | Record<string, string>) => {
    const q = toQueryString(params);
    return api<PagedResponse<Article>>(`/api/admin/articles${q ? `?${q}` : ""}`);
  },
  get: (id: number) => api<Article>(`/api/admin/articles/${id}`),
  create: (payload: Record<string, unknown>) => api<Article>("/api/admin/articles", { method: "POST", json: payload }),
  update: (id: number, payload: Record<string, unknown>) => api<Article>(`/api/admin/articles/${id}`, { method: "PUT", json: payload }),
  remove: (id: number) => api(`/api/admin/articles/${id}`, { method: "DELETE" }),
};

export const CategoryService = {
  list: (params?: URLSearchParams | string | Record<string, string>) => {
    const q = toQueryString(params);
    return api<PagedResponse<Category & { articleCount?: number }>>(`/api/admin/categories${q ? `?${q}` : ""}`);
  },
  upsert: (values: Category) => api("/api/admin/categories", { method: "PUT", json: { ...values, parent: values.parent || null } }),
  remove: (slug: string) => api(`/api/admin/categories?slug=${encodeURIComponent(slug)}`, { method: "DELETE" }),
};


export const SettingsService = {
  get: () => api<SiteSettings>("/api/admin/settings"),
  update: (values: SiteSettings) => api("/api/admin/settings", { method: "PUT", json: values }),
};

export const AuthService = {
  login: (password: string) => api("/api/admin/auth", { method: "POST", json: { password } }),
  logout: () => api("/api/admin/auth", { method: "DELETE" }),
};

export interface DashboardStats {
  articles: number;
  published: number;
  drafts: number;
  categories: number;
  totalViews: number;
  latest: Article[];
}

export const StatsService = {
  getDashboard: () => api<DashboardStats>("/api/admin/stats"),
};
