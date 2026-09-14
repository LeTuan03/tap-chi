import { api } from "./admin-client";
import type { Article, Category, SiteSettings } from "./types";

interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const ArticleService = {
  list: (params: URLSearchParams) => api<ListResponse<Article>>(`/api/admin/articles?${params}`),
  get: (id: number) => api<Article>(`/api/admin/articles/${id}`),
  create: (payload: Record<string, unknown>) => api<Article>("/api/admin/articles", { method: "POST", json: payload }),
  update: (id: number, payload: Record<string, unknown>) => api<Article>(`/api/admin/articles/${id}`, { method: "PUT", json: payload }),
  remove: (id: number) => api(`/api/admin/articles/${id}`, { method: "DELETE" }),
};

export const CategoryService = {
  list: () => api<{ items: Category[] }>("/api/admin/categories"),
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
