# CLAUDE.md — Coding Conventions & Development Guidelines

**Dự án:** Tạp chí Làng nghề Việt Nam (Next.js 15 + Prisma + PostgreSQL)
**Đối tượng áp dụng:** mọi lập trình viên và mọi AI agent làm việc trên repository này.
**Mức độ ràng buộc:** đây là tài liệu **bắt buộc**, không phải gợi ý.

---

## 0. ĐỌC TRƯỚC KHI LÀM (BẮT BUỘC)

AI **phải** hoàn thành 3 bước sau trước khi ghi bất kỳ dòng code nào:

1. **Đọc hết tài liệu này** (tối thiểu: §1 Nguyên tắc cốt lõi, §2 Kiến trúc, §19 Quy tắc AI, §20 Lỗi phổ biến, §21 Checklist).
2. **Đọc code thật liên quan đến task** — không suy đoán từ tên file. Tối thiểu phải đọc: file sẽ sửa, file gọi nó, type liên quan trong `src/lib/types.ts`, method liên quan trong `src/lib/db.ts`.
3. **Xác nhận phạm vi**: liệt kê ra (trong đầu hoặc trong phản hồi) danh sách file dự kiến chạm tới. Nếu danh sách vượt quá phạm vi yêu cầu → dừng và hỏi.

> **Quy tắc xung đột:** nếu code hiện tại mâu thuẫn với tài liệu này, **ưu tiên giữ nhất quán với code hiện tại trong phạm vi đang sửa**, đồng thời **báo cáo mâu thuẫn** cho người dùng. Không tự ý refactor code cũ cho "đúng chuẩn".

---

## 1. NGUYÊN TẮC CỐT LÕI (P0 – P8)

Đây là 9 nguyên tắc không được vi phạm. Mọi quy tắc chi tiết phía sau đều phục vụ chúng.

| ID | Nguyên tắc | Nghĩa cụ thể |
|---|---|---|
| **P0** | Hiểu trước khi sửa | Đọc code hiện tại, hiểu luồng dữ liệu, rồi mới thay đổi. |
| **P1** | Bảo toàn kiến trúc & nghiệp vụ | Không phá vỡ layer, không đổi luồng nghiệp vụ đang chạy đúng. |
| **P2** | Không tự ý thay đổi lớn | API contract, Prisma schema, dependency, cấu hình build, middleware → **phải xin phép**. |
| **P3** | Không mock, không placeholder | Task yêu cầu chức năng thật thì phải có chức năng thật. Không `TODO`, không dữ liệu giả, không hàm rỗng trả về giá trị cứng. |
| **P4** | Sửa tận gốc | Phân tích nguyên nhân gốc trước khi sửa. Không `try/catch` nuốt lỗi, không `any`, không `?.` rải rác để "hết lỗi". |
| **P5** | Thay đổi tối thiểu, có lý do | Mỗi thay đổi phải trả lời được: *tại sao cần?* và *phạm vi ảnh hưởng tới đâu?* Không refactor kèm theo. |
| **P6** | Thiếu thông tin thì hỏi | Không chắc chắn ≥ 80% → kiểm tra codebase; vẫn không rõ → đặt câu hỏi. Không đoán. |
| **P7** | Tự kiểm chứng | Chạy `tsc --noEmit`, `npm run build`, kiểm thử thủ công trước khi tuyên bố hoàn thành. |
| **P8** | Báo cáo trung thực | Nêu rõ: đã sửa gì, **chưa kiểm tra gì**, rủi ro còn lại. Không tuyên bố "đã test" nếu chưa chạy. |

---

## 2. KIẾN TRÚC DỰ ÁN & TỔ CHỨC THƯ MỤC

### 2.1. Mô hình phân lớp

```
┌─────────────────────────────────────────────────────────┐
│ Presentation   src/app/**  ·  src/components/**         │  UI, routing, metadata
├─────────────────────────────────────────────────────────┤
│ Application    src/lib/queries.ts · seo.ts · utils.ts   │  Query builder, format, SEO
│                src/lib/validate.ts · revalidate.ts      │  Validate, cache invalidation
├─────────────────────────────────────────────────────────┤
│ Data Access    src/lib/db.ts                            │  Repository duy nhất
├─────────────────────────────────────────────────────────┤
│ Infrastructure src/lib/prisma.ts · auth.ts · middleware │  Prisma client, HMAC, guard
└─────────────────────────────────────────────────────────┘
```

**Quy tắc phụ thuộc một chiều (ARCH-1):** lớp trên gọi lớp dưới, **không bao giờ ngược lại**.

- `components/**` **không được** `import { prisma }` hay `@prisma/client`.
- Chỉ `src/lib/db.ts` và `src/lib/prisma.ts` được biết tới Prisma.
- Component chỉ làm việc với app type (`Article`, `Category`, `SiteSettings` trong `src/lib/types.ts`).
- `src/lib/*` **không** import từ `src/components/*`.

### 2.2. Cấu trúc thư mục chuẩn

```
src/
  app/
    (site)/                 # Route group trang công khai
      [...path]/page.tsx    # Catch-all: chuyên mục + bài viết
      tim-kiem/page.tsx     # Tìm kiếm
      layout.tsx            # SiteChrome
      page.tsx              # Trang chủ
    admin/
      (dashboard)/          # Dashboard sau đăng nhập
      login/                # Đăng nhập
      layout.tsx            # AdminShell
      admin.css             # CSS riêng admin
    api/
      admin/                # API quản trị (yêu cầu auth)
      articles/             # API công khai (tăng lượt xem)
    globals.css             # CSS trang công khai (~55KB)
    layout.tsx  robots.ts  sitemap.ts  manifest.ts  not-found.tsx
    rss.xml/  news-sitemap.xml/
  components/
    site/                   # Component công khai
      views/                # View lớn: ArticleView, CategoryView...
    admin/                  # Component quản trị
  lib/
    admin-client.ts  auth.ts  db.ts  prisma.ts
    queries.ts  revalidate.ts  seo.ts  types.ts  utils.ts  validate.ts
  styles/
    tokens.css  base.css
  middleware.ts
prisma/
  schema.prisma  seed.mjs
```

### 2.3. Bảng "đặt file ở đâu" (ARCH-2)

| Cần thêm | Đặt ở | Tuyệt đối không |
|---|---|---|
| Truy vấn DB mới | Thêm method vào object `db` trong `src/lib/db.ts` | Tạo file repository mới, gọi prisma trong component |
| Type dùng chung | `src/lib/types.ts` | Khai báo lại type ở nhiều nơi |
| Hàm tiện ích thuần | `src/lib/utils.ts` | Copy-paste logic giữa các component |
| Logic validate input | `src/lib/validate.ts` | Validate rải rác trong route handler |
| Component trang công khai | `src/components/site/` | Đặt lẫn vào `admin/` |
| Component quản trị | `src/components/admin/` | Dùng antd ngoài `admin/` |
| CSS trang công khai | `src/app/globals.css` | Tailwind, CSS-in-JS, CSS Modules |
| CSS quản trị | `src/app/admin/admin.css` | Ghi đè global làm vỡ trang công khai |
| Token màu/spacing/font | `src/styles/tokens.css` | Hard-code màu hex trong component |
| Helper metadata/JSON-LD | `src/lib/seo.ts` | Viết JSON-LD inline trong page |

### 2.4. Quy tắc định tuyến (ARCH-3)

- **URL bài viết:** `/{slug}-{id}` — ví dụ `/lang-nghe-truyen-thong-42`.
- **URL chuyên mục:** `/{slug}` hoặc `/{parent-slug}/{slug}`.
- Route `[...path]` phân giải theo thứ tự hiện có trong `src/app/(site)/[...path]/page.tsx`. **Đọc file này trước khi thêm bất kỳ đường dẫn mới nào** — thêm sai thứ tự sẽ nuốt route của chuyên mục.
- Đường dẫn luôn sinh qua helper `articlePath()` / helper chuyên mục trong `src/lib/utils.ts`, **không nối chuỗi thủ công** trong component.
- Không tạo route mới trùng tiền tố với slug chuyên mục có thật (ví dụ tránh đặt `/tin-tuc` nếu đã có chuyên mục `tin-tuc`).

---

## 3. TYPESCRIPT CONVENTIONS

| ID | Quy tắc |
|---|---|
| **TS-1** | `strict: true` — giữ nguyên. Không tắt flag, không sửa `tsconfig.json` để code biên dịch được. |
| **TS-2** | **Cấm `any`.** Dùng `unknown` + thu hẹp kiểu. Trường hợp bắt buộc phải có comment `// any vì: <lý do cụ thể>` và nêu trong báo cáo. |
| **TS-3** | Cấm `@ts-ignore`, `@ts-expect-error`, `eslint-disable` để vượt qua lỗi. Lỗi type là tín hiệu thiết kế sai. |
| **TS-4** | Không dùng `enum`. Dùng union type + mảng `as const`. |
| **TS-5** | `type` cho union/alias; `interface` cho object shape. |
| **TS-6** | Không dùng `React.FC`. Khai báo props trực tiếp. |
| **TS-7** | Hàm export trong `src/lib/**` phải có **kiểu trả về tường minh**. |
| **TS-8** | Hạn chế `!` (non-null assertion). Dùng guard hoặc `notFound()`. |
| **TS-9** | Dữ liệu từ DB dùng `T \| null`; props tuỳ chọn dùng `?: T` (undefined). Không trộn lẫn hai cách. |
| **TS-10** | Dùng `satisfies` khi cần vừa kiểm kiểu vừa giữ literal type. |
| **TS-11** | Đặt tên: Component `PascalCase.tsx`, module `camelCase.ts`, type/interface `PascalCase`, hằng số `SCREAMING_SNAKE_CASE`, biến/hàm `camelCase`. Không viết tắt khó hiểu (`art`, `cat` → `article`, `category`). |
| **TS-12** | Dữ liệu ngày giờ: lưu `Date`, hiển thị qua `formatDate()` với `timeZone: "Asia/Ho_Chi_Minh"`. Không `toLocaleString()` trần trong component. |

```ts
// ✅ Đúng
type ArticleType = "article" | "photo" | "video";
const ARTICLE_TYPES = ["article", "photo", "video"] as const satisfies readonly ArticleType[];

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "compact";
}

function ArticleCard({ article, variant = "default" }: ArticleCardProps) { /* ... */ }

// ❌ Sai
enum ArticleType { Article, Photo, Video }
const ArticleCard: React.FC<any> = (props) => { /* ... */ };
```

---

## 4. REACT & NEXT.JS 15 CONVENTIONS

### 4.1. Server Component vs Client Component

| ID | Quy tắc |
|---|---|
| **RN-1** | **Mặc định là Server Component.** Chỉ thêm `"use client"` khi thật sự cần: state, effect, event handler, browser API, antd, TipTap. |
| **RN-2** | Đặt `"use client"` ở **lá gần nhất**, không đặt ở `page.tsx` / `layout.tsx` cha — một chỉ thị sai vị trí biến cả cây con thành client bundle. |
| **RN-3** | Không truyền function, `Date` object phức tạp, class instance qua ranh giới Server→Client. Chỉ truyền dữ liệu serialize được (đã format sẵn). |
| **RN-4** | Không bao giờ import `db.ts`, `auth.ts`, biến môi trường server trong file có `"use client"`. |
| **RN-5** | Tách theo mẫu: Server Component lấy dữ liệu → truyền props → Client Component chỉ lo tương tác. |

### 4.2. Bẫy đặc thù Next.js 15 (quan trọng)

| ID | Quy tắc |
|---|---|
| **RN-6** | `params` và `searchParams` là **Promise**. Bắt buộc `await`: `const { path } = await params;` — kể cả trong `generateMetadata()`. |
| **RN-7** | `cookies()`, `headers()`, `draftMode()` là **async**. Phải `await`. |
| **RN-8** | Dùng dynamic API (`cookies`, `headers`, `searchParams`) sẽ khiến route chuyển sang render động. Cân nhắc trước khi thêm vào trang công khai cần cache. |
| **RN-9** | Route handler: export named `GET`/`POST`/`PUT`/`DELETE`. Page/Layout: `export default`. |
| **RN-10** | `error.tsx` bắt buộc là Client Component và phải nhận `{ error, reset }`. |

### 4.3. Component & JSX

| ID | Quy tắc |
|---|---|
| **RN-11** | Điều hướng nội bộ dùng `next/link`. Không `<a href="/...">`, không `window.location` cho route nội bộ. |
| **RN-12** | Ảnh dùng `next/image` với `width`/`height` (hoặc `fill` + container có kích thước) và `sizes`. `priority` chỉ đặt cho ảnh LCP (ảnh lớn đầu trang). |
| **RN-13** | Không fetch dữ liệu khởi tạo bằng `useEffect` ở trang công khai — lấy trên server. |
| **RN-14** | `key` trong list phải là id ổn định, **không dùng index** nếu danh sách có thể thay đổi thứ tự. |
| **RN-15** | Không dùng `dangerouslySetInnerHTML` với dữ liệu chưa qua `sanitizeHtml()`. Chỉ áp dụng cho nội dung bài viết đã sanitize tại tầng validate. |
| **RN-16** | `useMemo`/`useCallback`/`memo` chỉ dùng khi có bằng chứng vấn đề hiệu năng, không dùng theo phản xạ. |
| **RN-17** | Dùng HTML ngữ nghĩa: `<article>`, `<nav>`, `<header>`, `<main>`, `<footer>`, `<section>`, `<time dateTime>`. |

---

## 5. COMPONENT DESIGN, TÁI SỬ DỤNG & SOLID

### 5.1. Áp dụng SOLID trong dự án này

| Nguyên tắc | Áp dụng cụ thể |
|---|---|
| **SRP** | Component chỉ *render* + giữ state UI cục bộ. Logic nghiệp vụ (tính toán, format, truy vấn) nằm ở `src/lib/**`. Nếu component có >1 lý do để thay đổi → tách. |
| **OCP** | Mở rộng bằng **props/variant**, không bằng cách copy component. `ArticleCard` có `variant`, không tạo `ArticleCardBig`, `ArticleCardSmall` trùng 90% code. |
| **LSP** | Các biến thể cùng một component phải có cùng hợp đồng props; không để `variant="compact"` bắt buộc props mà `default` không có. |
| **ISP** | Props tối thiểu cần thiết. Không nhận cả `SiteSettings` chỉ để đọc một trường. |
| **DIP** | Component phụ thuộc vào type trừu tượng của app (`Article`), **không** phụ thuộc Prisma model. Hàm fetch truyền vào từ tầng trên, không hard-code trong component con. |

### 5.2. Quy tắc thực hành

| ID | Quy tắc |
|---|---|
| **CD-1** | **Rule of three**: trùng lặp lần thứ 3 mới trừu tượng hoá. Trừu tượng hoá sớm tệ hơn lặp code. |
| **CD-2** | Component > ~250 dòng hoặc > 7 props → xem xét tách. Tách theo *trách nhiệm*, không theo số dòng máy móc. |
| **CD-3** | Prop drilling quá 2 cấp → dùng composition (`children`, slot props) trước khi nghĩ tới Context. |
| **CD-4** | Trước khi tạo component mới: **tìm trong `src/components/site/` và `admin/`** xem đã có component tương đương chưa. Ưu tiên mở rộng cái có sẵn. |
| **CD-5** | Mỗi component export **một** thành phần chính. Sub-component chỉ dùng nội bộ thì để cùng file, không export. |
| **CD-6** | Component phải xử lý đủ 3 trạng thái dữ liệu: **có dữ liệu / rỗng / lỗi**. Danh sách rỗng phải có UI rõ ràng, không render khoảng trắng. |
| **CD-7** | Không đặt giá trị mặc định nghiệp vụ trong component (ví dụ "nếu không có ảnh thì lấy ảnh X") nếu giá trị đó thuộc về cấu hình site — lấy từ `SiteSettings`. |

---

## 6. STATE, DATA FETCHING, CACHING & BẤT ĐỒNG BỘ

### 6.1. Quản lý state

| ID | Quy tắc |
|---|---|
| **ST-1** | **Server state** (bài viết, chuyên mục, cài đặt) = dữ liệu lấy trên server. Không nhân bản vào state client. |
| **ST-2** | **Client state** chỉ dùng `useState` / `useReducer` cục bộ. |
| **ST-3** | **Không thêm** Redux / Zustand / Jotai / SWR / TanStack Query. Cần global state → dùng React Context, và **phải xin phép trước**. |
| **ST-4** | Trạng thái lọc / phân trang / từ khoá tìm kiếm nằm trên **URL** (`searchParams`), không nằm trong state — để chia sẻ link và SEO hoạt động. |
| **ST-5** | Form admin dùng controlled input; state form cục bộ trong component form, không nâng lên cao hơn mức cần thiết. |

### 6.2. Data fetching

| ID | Quy tắc |
|---|---|
| **DF-1** | **Trang công khai**: gọi `db.*` trực tiếp trong Server Component. **Không** gọi `/api/*` từ trang công khai. |
| **DF-2** | **Trang quản trị**: gọi API `/api/admin/*` qua `api()` trong `src/lib/admin-client.ts`. Không `fetch()` trần rải rác. |
| **DF-3** | Truy vấn độc lập chạy song song bằng `Promise.all`. Không `await` tuần tự khi không có phụ thuộc. |
| **DF-4** | Danh sách bài viết dùng `summarySelect` (không kéo `content`). Chỉ lấy `content` ở trang chi tiết. |
| **DF-5** | Luôn có giới hạn số bản ghi (`take`). Không có truy vấn "lấy tất cả" trên bảng có thể lớn. |

### 6.3. Caching & revalidate

| ID | Quy tắc |
|---|---|
| **CA-1** | Trang công khai ưu tiên render tĩnh/ISR. Nếu đặt `export const revalidate = N`, ghi rõ lý do chọn N bằng comment. |
| **CA-2** | **Mọi mutation admin thành công (create/update/delete) phải gọi helper trong `src/lib/revalidate.ts`** cho các đường dẫn ảnh hưởng: trang chủ, trang chuyên mục (kể cả chuyên mục cũ khi bài đổi chuyên mục), trang bài viết, `sitemap.xml`, `rss.xml`. |
| **CA-3** | Khi bài viết **đổi slug hoặc đổi chuyên mục**, phải revalidate **cả đường dẫn cũ và mới**. Đây là lỗi hay bị bỏ sót nhất. |
| **CA-4** | Endpoint tăng lượt xem không được cache (`dynamic = "force-dynamic"` hoặc `cache: "no-store"`), và không được chặn render trang. |
| **CA-5** | Không dùng `revalidatePath("/", "layout")` kiểu "quét sạch" nếu chỉ cần revalidate một trang. |
| **CA-6** | Không thêm cơ chế cache tự chế (Map toàn cục, biến module) — vòng đời tiến trình serverless không đảm bảo. |

### 6.4. Xử lý bất đồng bộ

| ID | Quy tắc |
|---|---|
| **AS-1** | Mọi `async` gọi từ client phải xử lý đủ: **pending → success → error**. Nút submit phải bị vô hiệu hoá khi đang gửi (chống double-submit). |
| **AS-2** | Không "fire and forget". Mọi Promise phải được `await` hoặc `.catch()`. |
| **AS-3** | Tìm kiếm gõ-là-tìm phải chống race condition bằng `AbortController` (hoặc kiểm tra request id) và debounce. |
| **AS-4** | Không `try/catch` rỗng. Bắt lỗi thì phải: xử lý, hoặc log rồi ném lại, hoặc chuyển thành thông báo cho người dùng. |
| **AS-5** | Thao tác nhiều bước ghi DB phải nằm trong transaction (§8), không chuỗi `await` rời rạc dễ để lại dữ liệu nửa vời. |

---

## 7. API DESIGN

### 7.1. Quy ước chung

| ID | Quy tắc |
|---|---|
| **API-1** | API quản trị: `src/app/api/admin/**` (bắt buộc xác thực). API công khai: `src/app/api/**`. |
| **API-2** | Đường dẫn dùng danh từ số nhiều, kebab-case: `/api/admin/articles`, `/api/admin/articles/[id]`. |
| **API-3** | **Không thay đổi shape response của endpoint hiện có** khi chưa xin phép — `admin-client.ts` và UI phụ thuộc trực tiếp vào nó. |
| **API-4** | `GET` không bao giờ thay đổi dữ liệu. Mutation dùng `POST` / `PUT` / `PATCH` / `DELETE`. |
| **API-5** | Parse body an toàn: `await req.json()` phải nằm trong `try/catch` → JSON hỏng trả **400**. |
| **API-6** | Validate **trước** mọi thao tác ghi bằng `parseArticleInput` / `parseCategoryInput`. Không tin bất kỳ trường nào từ client (đặc biệt `id`, `status`, `slug`, `views`). |
| **API-7** | Endpoint danh sách mới dùng phân trang chuẩn: `?page=1&pageSize=20` (pageSize tối đa 100), trả `{ items, total, page, pageSize }`. Endpoint cũ giữ nguyên hợp đồng hiện tại. |
| **API-8** | Không trả về stack trace, câu lệnh SQL, hay message của Prisma ra client. |

### 7.2. Hợp đồng lỗi (giữ nguyên từ hệ thống hiện tại)

```ts
// Lỗi đơn
return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });

// Lỗi validate (nhiều lỗi)
return NextResponse.json({ errors: ["Tiêu đề không được để trống", "Slug đã tồn tại"] }, { status: 400 });
```

### 7.3. Bảng mã trạng thái bắt buộc

| Mã | Dùng khi |
|---|---|
| 200 | Thành công (GET/PUT/PATCH có body trả về) |
| 201 | Tạo mới thành công |
| 204 | Xoá thành công, không có body |
| 400 | Body sai định dạng / validate thất bại |
| 401 | Chưa đăng nhập hoặc session hết hạn |
| 403 | Đã đăng nhập nhưng không đủ quyền |
| 404 | Tài nguyên không tồn tại |
| 409 | Xung đột (slug trùng, xoá chuyên mục còn bài viết) |
| 429 | Vượt giới hạn tần suất (đăng nhập sai nhiều lần) |
| 500 | Lỗi không lường trước (đã log phía server) |

### 7.4. Khung chuẩn cho route handler mới

```ts
// src/app/api/admin/articles/route.ts
export async function POST(req: Request) {
  const session = await requireSession();           // 1. Xác thực (defense in depth)
  if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();                        // 2. Parse an toàn
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const parsed = parseArticleInput(body);           // 3. Validate + sanitize
  if (!parsed.ok) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  }

  try {
    const article = await db.articles.create(parsed.data);   // 4. Ghi qua db.*
    await revalidateArticle(article);                        // 5. Revalidate
    return NextResponse.json(article, { status: 201 });
  } catch (err) {
    console.error("[api/admin/articles] create failed", err); // 6. Log + lỗi chung
    return NextResponse.json({ error: "Không thể tạo bài viết" }, { status: 500 });
  }
}
```

> Nếu tên hàm thực tế trong repo khác (ví dụ `requireSession` mang tên khác trong `auth.ts`), **dùng tên thật trong code** — khung trên mô tả *thứ tự bắt buộc*, không phải tên API cố định.

---

## 8. DATABASE & PRISMA

| ID | Quy tắc |
|---|---|
| **DB-1** | Mọi truy vấn đi qua `db.*` trong `src/lib/db.ts`. Thêm truy vấn mới = thêm method vào object `db`, **không tạo file mới**. |
| **DB-2** | Chuyển đổi Prisma model → app type bằng `toArticle()` / `toCategory()` ngay trong `db.ts`. Không rò rỉ Prisma type ra ngoài. |
| **DB-3** | Luôn `select` tường minh các trường cần dùng. Hạn chế `include` lồng nhiều tầng. |
| **DB-4** | **Chống N+1**: không gọi `db.*` trong vòng lặp. Lấy theo lô (`where: { id: { in: ids } }`) hoặc `include` một lần. |
| **DB-5** | Nhiều thao tác ghi liên quan nhau → `prisma.$transaction`, đặt bên trong `db.ts`. |
| **DB-6** | Trường dùng trong `where` / `orderBy` thường xuyên (`slug`, `status`, `categoryId`, `publishedAt`) phải có index. Thêm index là thay đổi schema → xem DB-8. |
| **DB-7** | Không dùng raw SQL trừ khi được duyệt. Nếu bắt buộc: `$queryRaw` với tham số hoá, **không nối chuỗi**. |
| **DB-8** | **Sửa `prisma/schema.prisma` phải được cho phép rõ ràng.** Ưu tiên thay đổi cộng thêm (trường mới nullable hoặc có `@default`). Không đổi tên / xoá cột nếu chưa có kế hoạch chuyển dữ liệu. |
| **DB-9** | Thay đổi schema phải cập nhật đồng bộ: `types.ts` → mapper trong `db.ts` → `validate.ts` → form admin → `seed.mjs`. Thiếu một mắt xích = lỗi runtime. |
| **DB-10** | `db push` chỉ dùng cho môi trường phát triển. Với dữ liệu thật, đề xuất migration có kiểm soát và **hỏi trước khi chạy**. Không bao giờ tự chạy `db:reset` trên môi trường có dữ liệu thật. |
| **DB-11** | Giữ `connection_limit=5&pool_timeout=30` trong `DATABASE_URL` và `cpus: 6` trong `next.config.ts` — đã được đặt để tránh vượt `max_connections` khi build tĩnh. Không sửa nếu không hiểu hệ quả. |
| **DB-12** | Không xoá cứng dữ liệu nghiệp vụ khi có thể chuyển trạng thái (ví dụ `status`), trừ khi yêu cầu ghi rõ. |

---

## 9. VALIDATION & SANITIZE

| ID | Quy tắc |
|---|---|
| **VA-1** | Validate tại **biên hệ thống**: route handler, server action, form submit. Không validate rải rác ở tầng sâu. |
| **VA-2** | `src/lib/validate.ts` là nơi duy nhất chứa quy tắc validate bài viết / chuyên mục. |
| **VA-3** | Dùng whitelist: chỉ lấy các trường được phép từ body, **bỏ qua** trường lạ. |
| **VA-4** | HTML luôn qua `sanitizeHtml()` (loại `<script>`, thuộc tính `on*`, URL `javascript:`) **trước khi lưu DB**. |
| **VA-5** | Số từ client phải parse + chặn biên: `id` (số nguyên dương), `page`, `pageSize`. Giá trị sai → 400, không `NaN` đi tiếp. |
| **VA-6** | Slug: sinh bằng `slugify()`, giới hạn độ dài, kiểm tra trùng trước khi ghi (trả 409 nếu trùng). |
| **VA-7** | Thông báo lỗi validate viết **tiếng Việt**, nêu rõ trường sai và cách sửa. Không trả message kỹ thuật. |
| **VA-8** | Validate phía client chỉ để cải thiện trải nghiệm — **không bao giờ** thay thế validate phía server. |

---

## 10. AUTHENTICATION, AUTHORIZATION & BẢO MẬT

| ID | Quy tắc |
|---|---|
| **SEC-1** | `middleware.ts` chặn `/admin/*` và `/api/admin/*`. Nhưng **mỗi route handler admin vẫn phải tự kiểm tra session** (phòng thủ nhiều lớp). Không dựa duy nhất vào middleware. |
| **SEC-2** | Session token ký HMAC-SHA256 bằng Web Crypto (tương thích Edge Runtime). Cookie `httpOnly`, `sameSite: "lax"`, `secure` trong production, có thời hạn hết hạn. |
| **SEC-3** | So sánh mật khẩu và chữ ký phải **timing-safe**, không dùng `===` trên chuỗi bí mật. |
| **SEC-4** | Đăng nhập sai phải giới hạn tần suất (theo IP) và trả thông báo chung chung — không tiết lộ "sai mật khẩu" vs "không tồn tại". |
| **SEC-5** | Không bao giờ đặt secret vào biến `NEXT_PUBLIC_*` (bị bundle xuống client). |
| **SEC-6** | Không log mật khẩu, token, cookie, header `Authorization`. |
| **SEC-7** | Mọi thao tác thay đổi dữ liệu phải là POST/PUT/PATCH/DELETE. Với API admin, kiểm tra `Origin`/`Referer` cùng nguồn để chống CSRF (bổ sung cho `sameSite: lax`). |
| **SEC-8** | Đăng xuất phải xoá cookie phía server (set maxAge 0), không chỉ điều hướng. |
| **SEC-9** | Ảnh từ xa chỉ được phép qua `remotePatterns` đã cấu hình (`langngheviet.com.vn`, `api.mastercms.org`). Thêm domain mới = sửa `next.config.ts` = cần duyệt. |
| **SEC-10** | Giữ nguyên security headers hiện có: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `poweredByHeader: false`. Thêm CSP phải thử kỹ vì antd/TipTap dùng inline style. |
| **SEC-11** | Trang `/admin/*` và trang tìm kiếm phải `noindex` trong metadata/robots. |
| **SEC-12** | Không tự ý cài thư viện bảo mật mới (bcrypt, jose, next-auth…) — kiến trúc auth hiện tại là cố ý tối giản. |

---

## 11. XỬ LÝ LỖI, LOGGING & NGOẠI LỆ

### 11.1. Chiến lược lỗi

| ID | Quy tắc |
|---|---|
| **ER-1** | **Fail fast ở biên, degrade gracefully ở UI.** Dữ liệu sai bị chặn tại validate; UI luôn có trạng thái thay thế hợp lý. |
| **ER-2** | Server Component không tìm thấy tài nguyên → gọi `notFound()` (kích hoạt `not-found.tsx`). Không tự render "404" thủ công. |
| **ER-3** | Chỉ `try/catch` ở nơi **xử lý được** lỗi. Còn lại để lỗi nổi lên `error.tsx`. |
| **ER-4** | Lỗi mong đợi (validate, trùng slug, không quyền) → trả mã trạng thái tương ứng, không ném exception. |
| **ER-5** | Lỗi bất ngờ → log kèm ngữ cảnh phía server + trả message chung cho người dùng. |
| **ER-6** | Không nuốt lỗi bằng giá trị mặc định im lặng (ví dụ `catch { return [] }`) — làm vậy là che bug. |

### 11.2. Logging

| ID | Quy tắc |
|---|---|
| **LG-1** | **Không `console.log` trong code production.** Chỉ `console.error` (cần hành động) và `console.warn` (bất thường nhưng tự phục hồi). |
| **LG-2** | Định dạng: `console.error("[scope] mô tả ngắn", { id, ...context }, err)` — ví dụ scope `[api/admin/articles]`, `[db.articles.update]`. |
| **LG-3** | Log **id**, không log toàn bộ payload, không log dữ liệu cá nhân hay secret. |
| **LG-4** | Log ở tầng gần lỗi nhất, **log một lần** — không log lại ở mỗi tầng. |

### 11.3. Danh sách edge case bắt buộc kiểm tra

Với mỗi tính năng liên quan bài viết/chuyên mục, phải kiểm tra:

- Danh sách rỗng (chuyên mục chưa có bài).
- Bài viết không có ảnh đại diện / không có mô tả / không có chuyên mục.
- Tiêu đề rất dài, tiêu đề chứa ký tự đặc biệt, slug tiếng Việt có dấu.
- `id` không tồn tại, `id` không phải số, slug không khớp id.
- Bài `draft` bị truy cập trực tiếp bằng URL → không được hiển thị công khai.
- Bài đã xoá nhưng còn trong sitemap/RSS cache.
- Phân trang vượt quá số trang thực tế.
- Slug trùng khi tạo/sửa.
- Xoá chuyên mục còn bài viết con hoặc chuyên mục con.
- Múi giờ: bài hẹn giờ đăng, hiển thị ngày quanh nửa đêm.
- Mất kết nối DB khi build tĩnh.

---

## 12. PERFORMANCE

| ID | Quy tắc |
|---|---|
| **PF-1** | Truy vấn danh sách dùng `summarySelect` + `take`. Không kéo `content` vào trang danh sách. |
| **PF-2** | Truy vấn độc lập → `Promise.all`. |
| **PF-3** | Bundle client: antd và TipTap **chỉ** nằm trong admin. TipTap nên nạp động (`next/dynamic`, `ssr: false`). |
| **PF-4** | Ảnh: `next/image` với `sizes` đúng; định dạng `avif`/`webp` đã bật. `priority` chỉ cho ảnh LCP. |
| **PF-5** | Tránh hydration mismatch: không dùng `new Date()`, `Math.random()`, `window` trong render đầu; format ngày trên server với timezone cố định. |
| **PF-6** | Không import cả thư viện khi chỉ cần một hàm (ví dụ import từng plugin dayjs). |
| **PF-7** | Không thêm font, icon set, hay script bên thứ ba mới nếu không có yêu cầu rõ ràng. |
| **PF-8** | Cẩn trọng khi sửa `globals.css` (~55KB): thêm selector mới, hạn chế sửa selector chung đang được nhiều trang dùng. |

---

## 13. SEO

| ID | Quy tắc |
|---|---|
| **SEO-1** | Mỗi page công khai mới **bắt buộc** export `generateMetadata()` với: `title`, `description`, `alternates.canonical`, Open Graph (title/description/image/type), Twitter card. |
| **SEO-2** | JSON-LD sinh qua helper trong `src/lib/seo.ts` (Organization, WebSite, NewsArticle, BreadcrumbList, CollectionPage). Không viết JSON-LD thủ công trong page. |
| **SEO-3** | Trang cần index phải được thêm vào `sitemap.ts`; tin tức thêm vào `news-sitemap.xml`. |
| **SEO-4** | URL là hợp đồng công khai. **Không đổi cấu trúc URL** đang chạy; nếu buộc phải đổi → phải có redirect 301. |
| **SEO-5** | Mỗi trang đúng **một** thẻ `<h1>`; heading theo thứ bậc, không nhảy cấp để lấy cỡ chữ. |
| **SEO-6** | `og:image` phải là URL tuyệt đối dựng từ `NEXT_PUBLIC_SITE_URL`. |
| **SEO-7** | Trang tìm kiếm, trang lọc, `/admin/*` → `robots: { index: false }`. |
| **SEO-8** | Bài viết phải có `<time dateTime>` cho ngày đăng và ngày cập nhật khớp với JSON-LD. |

---

## 14. ACCESSIBILITY & RESPONSIVE UI

### 14.1. Accessibility (tối thiểu WCAG 2.1 AA)

| ID | Quy tắc |
|---|---|
| **A11Y-1** | Mọi `<img>` / `next/image` có `alt` mô tả nội dung. Ảnh trang trí → `alt=""`. |
| **A11Y-2** | Nút chỉ có icon → bắt buộc `aria-label` tiếng Việt. |
| **A11Y-3** | Mọi chức năng dùng được bằng bàn phím; thứ tự tab hợp lý; **không** `tabindex > 0`. |
| **A11Y-4** | Không xoá outline focus nếu không thay bằng chỉ báo focus rõ ràng hơn. |
| **A11Y-5** | Input phải có `<label>` liên kết (`htmlFor`/`id`); lỗi form liên kết bằng `aria-describedby` và có `aria-invalid`. |
| **A11Y-6** | Tương phản chữ/nền ≥ 4.5:1 (chữ lớn ≥ 3:1). |
| **A11Y-7** | Dùng `<button>` cho hành động, `<a>` cho điều hướng. Không gắn `onClick` lên `<div>`. |
| **A11Y-8** | Nội dung động quan trọng (thông báo lưu thành công/thất bại) dùng `aria-live="polite"`. |

### 14.2. Responsive

| ID | Quy tắc |
|---|---|
| **RS-1** | Mobile-first: viết style cho mobile trước, mở rộng bằng `min-width` media query. |
| **RS-2** | Breakpoint lấy từ `tokens.css`, không đặt số tuỳ tiện trong từng file. |
| **RS-3** | Không tràn ngang ở bề rộng 320px. Bảng dài phải cuộn trong container riêng. |
| **RS-4** | Vùng chạm tối thiểu 44×44px trên mobile. |
| **RS-5** | Kiểm tra tối thiểu 3 bề rộng: **360px, 768px, 1280px** — cho cả trang công khai và admin. |
| **RS-6** | Dùng CSS custom properties từ `tokens.css` cho màu/spacing/font. Inline style chỉ cho giá trị động thực sự (`style={{ width }}`). |

---

## 15. TESTING, DEBUGGING & KIỂM TRA CHẤT LƯỢNG

### 15.1. Hiện trạng và cổng chất lượng bắt buộc

Dự án **chưa có test framework** (cố ý, để giữ dependency tối thiểu). Vì vậy cổng chất lượng bắt buộc cho mọi thay đổi là:

```bash
npx tsc --noEmit     # 1. Không lỗi kiểu
npm run lint         # 2. Không lỗi lint mới
npm run build        # 3. Build thành công
# 4. Kiểm thử thủ công theo ma trận §15.2
```

Thêm Vitest / Playwright là **thay đổi dependency → phải xin phép** (P2). Nếu được duyệt, thứ tự ưu tiên viết test:
1. Hàm thuần trong `src/lib/utils.ts`, `validate.ts` (đặc biệt `slugify`, `sanitizeHtml`, parse input).
2. `src/lib/auth.ts` (ký/xác minh token).
3. Route handler API admin (happy path + 400 + 401).
4. E2E: đăng nhập → tạo bài → xem bài trên trang công khai.

### 15.2. Ma trận kiểm thử thủ công tối thiểu

| Loại thay đổi | Bắt buộc kiểm tra |
|---|---|
| Trang công khai | Trang chủ, 1 chuyên mục cha, 1 chuyên mục con, 1 bài viết, 404, tìm kiếm có/không kết quả |
| Component dùng chung | Mọi nơi đang dùng component đó (grep tên component trước khi sửa) |
| API admin | Happy path, thiếu trường, dữ liệu sai kiểu, chưa đăng nhập (401), id không tồn tại (404) |
| Bài viết / chuyên mục (CRUD) | Tạo → hiển thị công khai; sửa slug → URL cũ & mới; đổi chuyên mục; xoá → không còn trong danh sách, sitemap |
| Auth | Đăng nhập đúng/sai, truy cập `/admin` khi chưa đăng nhập, đăng xuất, cookie hết hạn |
| CSS | Mobile 360px + desktop 1280px, kiểm tra không vỡ trang khác dùng chung selector |
| SEO | View source: `<title>`, meta description, canonical, JSON-LD hợp lệ |

### 15.3. Quy trình debug (bắt buộc theo thứ tự)

1. **Tái hiện** lỗi — xác định đầu vào chính xác gây lỗi.
2. **Khoanh vùng** — xác định lỗi ở tầng nào: UI / fetch / API / validate / db / schema.
3. **Tìm nguyên nhân gốc** — đọc code liên quan, kiểm tra dữ liệu thật, đọc log.
4. **Sửa tại gốc** — không vá ở nơi triệu chứng xuất hiện.
5. **Xác minh** — tái hiện lại kịch bản lỗi; kiểm tra các luồng liên quan không bị hỏng.
6. **Báo cáo** — nguyên nhân gốc là gì, đã sửa ở đâu, còn rủi ro nào.

**Cấm tuyệt đối khi debug:** thêm `any`/`@ts-ignore` để hết lỗi biên dịch; thêm `?.`/`?? []` hàng loạt để hết lỗi runtime; bọc `try/catch` rỗng; comment code lỗi; `setTimeout` để "chờ dữ liệu"; đổi thứ tự render vô căn cứ.

---

## 16. GIT WORKFLOW, COMMIT & REVIEW

### 16.1. Nhánh

| Tiền tố | Dùng cho | Ví dụ |
|---|---|---|
| `feat/` | Tính năng mới | `feat/article-scheduling` |
| `fix/` | Sửa lỗi | `fix/category-404` |
| `refactor/` | Tái cấu trúc không đổi hành vi | `refactor/article-card-variants` |
| `perf/` | Tối ưu hiệu năng | `perf/home-queries-parallel` |
| `chore/` | Việc phụ trợ, cấu hình | `chore/update-env-example` |
| `docs/` | Tài liệu | `docs/coding-conventions` |
| `hotfix/` | Sửa gấp production | `hotfix/login-cookie-secure` |

Không commit trực tiếp lên `main`. Nhánh ngắn, sống dưới ~3 ngày, rebase từ `main` trước khi mở PR.

### 16.2. Commit — Conventional Commits

```
<type>(<scope>): <mô tả ngắn, thể mệnh lệnh, ≤ 72 ký tự>

<thân: TẠI SAO thay đổi, không mô tả lại diff>

Refs: #<issue>
```

- **type**: `feat` | `fix` | `refactor` | `perf` | `style` | `docs` | `chore` | `build` | `revert`
- **scope**: `site` | `admin` | `api` | `db` | `auth` | `seo` | `ui` | `config` | `deps`

```
✅ feat(admin): thêm bộ lọc trạng thái cho danh sách bài viết
✅ fix(api): trả 409 khi slug bài viết trùng thay vì 500
✅ perf(site): chạy song song truy vấn trang chủ bằng Promise.all

❌ update code
❌ fix bug
❌ feat: thêm filter + sửa CSS header + đổi schema      (gộp nhiều việc)
```

| ID | Quy tắc |
|---|---|
| **GIT-1** | Commit **nguyên tử**: một commit = một thay đổi logic. Refactor tách khỏi commit tính năng. |
| **GIT-2** | Không commit `.env`, `.env.local`, `node_modules`, file build, file sinh tự động, ảnh chụp màn hình rác. |
| **GIT-3** | Không commit code đã comment lại "để dành". Git đã là lịch sử. |
| **GIT-4** | Không `--force` lên nhánh chung. |
| **GIT-5** | Build/type-check phải xanh trước khi commit. |

### 16.3. Pull Request

Mô tả PR bắt buộc có 5 mục:

```markdown
## Mục tiêu
<vấn đề/ yêu cầu gì>

## Thay đổi
- <file/nhóm file>: <thay đổi gì, vì sao>

## Cách kiểm thử
1. <bước tái hiện/ kiểm chứng>

## Rủi ro & phạm vi ảnh hưởng
<trang/ chức năng nào có thể bị ảnh hưởng>

## Chưa kiểm tra
<những gì chưa chạy được, lý do>
```

**Checklist người review:**
- [ ] Phạm vi thay đổi khớp với mô tả, không có thay đổi lạ.
- [ ] Không vi phạm ranh giới layer (§2.1).
- [ ] Input từ người dùng được validate/sanitize.
- [ ] Mutation có revalidate tương ứng.
- [ ] Không `any`, không `console.log`, không dependency mới.
- [ ] Có xử lý trạng thái rỗng/lỗi.
- [ ] Ảnh có `alt`, nút icon có `aria-label`.
- [ ] Không làm hỏng URL/SEO hiện có.

PR > ~400 dòng thay đổi (không tính file sinh tự động) nên được tách nhỏ.

---

## 17. ENVIRONMENT VARIABLES, SECRETS & CẤU HÌNH

| Biến | Phạm vi | Bắt buộc | Mô tả |
|---|---|---|---|
| `DATABASE_URL` | Server | ✅ | Chuỗi kết nối PostgreSQL. Nên có `connection_limit=5&pool_timeout=30`. |
| `NEXT_PUBLIC_SITE_URL` | Client + Server | ✅ | URL gốc website — dùng cho canonical, sitemap, OG. Không có dấu `/` ở cuối. |
| `ADMIN_PASSWORD` | Server | ✅ | Mật khẩu đăng nhập quản trị. |
| `AUTH_SECRET` | Server | ✅ | Khoá bí mật ký HMAC cho cookie session. Chuỗi ngẫu nhiên ≥ 32 ký tự. |

| ID | Quy tắc |
|---|---|
| **ENV-1** | Thêm biến mới → **bắt buộc** cập nhật `.env.example` (giá trị mẫu, không phải giá trị thật) và bảng trên. |
| **ENV-2** | Không commit `.env` / `.env.local`. Secret rò rỉ phải được xoay vòng ngay. |
| **ENV-3** | **Không** đặt secret vào `NEXT_PUBLIC_*`. Đặt tên biến nhạy cảm không bao giờ có tiền tố này. |
| **ENV-4** | Đọc biến môi trường ở một chỗ gần nơi khởi tạo (`prisma.ts`, `auth.ts`), không `process.env.X` rải rác khắp code. |
| **ENV-5** | Thiếu biến bắt buộc ở production phải **fail fast** khi khởi động, kèm thông báo rõ ràng — không im lặng dùng giá trị mặc định. |
| **ENV-6** | Sửa `next.config.ts`, `middleware.ts`, `tsconfig.json`, script trong `package.json`, file CI/CD → **cần được duyệt trước**. |
| **ENV-7** | AI **không được** đọc, sửa, hay in nội dung file `.env` thật. |

---

## 18. QUY TRÌNH PHÁT TRIỂN TÍNH NĂNG (END-TO-END)

| Bước | Việc phải làm | Kết quả bàn giao |
|---|---|---|
| **1. Làm rõ yêu cầu** | Xác định: ai dùng, luồng thao tác, dữ liệu vào/ra, tiêu chí hoàn thành, phạm vi *không* làm. Chưa chắc chắn → hỏi (tối đa 3 câu hỏi trọng tâm). | Mô tả yêu cầu 3–5 dòng được xác nhận |
| **2. Khảo sát codebase** | Đọc file liên quan, tìm pattern tương tự đã có, xác định điểm tái sử dụng. | Danh sách file đã đọc + pattern sẽ theo |
| **3. Thiết kế** | Xác định: thay đổi type? thay đổi `db.*`? thay đổi API? component mới hay mở rộng? ảnh hưởng SEO/cache? | Kế hoạch: danh sách file sẽ sửa + lý do từng file |
| **4. Cổng xin phép** | Nếu chạm: Prisma schema, API contract, dependency, `next.config.ts`, `middleware.ts`, cấu trúc URL → **dừng và xin xác nhận**. | Xác nhận của người dùng |
| **5. Triển khai** | Theo thứ tự: `types.ts` → `db.ts` → `validate.ts` → API route → component → CSS → SEO → revalidate. | Code chạy được, không mock |
| **6. Tự kiểm** | `tsc --noEmit`, `npm run lint`, `npm run build`, ma trận kiểm thử §15.2, rà checklist §21.1. | Kết quả từng lệnh |
| **7. Báo cáo** | Theo mẫu §19.4: đã sửa gì / chưa kiểm tra gì / rủi ro gì. | Báo cáo trung thực |

---

## 19. QUY TẮC SỬ DỤNG AI

### 19.1. Khi ĐỌC code

- Đọc **trọn vẹn** file sẽ sửa trước khi sửa — không dựa vào một đoạn grep.
- Truy vết luồng dữ liệu đầy đủ: `page.tsx` → `db.*` → mapper → component.
- Trước khi sửa một component dùng chung, **tìm tất cả nơi đang dùng nó**.
- Không suy đoán chữ ký hàm, tên trường DB, hay method của `db.*` — mở file ra kiểm tra.

### 19.2. Khi SỬA code

| ID | Quy tắc |
|---|---|
| **AI-1** | Diff tối thiểu. Không đổi định dạng, không sắp xếp lại import, không đổi tên biến ngoài phạm vi task. |
| **AI-2** | Giữ nguyên comment hiện có trừ khi chúng trở nên sai. |
| **AI-3** | Bám theo pattern của file/thư mục đang sửa, kể cả khi cá nhân thấy có cách "đẹp hơn". |
| **AI-4** | Không xoá code không hiểu. Nếu nghi ngờ code thừa → hỏi, không tự xoá. |
| **AI-5** | Không đổi tên hàm/biến được export, không đổi shape response API, không đổi props công khai của component dùng chung. |
| **AI-6** | Không sửa file ngoài danh sách đã thống nhất ở bước 3 §18. Phát sinh thêm → báo trước. |

### 19.3. Khi REFACTOR & khi TẠO MỚI

- **Refactor chỉ khi được yêu cầu.** Refactor phải bảo toàn hành vi 100% và đi trong commit/PR riêng.
- Không "dọn dẹp tiện tay" khi đang sửa bug — đó là nguồn gốc của regression.
- **Tạo file mới**: lấy file cùng loại gần nhất làm khuôn mẫu (cùng cách đặt tên, cùng cách export, cùng thứ tự khai báo). Kiểm tra đã có component/hàm tương đương chưa (CD-4, ARCH-2).
- Không tạo lớp trừu tượng "cho tương lai". Chỉ giải quyết yêu cầu hiện tại.

### 19.4. CẤM TUYỆT ĐỐI

1. Mock data, dữ liệu giả, hàm trả giá trị cứng khi task yêu cầu chức năng thật.
2. `TODO`, `FIXME`, hàm rỗng, "phần này triển khai sau" trong code bàn giao.
3. Thêm/gỡ/nâng cấp dependency khi chưa được duyệt.
4. Sửa `prisma/schema.prisma`, `next.config.ts`, `middleware.ts`, `tsconfig.json`, CI/CD khi chưa được duyệt.
5. `any`, `@ts-ignore`, `eslint-disable` để vượt qua lỗi.
6. `console.log` còn sót trong code bàn giao.
7. Bịa tên method/API của thư viện hoặc của chính dự án.
8. Tuyên bố "đã kiểm tra/đã chạy" khi chưa thực sự chạy.
9. Chạy lệnh phá huỷ dữ liệu (`db:reset`, `db push --force-reset`, `DROP`) mà không xin phép.
10. Đọc/ghi/in nội dung file `.env` thật.

### 19.5. Mẫu báo cáo khi hoàn thành (bắt buộc)

```markdown
## Đã thay đổi
- `src/lib/db.ts`: thêm `db.articles.findByCategorySlug()` — lý do: ...
- `src/app/(site)/[...path]/page.tsx`: dùng query mới, thêm xử lý danh sách rỗng.

## Đã kiểm tra
- `npx tsc --noEmit` → không lỗi
- `npm run build` → thành công
- Thủ công: trang chủ, chuyên mục `lang-nghe`, bài viết id 42, 404

## CHƯA kiểm tra
- Chưa test trên dữ liệu thật > 1000 bài (chỉ có dữ liệu seed)
- Chưa kiểm tra hiển thị trên Safari iOS

## Rủi ro còn lại
- Truy vấn mới chưa có index trên `categoryId` → có thể chậm khi dữ liệu lớn. Đề xuất thêm index (cần duyệt vì sửa schema).

## Câu hỏi / Đề xuất
- ...
```

---

## 20. LỖI PHỔ BIẾN CỦA AI & CÁCH PHÒNG TRÁNH

| # | Lỗi | Hậu quả | Cách phòng tránh |
|---|---|---|---|
| 1 | Sửa ở nơi lỗi *hiện ra* thay vì nơi lỗi *phát sinh* | Bug quay lại dạng khác | Theo §15.3, tìm nguyên nhân gốc trước |
| 2 | Tạo file/hàm mới trong khi đã có sẵn | Trùng lặp logic, lệch hành vi | Tìm kiếm trước khi tạo (ARCH-2, CD-4) |
| 3 | Tự thêm thư viện để giải quyết nhanh | Phình bundle, vi phạm chủ trương dự án | P2 — xin phép; ưu tiên giải pháp bằng code có sẵn |
| 4 | Sửa selector chung trong `globals.css` | Vỡ giao diện nhiều trang khác | Thêm class mới thay vì sửa selector dùng chung (PF-8) |
| 5 | Quên `await params` / `await searchParams` (Next 15) | Runtime error hoặc dữ liệu `undefined` | RN-6 |
| 6 | Thêm `"use client"` lên page/layout cha | Mất SSR, bundle phình, SEO giảm | RN-2 |
| 7 | Import `prisma` ngoài `db.ts` | Vỡ kiến trúc, rò rỉ Prisma type | ARCH-1, DB-1 |
| 8 | Trả thẳng Prisma model ra component | Component phụ thuộc schema, lộ trường nhạy cảm | DB-2 — luôn qua `toArticle()`/`toCategory()` |
| 9 | Quên revalidate sau mutation | Admin sửa xong, trang công khai vẫn dữ liệu cũ | CA-2, CA-3 |
| 10 | Quên revalidate đường dẫn **cũ** khi đổi slug/chuyên mục | Tồn tại URL chết hoặc nội dung cũ | CA-3 |
| 11 | Bỏ qua validate/sanitize vì "dữ liệu từ admin nên tin được" | XSS, dữ liệu hỏng | VA-1, VA-4 |
| 12 | `dangerouslySetInnerHTML` với dữ liệu chưa sanitize | XSS | RN-15 |
| 13 | Dùng `any`/`@ts-ignore` để qua `tsc` | Ẩn bug sang runtime | TS-2, TS-3 |
| 14 | Bịa method `db.*` hoặc field Prisma không tồn tại | Build fail hoặc lỗi runtime | Mở `db.ts` / `schema.prisma` đọc trước |
| 15 | Format ngày ở client / `new Date()` khi render | Hydration mismatch, sai múi giờ | TS-12, PF-5 |
| 16 | Gọi `db.*` trong vòng lặp | N+1, chậm và cạn connection pool | DB-4 |
| 17 | Truy vấn không `take`, không phân trang | Sập khi dữ liệu lớn | DF-5, API-7 |
| 18 | Đổi shape response API "cho gọn" | Vỡ admin UI đang gọi | API-3 |
| 19 | Xoá/đổi tên cột DB thay vì thêm mới | Mất dữ liệu | DB-8 |
| 20 | Bỏ sót trạng thái rỗng/lỗi trong UI | Màn hình trắng, người dùng bối rối | CD-6 |
| 21 | Còn sót `console.log`, mock data, `TODO` | Rò rỉ thông tin, chức năng giả | LG-1, P3, checklist §21.1 |
| 22 | Refactor ngoài phạm vi khi đang fix bug | PR khó review, regression | P5, AI-1 |
| 23 | Báo cáo "đã test xong" khi chưa chạy lệnh nào | Mất niềm tin, lỗi lọt production | P8, §19.5 |
| 24 | Tự ý sửa `.env` / cấu hình build | Hỏng môi trường, lộ secret | ENV-6, ENV-7 |
| 25 | Đoán yêu cầu khi mô tả mơ hồ rồi làm nguyên một tính năng sai | Mất thời gian cả hai bên | P6 — hỏi trước, tối đa 3 câu |

---

## 21. CHECKLIST

### 21.1. Trước khi tuyên bố hoàn thành task

- [ ] Yêu cầu đã được đáp ứng **đầy đủ**, không phần nào bị bỏ lửng.
- [ ] Không có mock data / placeholder / `TODO` / hàm rỗng.
- [ ] `npx tsc --noEmit` không lỗi.
- [ ] `npm run lint` không lỗi mới.
- [ ] `npm run build` thành công.
- [ ] Không có `any` mới không có lý do ghi chú.
- [ ] Không có `console.log`.
- [ ] Input người dùng được validate + sanitize.
- [ ] Mutation có revalidate đúng đường dẫn (kể cả đường dẫn cũ).
- [ ] Đã xử lý trạng thái rỗng, lỗi, và các edge case ở §11.3 liên quan.
- [ ] Ảnh có `alt`; nút icon có `aria-label`; thao tác được bằng bàn phím.
- [ ] Trang mới có `generateMetadata()` + JSON-LD + cập nhật `sitemap.ts`.
- [ ] Kiểm tra giao diện ở 360px và 1280px.
- [ ] Biến môi trường mới đã thêm vào `.env.example` và bảng §17.
- [ ] Không sửa file ngoài phạm vi đã thống nhất.
- [ ] Đã viết báo cáo theo mẫu §19.5 (gồm mục **CHƯA kiểm tra** và **Rủi ro**).

### 21.2. Trước khi merge

- [ ] Nhánh đã rebase từ `main`, không còn conflict.
- [ ] Commit theo Conventional Commits, nguyên tử, không có commit rác.
- [ ] Mô tả PR đủ 5 mục (§16.3).
- [ ] Đã tự review toàn bộ diff, không có thay đổi ngoài ý muốn.
- [ ] Không có file `.env`, file build, file tạm trong diff.
- [ ] Không có thay đổi schema/dependency/cấu hình chưa được duyệt.
- [ ] Reviewer đã duyệt checklist §16.3.

### 21.3. Trước khi deploy production

- [ ] `npm run build` sạch trên nhánh sẽ deploy.
- [ ] Biến môi trường production đã có đủ 4 biến bắt buộc, `AUTH_SECRET` đủ mạnh.
- [ ] `NEXT_PUBLIC_SITE_URL` trỏ đúng domain production, không có `/` cuối.
- [ ] `DATABASE_URL` có `connection_limit` phù hợp; đã **sao lưu database** nếu có thay đổi schema.
- [ ] Thay đổi schema đã được áp dụng theo kế hoạch migration đã duyệt (không dùng `db:reset`).
- [ ] Kiểm tra sau deploy: trang chủ, 1 chuyên mục, 1 bài viết, `/sitemap.xml`, `/rss.xml`, `/robots.txt`, đăng nhập admin.
- [ ] Kiểm tra `/admin` yêu cầu đăng nhập; cookie có cờ `secure`.
- [ ] Có **kế hoạch rollback**: commit/deployment trước đó để quay lại, và cách hoàn tác thay đổi dữ liệu (nếu có).
- [ ] Theo dõi log lỗi trong 15–30 phút đầu sau deploy.

---

## 22. PHỤ LỤC

### A. Lệnh thường dùng

```bash
# Phát triển
npm run dev              # http://localhost:3000

# Database
npm run setup            # prisma generate + db push + seed (lần đầu)
npm run db:push          # Đẩy schema lên database
npm run db:seed          # Seed dữ liệu mẫu
npm run db:reset         # ⚠️ XOÁ SẠCH + seed lại — KHÔNG chạy trên dữ liệu thật
npm run db:studio        # Prisma Studio

# Build & kiểm tra
npx tsc --noEmit         # Kiểm tra kiểu
npm run lint             # Lint
npm run build            # prisma generate + next build
npm start                # Chạy production server
```

### B. Tra cứu nhanh — "muốn làm X thì sửa ở đâu"

| Muốn | Sửa |
|---|---|
| Thêm truy vấn DB | `src/lib/db.ts` (thêm method vào `db`) |
| Thêm trường cho bài viết | `schema.prisma` (⚠️ cần duyệt) → `types.ts` → `db.ts` mapper → `validate.ts` → form admin → `seed.mjs` |
| Đổi cách hiển thị thẻ bài viết | `src/components/site/ArticleCard.tsx` (+ mọi nơi dùng nó) |
| Thêm trang công khai mới | `src/app/(site)/<route>/page.tsx` + `generateMetadata()` + `sitemap.ts` |
| Thêm API admin | `src/app/api/admin/<resource>/route.ts` + hàm gọi trong `admin-client.ts` |
| Đổi quy tắc validate | `src/lib/validate.ts` |
| Đổi metadata / JSON-LD | `src/lib/seo.ts` |
| Đổi màu, spacing, font | `src/styles/tokens.css` |
| Thêm CSS trang công khai | `src/app/globals.css` (thêm class mới) |
| Thêm CSS admin | `src/app/admin/admin.css` |
| Đổi cách xác thực | `src/lib/auth.ts` + `src/middleware.ts` (⚠️ cần duyệt) |
| Làm mới cache sau khi sửa dữ liệu | `src/lib/revalidate.ts` |

### C. Thay đổi so với tài liệu cũ (tóm tắt quyết định)

**Giữ lại (đã hợp lý, được viết lại chặt hơn):** mô hình thư mục và tech stack; chủ trương dependency tối thiểu (không Tailwind/Redux/SWR); quy ước đặt tên; cấm `enum`, cấm `React.FC`; Server Component mặc định; mọi truy vấn qua `db.*`; validate + `sanitizeHtml`; auth HMAC + cookie httpOnly; security headers; quy ước SEO và URL; ràng buộc connection pool / `cpus: 6`; locale tiếng Việt + `Asia/Ho_Chi_Minh`.

**Đã loại bỏ hoặc chỉnh lại:**
- *"Không refactor code không liên quan"* bị mâu thuẫn ngầm với các mục khuyến khích dọn dẹp → nâng thành nguyên tắc cứng **P5** và quy tắc **AI-1/19.3**.
- Checklist cũ nêu *"không sửa file CI/CD mà chưa được đồng ý"* rời rạc → gom vào **ENV-6** cùng toàn bộ nhóm file cấu hình nhạy cảm.
- Mục *"Không có test framework"* mang tính mô tả, không dùng được → thay bằng **§15** với cổng chất lượng bắt buộc, ma trận kiểm thử thủ công và lộ trình test khi được duyệt.
- Quy tắc logging cũ chỉ có một dòng → thay bằng **§11.2** có định dạng, phạm vi và cấm log secret.

**Đã bổ sung (thiếu hoàn toàn trong bản cũ):** quy tắc phụ thuộc giữa các lớp; bẫy `await params`/`cookies()` của Next 15; SOLID áp dụng cụ thể; quản lý state & URL-as-state; caching/revalidate (đặc biệt revalidate đường dẫn cũ khi đổi slug); bảng mã trạng thái + khung route handler chuẩn; phân trang; chống N+1 và chính sách migration; phòng thủ nhiều lớp cho auth, rate limit đăng nhập, CSRF; chiến lược lỗi + danh sách edge case; performance; accessibility + responsive; debug theo quy trình; Git/commit/PR; quản lý biến môi trường; quy trình phát triển tính năng 7 bước; toàn bộ **§19 quy tắc AI**, **§20 bảng 25 lỗi phổ biến** và **§21 ba checklist**.
