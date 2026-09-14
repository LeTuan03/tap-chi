import type { ArticleStatus, ArticleType, MenuPlacement } from "./types";

export const ADMIN_PAGE_SIZE = 20;
export const PUBLIC_PAGE_SIZE = 18;

export const ARTICLE_TYPES: ArticleType[] = ["article", "photo", "video"];
export const ARTICLE_STATUSES: ArticleStatus[] = ["published", "draft"];
export const MENU_PLACEMENTS: MenuPlacement[] = ["main", "more", "hidden"];

export const ARTICLE_TYPE_OPTIONS = [
  { value: "article", label: "Bài viết" },
  { value: "photo", label: "Phóng sự ảnh" },
  { value: "video", label: "Video" },
] as const;

export const ARTICLE_STATUS_OPTIONS = [
  { value: "published", label: "Đã đăng" },
  { value: "draft", label: "Bản nháp" },
] as const;
