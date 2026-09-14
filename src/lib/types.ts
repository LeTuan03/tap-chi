export type ArticleType = "article" | "photo" | "video";
export type ArticleStatus = "published" | "draft";
export type MenuPlacement = "main" | "more" | "hidden";

/**
 * BaseEntity dùng chung cho các entity trong hệ thống.
 * Chuẩn hóa các trường quản lý dữ liệu và hỗ trợ xóa mềm (soft delete).
 */
export interface BaseEntity<TId = number | string> {
  id: TId;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isDeleted: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
  version?: number;
}

/** DTO cho bộ lọc tìm kiếm theo khoảng thời gian */
export interface DateFilterDto {
  fromDate?: string;
  toDate?: string;
  dateField?: "createdAt" | "updatedAt" | "publishedAt" | "deletedAt";
}

/** DTO cho tham số phân trang */
export interface PaginationDto {
  page?: number;
  pageSize?: number;
}

/** DTO tổng hợp cho truy vấn danh sách */
export interface ListQueryDto extends DateFilterDto, PaginationDto {
  search?: string;
  includeDeleted?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}

/** Response chuẩn hóa cho API danh sách có phân trang */
export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type Paged<T> = PagedResponse<T>;

export interface Article extends BaseEntity<number> {
  slug: string;
  title: string;
  /** Tiêu đề phụ / kicker hiển thị phía trên tiêu đề chính */
  subtitle: string;
  /** Sa-pô (đoạn mở đầu in đậm) */
  sapo: string;
  /** Meta description dùng cho SEO (≤ 160 ký tự là tốt nhất) */
  description: string;
  /** Nội dung HTML */
  content: string;
  /** Ảnh đại diện */
  image: string;
  /** Ảnh chia sẻ mạng xã hội (1200x630). Bỏ trống sẽ dùng `image` */
  ogImage: string;
  /** slug chuyên mục (chuyên mục sâu nhất) */
  category: string;
  tags: string[];
  author: string;
  source: string;
  type: ArticleType;
  status: ArticleStatus;
  /** Hiển thị ở slider đầu trang chủ */
  isFeatured: boolean;
  /** Hiển thị ở dải "Nổi bật" */
  isSpotlight: boolean;
  views: number;
  publishedAt: string;
}

export interface Category extends BaseEntity<string> {
  /** Slug trùng với id của Category */
  slug: string;
  name: string;
  parent: string | null;
  description: string;
  menu: MenuPlacement;
  order: number;
}

export interface Epaper extends BaseEntity<number> {
  title: string;
  slug: string;
  cover: string;
  link: string;
  publishedAt: string;
}

export interface AdItem {
  image: string;
  link: string;
  alt: string;
}

export interface WeatherItem {
  city: string;
  temp: number;
  icon: string;
}

export interface SiteSettings {
  siteName: string;
  shortName: string;
  tagline: string;
  description: string;
  keywords: string[];
  logo: string;
  logoBanner: string;
  logoFooter: string;
  ogImage: string;
  issn: string;
  editorInChief: string;
  address: string;
  email: string;
  phone: string;
  hotline: string;
  license: string;
  adsContact: { name: string; phone: string };
  copyright: string;
  socials: { facebook: string; youtube: string; tiktok: string; twitter: string };
  googleSiteVerification: string;
  gtmId: string;
  partnerLink: { url: string; image: string; label: string };
  weather: WeatherItem[];
  home: {
    tickerCount: number;
    coverListCount: number;
    spotlightCount: number;
    breakingCount: number;
    stageCategories: string[];
    gridCategories: string[];
    multimediaCategories: string[];
  };
  ads: { sidebar: AdItem[] };
}

export interface CategoryBlock {
  category: Category;
  subs: Category[];
  articles: Article[];
}

export interface HomeData {
  featured: Article[];
  coverList: Article[];
  epaper: Epaper | null;
  spotlight: Article[];
  breaking: Article[];
  stage: CategoryBlock[];
  multimedia: { articles: Article[]; subs: Category[] };
  grid: CategoryBlock[];
  latest: Article[];
  popular: Article[];
  ticker: Article[];
}

