# Coding Conventions & Development Guidelines

> Tài liệu bắt buộc đọc trước khi thực hiện bất kỳ task nào.
> Mọi thay đổi phải tuân thủ nghiêm ngặt các quy tắc trong file này.

---

## Mục lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Tech Stack & Dependency](#2-tech-stack--dependency)
3. [Kiến trúc & Tổ chức thư mục](#3-kiến-trúc--tổ-chức-thư-mục)
4. [TypeScript Conventions](#4-typescript-conventions)
5. [React & Next.js Conventions](#5-react--nextjs-conventions)
6. [Component Design](#6-component-design)
7. [State Management & Data Fetching](#7-state-management--data-fetching)
8. [API Design & Route Handlers](#8-api-design--route-handlers)
9. [Database & Prisma](#9-database--prisma)
10. [Validation & Data Integrity](#10-validation--data-integrity)
11. [Authentication & Authorization](#11-authentication--authorization)
12. [Security](#12-security)
13. [Error Handling & Logging](#13-error-handling--logging)
14. [Performance & Caching](#14-performance--caching)
15. [SEO](#15-seo)
16. [Accessibility](#16-accessibility)
17. [Styling & Responsive UI](#17-styling--responsive-ui)
18. [Testing & Debugging](#18-testing--debugging)
19. [Git Workflow & Commit Conventions](#19-git-workflow--commit-conventions)
20. [Environment Variables & Secrets](#20-environment-variables--secrets)
21. [Quy trình phát triển tính năng](#21-quy-trình-phát-triển-tính-năng)
22. [Quy tắc dành cho AI](#22-quy-tắc-dành-cho-ai)
23. [Lỗi phổ biến AI thường mắc](#23-lỗi-phổ-biến-ai-thường-mắc)
24. [Checklist](#24-checklist)

---

## 1. Tổng quan dự án

**Tạp chí Làng nghề Việt Nam** — Website tạp chí tin tức điện tử, gồm 3 phần chính:

| Phần | URL | Mô tả |
|---|---|---|
| Trang công khai | `/(site)/*` | Hiển thị bài viết, chuyên mục, tìm kiếm. SSR + ISR, tối ưu SEO. |
| Trang quản trị | `/admin/*` | CRUD bài viết, chuyên mục, cài đặt site. Xác thực bằng mật khẩu. |
| API | `/api/*` | REST endpoints cho admin CRUD và public (increment views). |

**Ngôn ngữ nội dung**: Tiếng Việt (`lang="vi"`). Timezone: `Asia/Ho_Chi_Minh`.

**URL patterns**:
- Bài viết: `/{slug}-{id}` (ví dụ `/lang-nghe-truyen-thong-42`)
- Chuyên mục cha: `/{slug}`
- Chuyên mục con: `/{parent-slug}/{slug}`
- Phân trang: `/{category}/trang/{page}`

---

## 2. Tech Stack & Dependency

| Layer | Technology | Version | Ghi chú |
|---|---|---|---|
| Framework | Next.js (App Router) | 15.x | `reactStrictMode: true`, `poweredByHeader: false` |
| Runtime | React | 19.x | Server Components mặc định |
| Language | TypeScript | 5.x | `strict: true`, path alias `@/*` → `./src/*` |
| Database | PostgreSQL + Prisma ORM | Prisma 6.x | Schema tại `prisma/schema.prisma` |
| UI (Admin) | Ant Design | 6.x | `transpilePackages` đã cấu hình |
| Rich Editor | TipTap | 3.x | Admin article editor |
| Date | dayjs | 1.x | Admin forms. Public dùng `Intl.DateTimeFormat` |
| Font | Lora + Be Vietnam Pro | Google Fonts | Via `next/font`, CSS vars `--font-lora`, `--font-be-vietnam` |
| Styling | Vanilla CSS | — | Không dùng Tailwind, CSS Modules, CSS-in-JS |

### Quy tắc dependency

- **KHÔNG thêm dependency mới** mà chưa được phê duyệt rõ ràng.
- Trước khi đề xuất thêm package, phải trả lời 3 câu hỏi:
  1. Có thể giải quyết bằng code hiện có hoặc native API không?
  2. Bundle size bao nhiêu? (Kiểm tra bundlephobia.com)
  3. Có alternative nhẹ hơn không?
- Ưu tiên native API: `Intl.DateTimeFormat` (format date public), `crypto.subtle` (HMAC), `fetch` (HTTP client).
- KHÔNG dùng: `axios`, `lodash`, `moment`, `uuid`, `styled-components`, `SWR`, `TanStack Query`.

---

## 3. Kiến trúc & Tổ chức thư mục

```
src/
  app/                          # Next.js App Router
    (site)/                     # Route group — trang công khai
      [...path]/                # Dynamic catch-all: chuyên mục + bài viết
      tim-kiem/                 # Trang tìm kiếm
      layout.tsx                # Layout công khai (SiteChrome)
      page.tsx                  # Trang chủ
    admin/                      # Route group — trang quản trị
      (dashboard)/              # Dashboard routes (sau login)
      login/                    # Trang đăng nhập
      layout.tsx                # Layout admin (AdminShell)
      admin.css                 # CSS riêng admin
    api/
      admin/                    # API quản trị (CRUD, auth, upload)
        articles/               # /api/admin/articles
        categories/             # /api/admin/categories
        settings/               # /api/admin/settings
        auth/                   # /api/admin/auth
        stats/                  # /api/admin/stats
        upload/                 # /api/admin/upload
      articles/                 # API công khai (increment views)
    globals.css                 # CSS toàn cục trang công khai
    layout.tsx                  # Root layout (font, metadata)
    robots.ts / sitemap.ts      # SEO sinh động
    rss.xml/ / news-sitemap.xml/# Feed & news sitemap
    manifest.ts                 # PWA manifest
    not-found.tsx               # 404

  components/
    site/                       # Components trang công khai (Server Components)
      views/                    # Page-level view components
      ArticleCard.tsx           # Card bài viết (dùng lại khắp nơi)
      SiteHeader.tsx            # Header
      SiteFooter.tsx            # Footer
      SiteChrome.tsx            # Wrapper layout (header + footer)
      ...
    admin/                      # Components trang quản trị (Client Components)
      ArticleForm.tsx           # Form soạn bài viết
      ArticleList.tsx           # Danh sách bài viết
      CategoryManager.tsx       # Quản lý chuyên mục
      Dashboard.tsx             # Bảng điều khiển
      ...

  lib/                          # Shared logic (KHÔNG chứa component)
    prisma.ts                   # Prisma client singleton
    db.ts                       # Repository layer — mọi truy vấn DB đi qua đây
    queries.ts                  # Query builders cho trang công khai
    types.ts                    # Shared TypeScript types
    utils.ts                    # Pure utility functions
    validate.ts                 # Validate + sanitize input
    auth.ts                     # Tạo/xác minh session token
    admin-client.ts             # Fetch wrapper cho admin (browser-side)
    seo.ts                      # Metadata + JSON-LD generators
    revalidate.ts               # Cache revalidation helper

  styles/
    tokens.css                  # CSS custom properties (design tokens)
    base.css                    # Reset + base styles

  middleware.ts                 # Auth guard cho /admin/* và /api/admin/*

prisma/
  schema.prisma                 # Lược đồ CSDL (Category, Article, Epaper, Setting)
  seed.mjs                      # Seed data mẫu
```

### Nguyên tắc tổ chức

1. **Phân tách rõ ràng**: `site/` vs `admin/` — không chia sẻ component giữa hai phần.
2. **Shared logic tập trung trong `lib/`**: types, utils, db, validation. Component KHÔNG đặt trong `lib/`.
3. **Colocate khi hợp lý**: CSS admin riêng (`admin.css`) nằm cùng route group admin.
4. **Một component per file**. Tên file = tên component (`PascalCase.tsx`).
5. **Không tạo barrel file** (`index.ts`) trừ khi thật cần thiết. Import trực tiếp.
6. **Khi thêm feature mới**: đặt component vào `site/` hoặc `admin/` tương ứng. Chỉ promote lên `lib/` khi logic dùng chung ở cả hai phần.

---

## 4. TypeScript Conventions

### Strictness

- `strict: true` — KHÔNG TẮT, không override bằng `@ts-ignore` / `@ts-expect-error` trừ trường hợp ngoại lệ có ghi chú.
- KHÔNG dùng `any`. Dùng `unknown` khi type không xác định.
- Ngoại lệ duy nhất: ép kiểu từ `body` của request vào `Record<string, unknown>` (đã có pattern trong `validate.ts`).

### Type vs Interface

```ts
// interface — cho object shapes, mở rộng được
interface Article {
  id: number;
  title: string;
}

// type — cho union, intersection, computed types
type ArticleType = "article" | "photo" | "video";
type ArticleInput = Omit<Article, "id" | "createdAt" | "updatedAt">;
type Result<T> = { ok: true; value: T } | { ok: false; errors: string[] };
```

### Naming

| Loại | Convention | Ví dụ |
|---|---|---|
| Component | `PascalCase.tsx` | `ArticleCard.tsx`, `SiteHeader.tsx` |
| Utility/module | `camelCase.ts` | `utils.ts`, `auth.ts`, `validate.ts` |
| Type/Interface | `PascalCase` | `Article`, `SiteSettings`, `CategoryBlock` |
| Union type | `PascalCase` | `ArticleType`, `MenuPlacement` |
| Constant | `UPPER_SNAKE_CASE` hoặc `camelCase` | `PAGE_SIZE`, `PUBLISHED`, `summarySelect` |
| Boolean | Prefix `is`, `has`, `should`, `can` | `isFeatured`, `isSpotlight` |
| Event handler | Prefix `on` (prop), `handle` (internal) | `onFinish`, `handleSubmit` |

### Quy tắc khác

- KHÔNG dùng `enum`. Dùng union type + mảng `as const`:
  ```ts
  type ArticleType = "article" | "photo" | "video";
  const TYPES: ArticleType[] = ["article", "photo", "video"];
  ```
- KHÔNG dùng `var`. Mặc định `const`, chỉ dùng `let` khi cần reassign.
- KHÔNG dùng `React.FC` / `React.FunctionComponent`. Khai báo props trực tiếp:
  ```tsx
  function Button({ label }: { label: string }) { ... }
  ```
- Dùng type inference — không annotate khi TypeScript tự suy luận được:
  ```ts
  // KHÔNG: const name: string = "Alice";
  // ĐÚNG:
  const name = "Alice";
  ```

---

## 5. React & Next.js Conventions

### Server Components vs Client Components

| | Server Component (mặc định) | Client Component (`"use client"`) |
|---|---|---|
| Khi nào | Hiển thị tĩnh, fetch data từ DB | Tương tác: form, slider, toggle, event handler |
| Dùng ở | Toàn bộ trang công khai (trừ slider/toggle) | Hầu hết trang admin (antd form, editor) |
| Data | Gọi trực tiếp `db.*`, `queries.*` | Gọi API qua `api()` từ `admin-client.ts` |

**Quy tắc**:
- Mặc định viết Server Component. Chỉ thêm `"use client"` khi THẬT SỰ cần.
- KHÔNG import server-only module (`db.ts`, `prisma.ts`, `queries.ts`) trong Client Component.
- KHÔNG import `antd` component trong trang công khai (site).

### Component structure

```tsx
// 1. "use client" (nếu cần)
"use client";

// 2. Imports — thứ tự: framework → third-party → internal
import { useState } from "react";
import { Button } from "antd";
import { api } from "@/lib/admin-client";
import type { Article } from "@/lib/types";

// 3. Types/Interfaces
interface Props {
  article: Article;
  className?: string;
}

// 4. Component function (named export hoặc default export)
export default function ArticleCard({ article, className = "" }: Props) {
  // 5. Hooks → derived values → handlers → early returns → JSX
}
```

### Early returns

```tsx
// ĐÚNG — flat, dễ đọc
function UserProfile({ user, isLoading, error }: Props) {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return null;
  return <Profile user={user} />;
}

// SAI — nested ternary
function UserProfile({ user, isLoading, error }: Props) {
  return (
    <div>
      {isLoading ? <Spinner /> : error ? <ErrorMessage /> : <Profile />}
    </div>
  );
}
```

### Lists & Keys

- LUÔN dùng key ổn định, duy nhất: `key={article.id}`, `key={category.slug}`.
- KHÔNG dùng array index làm key cho danh sách động.
- Guard cho giá trị `0`: `{items.length > 0 && <List items={items} />}` — KHÔNG dùng `{count && ...}`.

### `revalidate` & ISR

- Trang công khai dùng ISR: `export const revalidate = 60;` (60 giây).
- Admin mutation gọi `revalidateSite()` (từ `revalidate.ts`) sau khi thay đổi dữ liệu.
- KHÔNG thay đổi chiến lược cache mà chưa đánh giá impact.

---

## 6. Component Design

### Nguyên tắc

1. **Single Responsibility**: Mỗi component chỉ làm một việc. Nếu component quá 200 dòng, tách.
2. **Composition over Configuration**: Ưu tiên truyền `children` hoặc element props thay vì config object phức tạp.
3. **Props tối giản**: Không quá 7 props. Nếu nhiều hơn, gom thành object hoặc tách component.
4. **Destructure props** trong function signature. Default values qua destructuring.
5. **Derived values inline**: Tính toán trong render, KHÔNG lưu vào state:
   ```ts
   // ĐÚNG
   const previewSlug = slug || slugify(title);
   // SAI
   const [previewSlug, setPreviewSlug] = useState("");
   useEffect(() => setPreviewSlug(slug || slugify(title)), [slug, title]);
   ```

### Pattern hiện có — ArticleCard

`ArticleCard` là component tái sử dụng nhiều nhất. Khi hiển thị bài viết ở bất kỳ đâu, dùng component này với các variant qua prop `className`:
- `card--compact`: Card nhỏ trong danh sách dọc
- `card--breaking`: Card tin nóng
- `card--lead`: Card bài chính (to)
- `card--secondary`: Card bài phụ (nhỏ)
- `card--horizontal`: Card ngang

KHÔNG tạo component card mới trùng mục đích. Thêm variant mới qua `className` + CSS.

### Admin Components

- Dùng Ant Design component (`Form`, `Table`, `Card`, `Select`, `Input`, `Button`...).
- Form pattern: `Form.useForm<T>()` + `onFinish` handler + `api()` call.
- Loading/error state: dùng `message` từ `App.useApp()` cho toast notification.
- KHÔNG import antd component vào trang công khai.

---

## 7. State Management & Data Fetching

### Không dùng state management library

Dự án này KHÔNG dùng Redux, Zustand, SWR, TanStack Query. KHÔNG tự ý thêm.

### Chiến lược data fetching

| Ngữ cảnh | Cách lấy dữ liệu | Ví dụ |
|---|---|---|
| Trang công khai (Server) | Gọi trực tiếp `db.*` hoặc `queries.*` | `getHomeData()`, `getArticleById()` |
| Trang quản trị (Client) | Gọi API qua `api()` | `api<Article>("/api/admin/articles/1")` |
| Mutation admin | `api()` + `method: "POST/PUT/DELETE"` | `api("/api/admin/articles", { method: "POST", json: payload })` |

### `api()` — Admin fetch wrapper (`src/lib/admin-client.ts`)

```ts
const data = await api<ResponseType>(url, {
  method: "POST",     // hoặc PUT, DELETE
  json: payload,      // tự serialize và set Content-Type
});
```

- Tự xử lý 401 → redirect về `/admin/login`.
- Throw `Error` khi `!res.ok` với message từ response body.
- KHÔNG tạo fetch wrapper mới. Dùng `api()`.

### State trong Client Components

- `useState` cho UI state đơn giản (loading, form values, toggle).
- KHÔNG lưu server data vào `useState` lâu dài. Fetch → render → done.
- `useMemo` chỉ khi tính toán thật sự tốn kém (filter mảng lớn).
- `useEffect` chỉ cho: fetch data ban đầu, event listener, timer. KHÔNG dùng để derive state.

---

## 8. API Design & Route Handlers

### Cấu trúc URL

```
POST   /api/admin/articles          → Tạo bài viết
GET    /api/admin/articles           → Danh sách bài viết
GET    /api/admin/articles/:id       → Chi tiết bài viết
PUT    /api/admin/articles/:id       → Cập nhật bài viết
DELETE /api/admin/articles/:id       → Xóa bài viết

GET    /api/admin/categories         → Danh sách chuyên mục
POST   /api/admin/categories         → Tạo/cập nhật chuyên mục
DELETE /api/admin/categories/:slug   → Xóa chuyên mục

GET    /api/admin/settings           → Lấy cài đặt
PUT    /api/admin/settings           → Cập nhật cài đặt

POST   /api/admin/auth               → Đăng nhập
DELETE /api/admin/auth               → Đăng xuất

GET    /api/admin/stats              → Thống kê dashboard

POST   /api/articles/:id/views       → Tăng lượt xem (public)
```

### Response format

```ts
// Thành công — trả data trực tiếp
return NextResponse.json(article);
return NextResponse.json({ items: articles, total: 100 });

// Lỗi — trả object có key `error` hoặc `errors`
return NextResponse.json({ error: "Bài viết không tồn tại" }, { status: 404 });
return NextResponse.json({ errors: ["Tiêu đề trống", "Chưa chọn chuyên mục"] }, { status: 400 });
```

### Quy tắc

- Mọi API admin đều được bảo vệ bởi `middleware.ts`. KHÔNG tạo API admin mới bên ngoài `/api/admin/`.
- Validate input bằng `parseArticleInput()` / `parseCategoryInput()` TRƯỚC khi ghi DB.
- Sau khi mutation thành công, gọi `revalidateSite()` để xóa cache ISR.
- KHÔNG trả error message tiếng Anh khi UI là tiếng Việt.

---

## 9. Database & Prisma

### Schema hiện tại

4 model: `Category`, `Article`, `Epaper`, `Setting`.

| Model | Primary Key | Ghi chú |
|---|---|---|
| `Category` | `slug` (String) | Cây cha-con qua `parentSlug`. `menu`: main/more/hidden. |
| `Article` | `id` (autoincrement Int) | Quan hệ N-1 với Category qua `categorySlug`. `tags` lưu dạng JSON string. |
| `Epaper` | `id` (autoincrement Int) | Ấn phẩm tạp chí in. |
| `Setting` | `key` (String) | Key "site" chứa toàn bộ `SiteSettings` dạng JSON. |

### Repository Pattern — `db.*`

**BẮT BUỘC**: Mọi truy vấn database phải đi qua `db.*` trong `src/lib/db.ts`.

```ts
// ĐÚNG
const article = await db.articles.get(id);
const categories = await db.categories.all();

// SAI — KHÔNG import prisma trực tiếp trong component hoặc route handler
import { prisma } from "@/lib/prisma";
const article = await prisma.article.findUnique({ where: { id } });
```

**Lý do**: `db.ts` chuyển đổi Prisma types → app types (`toArticle()`, `toCategory()`). Phần còn lại của codebase KHÔNG phụ thuộc vào schema Prisma.

### Khi thêm query mới

1. Thêm method vào `db` object trong `db.ts`.
2. Nếu là query cho trang công khai, thêm vào `queries.ts` (gọi qua `db.*`).
3. KHÔNG tạo file repository/query mới.

### Lưu ý connection pool

- Prisma client singleton (`prisma.ts`) — dùng `globalThis` để tránh tạo nhiều instance khi hot reload.
- `DATABASE_URL` nên có `connection_limit=5&pool_timeout=30`.
- `next.config.ts` giới hạn `cpus: 6` để tránh vượt `max_connections` PostgreSQL khi static build.

### Migrations

- Dự án dùng `prisma db push` (prototyping mode), KHÔNG dùng Prisma Migrate.
- Khi thay đổi schema: sửa `schema.prisma` → chạy `npm run db:push`.
- KHÔNG thay đổi schema mà chưa được phê duyệt.

---

## 10. Validation & Data Integrity

### Server-side validation (`src/lib/validate.ts`)

Mọi input từ API admin phải qua:
- `parseArticleInput(body, existing?)` → trả `Result<ArticleInput>`.
- `parseCategoryInput(body)` → trả `Result<Category>`.

**Pattern Result type**:
```ts
type Result<T> = { ok: true; value: T } | { ok: false; errors: string[] };
```

### Quy tắc validation

1. **Trim & limit length**: hàm `str(v, maxLength)` — luôn trim, giới hạn ký tự.
2. **Slug tự tạo từ title** nếu không cung cấp: `slugify(title)`.
3. **HTML content được sanitize**: loại bỏ `<script>`, `on*` attributes, `javascript:` URLs.
4. **Foreign key check**: validate `category` slug tồn tại trước khi tạo/sửa article.
5. **Thông báo lỗi bằng tiếng Việt**: "Tiêu đề không được để trống", "Chưa chọn chuyên mục"...

### Client-side validation

- Admin form dùng Ant Design `Form` rules: `{ required: true, message: "..." }`, `{ max: 250 }`.
- Validation client chỉ là UX convenience. Server LUÔN validate lại.
- KHÔNG tin tưởng data từ client.

---

## 11. Authentication & Authorization

### Kiến trúc auth hiện tại

- **Phương thức**: Mật khẩu đơn → cookie HMAC-SHA256 (không có hệ thống user/role).
- **Session token**: `<expiry_timestamp>.<hmac_signature>`, lưu trong cookie `lnv_admin`.
- **Crypto**: Web Crypto API (`crypto.subtle`) — tương thích cả Edge Runtime và Node.
- **Session TTL**: 7 ngày.

### Flow

1. User POST `/api/admin/auth` với `{ password }`.
2. Server so sánh với `ADMIN_PASSWORD` env var.
3. Nếu đúng, tạo session token → set cookie httpOnly.
4. `middleware.ts` kiểm tra cookie ở mọi request đến `/admin/*` và `/api/admin/*` (trừ login).

### Cookie options

```ts
{ httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 7 * 24 * 3600 }
```

### Quy tắc

- KHÔNG lưu token trong `localStorage` hoặc JavaScript-accessible cookie.
- KHÔNG hardcode mật khẩu trong source code. Dùng env var `ADMIN_PASSWORD`.
- KHÔNG thay đổi kiến trúc auth mà chưa được phê duyệt.
- Timing-safe compare đã implement (`constant-time` bitwise XOR).

---

## 12. Security

### Đã triển khai

| Biện pháp | Vị trí |
|---|---|
| Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy) | `next.config.ts` |
| `poweredByHeader: false` | `next.config.ts` |
| HTML sanitize (loại bỏ script, on* events, javascript: URLs) | `validate.ts` → `sanitizeHtml()` |
| httpOnly cookie | `auth.ts` |
| Timing-safe token comparison | `auth.ts` → `verifySessionToken()` |
| Auto redirect 401 | `admin-client.ts` |
| Middleware auth guard | `middleware.ts` |

### Quy tắc BẮT BUỘC

1. KHÔNG dùng `dangerouslySetInnerHTML` với nội dung từ user mà chưa sanitize.
2. KHÔNG đặt API key, secret, mật khẩu trong client-side code.
3. KHÔNG nội suy user input vào `href` attribute (phòng `javascript:` URL attack).
4. Mọi input từ API phải validate + sanitize. KHÔNG tin tưởng dữ liệu từ request body.
5. Biến không có prefix `NEXT_PUBLIC_` sẽ KHÔNG bị bundle vào client — đây là tính năng bảo mật.
6. KHÔNG tạo API endpoint mới bên ngoài `/api/admin/` mà bypass middleware auth.

---

## 13. Error Handling & Logging

### API Route Handlers

```ts
// Pattern xử lý lỗi trong route handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await parseArticleInput(body);
    if (!result.ok) {
      return NextResponse.json({ errors: result.errors }, { status: 400 });
    }
    const article = await db.articles.create(result.value);
    revalidateSite();
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/articles:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
```

### Client Components (Admin)

```ts
// Pattern xử lý lỗi trong admin form
try {
  await api("/api/admin/articles", { method: "POST", json: payload });
  message.success("Đã tạo bài viết");
} catch (e) {
  message.error((e as Error).message);
}
```

### Quy tắc

1. **KHÔNG để exception thoát** mà không xử lý. API handler phải catch tất cả.
2. **Trả error message tiếng Việt** trong response — user nhìn thấy qua toast.
3. **Log error ở server**: dùng `console.error()` với context (endpoint, input).
4. **KHÔNG dùng `console.log`** trong production code. Chỉ `console.warn` / `console.error`.
5. **KHÔNG nuốt lỗi im lặng** (empty catch block) trừ trường hợp đã ghi chú rõ lý do (ví dụ: `incrementViews` fail là chấp nhận được).
6. **Fallback graceful**: dữ liệu thiếu → hiển thị giá trị mặc định, KHÔNG crash trang.
   ```ts
   // Ví dụ trong db.ts
   if (featured.length === 0) featured = await getLatestArticles(3);
   ```

---

## 14. Performance & Caching

### ISR (Incremental Static Regeneration)

- Trang công khai: `export const revalidate = 60;` — cache 60 giây.
- Sau admin mutation: gọi `revalidateSite()` để purge cache.
- KHÔNG set `revalidate = 0` (no cache) ở trang công khai.

### Database queries

- Danh sách bài viết dùng `summarySelect` — KHÔNG lấy `content` khi không cần:
  ```ts
  const summarySelect = { id: true, slug: true, title: true, /* ... */ };
  // content: false → giảm payload
  ```
- `getHomeData()` dùng `Promise.all()` cho parallel queries.
- `incrementViews` dùng raw SQL (`$executeRaw`) để không trigger `@updatedAt`.

### Image Optimization

- Dùng `next/image` với `fill` + `sizes` attribute chính xác.
- Formats: `avif`, `webp` (cấu hình trong `next.config.ts`).
- Ảnh LCP: set `priority={true}` (chỉ 1-2 ảnh đầu trang).
- `sizes` prop phải match với CSS layout thực tế:
  ```tsx
  sizes="(max-width: 767px) 100vw, 340px"
  ```

### Bundle Size

- Admin dùng antd — đã cấu hình `transpilePackages` để tree-shake.
- KHÔNG import toàn bộ icon library. Import từng icon:
  ```ts
  // ĐÚNG
  import { SaveOutlined, EyeOutlined } from "@ant-design/icons";
  // SAI
  import * as Icons from "@ant-design/icons";
  ```
- `build.chunkSizeWarningLimit` mặc định Next.js. Theo dõi bundle size khi thêm dependency.

---

## 15. SEO

### Metadata (`src/lib/seo.ts`)

Mọi trang công khai PHẢI export `generateMetadata()`:

```ts
export async function generateMetadata(): Promise<Metadata> {
  const settings = await db.settings.get();
  return {
    title: "...",
    description: "...",
    alternates: { canonical: "/path" },
    openGraph: { type: "article", url: "/path", title: "...", description: "...", images: [...] },
    twitter: { card: "summary_large_image", ... },
  };
}
```

### Helper functions

| Function | Mục đích |
|---|---|
| `baseMetadata(settings)` | Metadata mặc định toàn site |
| `categoryMetadata(category, all, settings, page)` | Metadata trang chuyên mục |
| `articleMetadata(article, category, settings)` | Metadata trang bài viết |

### JSON-LD (`src/lib/seo.ts`)

Render qua component `<JsonLd data={...} />`:

| Function | Schema type |
|---|---|
| `organizationJsonLd(settings)` | NewsMediaOrganization |
| `websiteJsonLd(settings)` | WebSite (+ SearchAction) |
| `newsArticleJsonLd(article, category, settings)` | NewsArticle |
| `breadcrumbJsonLd(items)` | BreadcrumbList |
| `collectionPageJsonLd(category, all, articles, settings)` | CollectionPage |
| `itemListJsonLd(articles, name)` | ItemList |

### Các file SEO sinh động

- `robots.ts` — sinh `robots.txt` cho phép index toàn bộ.
- `sitemap.ts` — sinh sitemap.xml từ tất cả bài viết + chuyên mục.
- `news-sitemap.xml/` — Google News sitemap (bài mới trong 48h).
- `rss.xml/` — RSS 2.0 feed.
- `manifest.ts` — PWA manifest.

### Quy tắc SEO

1. Mọi trang mới phải có `generateMetadata()` + canonical URL.
2. `<h1>` chỉ xuất hiện MỘT LẦN mỗi trang.
3. Heading hierarchy: h1 → h2 → h3, không nhảy cấp.
4. Ảnh bài viết cần `alt` text mô tả nội dung.
5. URL bài viết: `/{slug}-{id}` — format này KHÔNG thay đổi (ảnh hưởng SEO backlink).
6. Khi thêm trang mới, cập nhật `sitemap.ts` nếu trang cần index.

---

## 16. Accessibility

### BẮT BUỘC

1. **Semantic HTML**: dùng `<article>`, `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<time>`.
   - KHÔNG dùng `<div>` cho interactive element.
   - `<button>` cho action, `<a>` (hoặc `<Link>`) cho navigation.
2. **`alt` text**: mọi `<img>` / `<Image>` phải có `alt`. Ảnh trang trí dùng `alt=""`.
3. **`aria-label`**: section thêm `aria-label` mô tả nội dung:
   ```tsx
   <section className="cover" aria-label="Tin tiêu điểm tạp chí">
   ```
4. **`aria-hidden`**: ảnh link duplicate (card có cả ảnh link + title link) dùng `tabIndex={-1} aria-hidden="true"` trên ảnh link.
5. **Keyboard accessible**: mọi element tương tác phải focus/activate được bằng bàn phím.
6. **Form label**: mọi input phải có `<label>` hoặc `aria-label`.

### Pattern hiện có

```tsx
// ArticleCard — ảnh link duplicate → aria-hidden
<Link href={href} tabIndex={-1} aria-hidden="true">
  <Image src={a.image} alt={a.title} fill sizes={sizes} />
</Link>
<Heading className="card__title">
  <Link href={href} title={a.title}>{a.title}</Link>
</Heading>
```

---

## 17. Styling & Responsive UI

### Kiến trúc CSS

| File | Nội dung | Phạm vi |
|---|---|---|
| `src/styles/tokens.css` | CSS custom properties (colors, fonts, spacing, breakpoints) | Toàn cục |
| `src/styles/base.css` | Reset, base typography, utility classes | Toàn cục |
| `src/app/globals.css` | Styles trang công khai (~55KB, newspaper layout) | Site |
| `src/app/admin/admin.css` | Styles riêng admin | Admin |

### Quy tắc

1. **Vanilla CSS only**: KHÔNG thêm Tailwind, CSS Modules, CSS-in-JS, Sass.
2. **Dùng CSS custom properties** từ `tokens.css` cho giá trị thiết kế:
   ```css
   color: var(--color-primary);
   font-family: var(--font-lora);
   ```
3. **BEM-like class naming**: `block__element--modifier`:
   ```css
   .card { }
   .card__title { }
   .card__badge--video { }
   .card--compact { }
   ```
4. **KHÔNG dùng inline style** trừ giá trị động:
   ```tsx
   // Chấp nhận
   <div style={{ width: `${percent}%` }}>
   // Không chấp nhận
   <div style={{ marginBottom: 16, display: "flex" }}>
   ```
   (Ngoại lệ: Admin form layout đang dùng inline style cho antd — giữ nguyên convention hiện tại.)
5. **Responsive**: mobile-first, breakpoints qua CSS media query. Không dùng JS cho responsive layout.
6. **Clamp text**: dùng utility class `clamp-2`, `clamp-3`, `clamp-5` (đã định nghĩa trong `globals.css`).

---

## 18. Testing & Debugging

### Tình trạng hiện tại

Dự án hiện CHƯA có test framework. Nếu cần thêm, đề xuất Vitest + React Testing Library.

### Kiểm tra thủ công (BẮT BUỘC sau mỗi thay đổi)

1. **TypeScript compile**: `npx tsc --noEmit` — zero errors.
2. **Build**: `npm run build` — thành công, không warning nghiêm trọng.
3. **Dev server**: `npm run dev` — trang chạy đúng, không lỗi console.
4. **Kiểm tra trình duyệt**: mở trang bị ảnh hưởng, verify hiển thị đúng.

### Debugging guidelines

1. **Đọc error message kỹ** trước khi sửa. Phần lớn TypeScript error đã chỉ rõ vấn đề.
2. **Prisma errors**: kiểm tra schema match với DB (`npx prisma db push`), kiểm tra connection string.
3. **Hydration mismatch**: thường do Server/Client render khác nhau — kiểm tra `typeof window` usage, `dayjs` locale, `Date.now()`.
4. **API 401**: kiểm tra cookie, middleware matcher, session expiry.
5. **ISR stale data**: gọi `revalidateSite()` hoặc chờ `revalidate` hết hạn.

---

## 19. Git Workflow & Commit Conventions

### Commit message format

```
<type>: <mô tả ngắn gọn bằng tiếng Việt hoặc tiếng Anh>

[body — giải thích chi tiết nếu cần]
```

**Types**:
| Type | Khi nào |
|---|---|
| `feat` | Tính năng mới |
| `fix` | Sửa bug |
| `refactor` | Tái cấu trúc không thay đổi behavior |
| `style` | Thay đổi CSS, formatting |
| `docs` | Tài liệu |
| `chore` | Config, dependency, scripts |
| `perf` | Cải thiện performance |

### Quy tắc

1. Mỗi commit giải quyết MỘT vấn đề. Không trộn feature + fix + refactor.
2. KHÔNG commit file `.env`, `.env.local`. Chỉ commit `.env.example`.
3. KHÔNG commit `node_modules/`, `.next/`, `tsconfig.tsbuildinfo`.
4. Trước khi commit: chạy `npx tsc --noEmit` và `npm run build`.
5. KHÔNG force push lên branch chính.

---

## 20. Environment Variables & Secrets

### Danh sách biến môi trường

| Biến | Phạm vi | Mô tả | Bắt buộc |
|---|---|---|---|
| `DATABASE_URL` | Server only | PostgreSQL connection string | ✅ |
| `NEXT_PUBLIC_SITE_URL` | Client + Server | URL gốc website (canonical, OG, sitemap) | ✅ |
| `ADMIN_PASSWORD` | Server only | Mật khẩu admin | ✅ |
| `AUTH_SECRET` | Server only | Chuỗi ký HMAC cho session cookie | ✅ |

### Quy tắc

1. Biến server-only (không có `NEXT_PUBLIC_`): KHÔNG bao giờ lộ ra client.
2. Biến mới phải thêm vào `.env.example` với giá trị placeholder.
3. KHÔNG commit `.env` / `.env.local` (đã có trong `.gitignore`).
4. KHÔNG hardcode giá trị env trong source code. Dùng `process.env.*` hoặc `import.meta.env.*`.
5. Default values chỉ cho development:
   ```ts
   const secret = process.env.AUTH_SECRET || "dev-secret-change-me";
   ```

---

## 21. Quy trình phát triển tính năng

### Quy trình 5 bước

```
1. Phân tích → 2. Thiết kế → 3. Triển khai → 4. Kiểm tra → 5. Báo cáo
```

#### Bước 1: Phân tích yêu cầu

- Đọc kỹ yêu cầu. Xác định phạm vi ảnh hưởng.
- Kiểm tra codebase: file nào cần sửa? Pattern nào đang dùng?
- Xác định rủi ro: thay đổi có break gì không?
- Nếu thiếu thông tin → HỎI, không suy đoán.

#### Bước 2: Thiết kế giải pháp

- Chọn giải pháp đơn giản nhất đạt yêu cầu. Không over-engineer.
- Tuân theo pattern hiện có. Không tạo pattern mới.
- Liệt kê file cần thay đổi trước khi code.

#### Bước 3: Triển khai

- Sửa ít nhất có thể. Phạm vi thay đổi tỉ lệ thuận với rủi ro.
- Giữ nguyên code không liên quan. Không "tiện tay" refactor.
- Tuân thủ mọi convention trong tài liệu này.

#### Bước 4: Kiểm tra

- `npx tsc --noEmit` — zero errors.
- `npm run build` — thành công.
- Kiểm tra trực quan trên browser nếu thay đổi UI.
- Verify cả happy path lẫn edge case.

#### Bước 5: Báo cáo

- Liệt kê chính xác: file nào đã thay đổi, thay đổi gì.
- Nêu rõ: những gì chưa kiểm tra được, rủi ro còn lại.
- Nếu phát hiện tech debt hoặc issue khác → báo cáo riêng, KHÔNG tự sửa.

---

## 22. Quy tắc dành cho AI

### Trước khi bắt đầu

1. **ĐỌC tài liệu này**. Hiểu kiến trúc, convention, pattern trước khi viết code.
2. **ĐỌC code liên quan**. Mở file cần sửa VÀ các file phụ thuộc để hiểu context.
3. **KHÔNG suy đoán**. Nếu không chắc file nào tồn tại, cấu trúc gì đang dùng → kiểm tra codebase hoặc hỏi.

### Khi đọc code

- Hiểu MỤC ĐÍCH của function/component trước khi sửa.
- Đọc caller/consumer để hiểu cách function được dùng.
- Kiểm tra type definitions trong `types.ts` trước khi tạo type mới.
- Kiểm tra utility functions trong `utils.ts` trước khi viết lại logic tương tự.

### Khi chỉnh sửa

1. **Phạm vi tối thiểu**: chỉ sửa đúng những gì cần thiết. KHÔNG thay đổi code xung quanh.
2. **Bảo toàn logic nghiệp vụ**: hiểu rõ logic trước khi sửa. KHÔNG vô tình thay đổi behavior.
3. **Giữ nguyên comment/docstring**: KHÔNG xóa hoặc sửa comment không liên quan đến thay đổi.
4. **Giữ nguyên import order**: tuân theo thứ tự import hiện có trong file.
5. **Giữ nguyên formatting**: dùng cùng style (indent, quotes, trailing comma) với file hiện tại.

### Khi refactor

- CHỈ refactor khi được yêu cầu rõ ràng hoặc bắt buộc để hoàn thành task.
- Không trộn refactor với feature/fix. Tách thành bước riêng.
- Đảm bảo behavior giữ nguyên sau refactor.

### Khi tạo code mới

1. **Follow existing patterns**. Nhìn component/function tương tự đã có và làm theo.
2. **Đặt đúng vị trí**: component → `components/site/` hoặc `components/admin/`, logic → `lib/`.
3. **Đặt tên nhất quán** với convention hiện có.
4. **Server Component mặc định**. Chỉ thêm `"use client"` khi cần.
5. **Không tạo mock/placeholder data**. Code phải hoạt động với data thật.

### Những điều KHÔNG ĐƯỢC LÀM

| ❌ KHÔNG | ✅ THAY VÀO ĐÓ |
|---|---|
| Tự thêm dependency mới | Hỏi trước, giải thích lý do |
| Thay đổi database schema | Hỏi trước, trình bày impact |
| Tạo API endpoint mới ngoài convention | Đặt trong `/api/admin/` theo pattern hiện có |
| Sửa `middleware.ts` / `next.config.ts` mà không được yêu cầu | Đề xuất thay đổi, chờ phê duyệt |
| Dùng `any` type | Dùng `unknown` + type guard hoặc type assertion có lý do |
| Dùng `console.log` | Dùng `console.error` / `console.warn` nếu cần |
| Thêm comment giải thích code hiển nhiên | Chỉ comment "tại sao", không comment "cái gì" |
| Xóa/sửa code không liên quan đến task | Giữ nguyên, báo cáo nếu phát hiện issue |
| Tạo workaround cho bug | Phân tích root cause, sửa đúng chỗ |
| Hardcode URL, secret, chuỗi cấu hình | Dùng env var hoặc settings từ DB |

---

## 23. Lỗi phổ biến AI thường mắc

### 23.1. Import sai module vào sai context

```ts
// ❌ Import server module trong Client Component
"use client";
import { db } from "@/lib/db";         // Prisma chỉ chạy server-side
import { prisma } from "@/lib/prisma"; // Tương tự

// ✅ Client Component gọi API
"use client";
import { api } from "@/lib/admin-client";
const data = await api<Article>("/api/admin/articles/1");
```

### 23.2. Tạo type/interface trùng lặp

```ts
// ❌ Tạo type mới khi đã có trong types.ts
interface ArticleData {
  id: number;
  title: string;
  // ... duplicate
}

// ✅ Import từ types.ts
import type { Article } from "@/lib/types";
```

### 23.3. Bypass repository layer

```ts
// ❌ Gọi Prisma trực tiếp
const articles = await prisma.article.findMany({ where: { status: "published" } });

// ✅ Gọi qua db.*
const articles = await db.articles.list({ status: "published" });
```

### 23.4. Dùng useEffect để derive state

```ts
// ❌
const [fullName, setFullName] = useState("");
useEffect(() => { setFullName(`${first} ${last}`); }, [first, last]);

// ✅
const fullName = `${first} ${last}`;
```

### 23.5. Sửa file globals.css mà break layout hiện có

- `globals.css` có ~55KB CSS với nhiều selector liên quan nhau.
- Khi thêm CSS mới: thêm ở cuối file hoặc trong section phù hợp.
- KHÔNG sửa/xóa selector hiện có trừ khi chắc chắn không ảnh hưởng.
- Kiểm tra trực quan sau khi thay đổi CSS.

### 23.6. Quên revalidate sau mutation

```ts
// ❌
await db.articles.update(id, data);
return NextResponse.json(article);

// ✅
await db.articles.update(id, data);
revalidateSite(); // Xóa cache ISR
return NextResponse.json(article);
```

### 23.7. Trả error message tiếng Anh

```ts
// ❌
return NextResponse.json({ error: "Article not found" }, { status: 404 });

// ✅
return NextResponse.json({ error: "Bài viết không tồn tại" }, { status: 404 });
```

### 23.8. Tạo component mới khi đã có component tương tự

Trước khi tạo component mới, kiểm tra:
- `ArticleCard` — đã xử lý nhiều variant qua `className` prop.
- `SectionHead` — tiêu đề section có link + sub-categories.
- `Sidebar` — sidebar với latest, popular, ads.
- `Pagination` — phân trang.

### 23.9. Quên xử lý trường hợp dữ liệu rỗng

```tsx
// ❌ Crash khi data.epaper là null
<Image src={data.epaper.cover} alt={data.epaper.title} />

// ✅ Guard
{data.epaper && (
  <Image src={data.epaper.cover} alt={data.epaper.title} />
)}
```

### 23.10. Thay đổi URL pattern bài viết

URL format `/{slug}-{id}` đã được index bởi Google, có backlink. Thay đổi format này sẽ:
- Phá vỡ tất cả SEO ranking hiện có.
- Tạo 404 cho tất cả link đã chia sẻ.
- Yêu cầu redirect mapping phức tạp.

→ KHÔNG BAO GIỜ thay đổi URL pattern mà chưa được phê duyệt.

---

## 24. Checklist

### Trước khi hoàn thành task

- [ ] TypeScript compile: `npx tsc --noEmit` — zero errors
- [ ] Build thành công: `npm run build` — zero errors
- [ ] Không có `any` mới mà không có lý do
- [ ] Không có `console.log` trong production code
- [ ] Không có commented-out code
- [ ] Input từ user được validate/sanitize (server-side)
- [ ] Mọi `<img>` / `<Image>` có `alt` text
- [ ] Interactive elements accessible bằng keyboard
- [ ] Error states được xử lý (try/catch, fallback UI)
- [ ] Tuân theo pattern/convention hiện có

### Trước khi merge

- [ ] Tất cả items trong checklist trên ĐÃ pass
- [ ] Không thay đổi file ngoài phạm vi task
- [ ] Không thêm dependency mới mà chưa được phê duyệt
- [ ] Không thay đổi database schema mà chưa được phê duyệt
- [ ] Không thay đổi URL pattern
- [ ] `revalidateSite()` được gọi sau mỗi data mutation
- [ ] Biến môi trường mới (nếu có) đã thêm vào `.env.example`
- [ ] Commit message tuân theo convention

### Trước khi deploy production

- [ ] Tất cả items trong checklist merge ĐÃ pass
- [ ] `npm run build` thành công trên clean install (`rm -rf node_modules .next && npm ci && npm run build`)
- [ ] Kiểm tra trực quan trang chủ, trang bài viết, trang chuyên mục, trang admin
- [ ] Kiểm tra SEO: meta tags, OG tags, JSON-LD, sitemap, robots
- [ ] Kiểm tra responsive: mobile (360px), tablet (768px), desktop (1200px+)
- [ ] `DATABASE_URL` trỏ đúng production database
- [ ] `AUTH_SECRET` là chuỗi ngẫu nhiên đủ dài (≥ 32 ký tự)
- [ ] `ADMIN_PASSWORD` đã đổi khỏi giá trị mặc định
- [ ] `NEXT_PUBLIC_SITE_URL` trỏ đúng domain production

---

## Lệnh thường dùng (Quick Reference)

```bash
# Phát triển
npm run dev                          # Dev server → http://localhost:3000

# Database
npm run setup                        # Lần đầu: generate + push + seed
npm run db:push                      # Đẩy schema lên DB
npm run db:seed                      # Chạy seed data
npm run db:reset                     # Reset DB + seed lại
npm run db:studio                    # Prisma Studio GUI

# Kiểm tra
npx tsc --noEmit                     # Type check
npm run lint                         # Next.js ESLint
npm run build                        # Production build

# Production
npm run build && npm start           # Build + start production server
```
