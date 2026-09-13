# Tạp chí Làng nghề Việt Nam – bản clone tối ưu SEO

Website tin tức tái tạo giao diện của [langngheviet.com.vn](https://langngheviet.com.vn/) bằng **Next.js 15 (App Router)**, dữ liệu lưu **PostgreSQL** qua **Prisma**, kèm trang quản trị `/admin` dùng **Ant Design**.

## Công nghệ

| Thành phần | Lựa chọn |
| --- | --- |
| Framework | Next.js 15 (App Router, React 19, TypeScript) |
| CSDL | PostgreSQL + Prisma 6 |
| Giao diện công khai | CSS thuần (tái tạo theme gốc, responsive) |
| Trang quản trị | Ant Design 6, TipTap (soạn thảo), Upload ảnh |
| Font | Noto Sans (next/font, self-host, `display: swap`) |

## Chạy dự án

```bash
# 1. Cài đặt
npm install

# 2. Cấu hình môi trường
#    .env        -> DATABASE_URL (Prisma đọc file này)
#    .env.local  -> NEXT_PUBLIC_SITE_URL, ADMIN_PASSWORD, AUTH_SECRET
cp .env.example .env.local

# 3. Tạo bảng và nạp dữ liệu mẫu (106 bài viết, 24 chuyên mục lấy từ site gốc)
npm run setup        # = prisma generate + prisma db push + seed

# 4. Chạy
npm run dev          # http://localhost:3000
npm run build && npm start   # production
```

Trang quản trị: `http://localhost:3000/admin` – mật khẩu là `ADMIN_PASSWORD` trong `.env.local` (mặc định `admin123`).

Các lệnh khác: `npm run db:seed` (nạp lại dữ liệu mẫu), `npm run db:reset` (xóa và nạp lại), `npm run db:studio` (Prisma Studio).

## Cấu trúc thư mục

```
prisma/schema.prisma        Lược đồ CSDL (Category, Article, Epaper, Setting)
prisma/seed.mjs             Nạp dữ liệu mẫu từ data/*.json
data/                       Dữ liệu seed (JSON) – cào từ site gốc
src/app/(site)/             Giao diện công khai
  page.tsx                  Trang chủ
  [...path]/page.tsx        Chuyên mục, chuyên mục con, phân trang, bài viết (giữ URL gốc)
  tim-kiem/page.tsx         Tìm kiếm (noindex)
src/app/admin/              Trang quản trị (Ant Design)
src/app/api/admin/          API quản trị (auth, articles, categories, settings, upload, stats)
src/app/sitemap.ts          sitemap.xml (kèm ảnh)
src/app/news-sitemap.xml    Google News sitemap (bài 48h gần nhất)
src/app/rss.xml             RSS 2.0
src/app/robots.ts           robots.txt
src/app/manifest.ts         Web manifest
src/components/site/        Component giao diện công khai
src/components/admin/       Component trang quản trị
src/lib/db.ts               Lớp repository (Prisma) – nơi duy nhất truy cập CSDL
src/lib/queries.ts          Truy vấn cho giao diện (trang chủ, chuyên mục, liên quan…)
src/lib/seo.ts              Metadata + JSON-LD (Organization, WebSite, NewsArticle, Breadcrumb, CollectionPage)
src/lib/validate.ts         Kiểm tra & làm sạch dữ liệu nhập từ admin
src/middleware.ts           Bảo vệ /admin và /api/admin bằng cookie ký HMAC
```

## Cấu trúc URL (giữ nguyên site gốc)

| URL | Nội dung |
| --- | --- |
| `/` | Trang chủ |
| `/tin-tuc` | Chuyên mục |
| `/van-hoa-xa-hoi/van-hien-ha-thanh` | Chuyên mục con |
| `/tin-tuc/trang/2` | Phân trang |
| `/ten-bai-viet-37215.html` | Bài viết (slug sai sẽ 301 về slug đúng) |
| `/tim-kiem?q=...` | Tìm kiếm |

## Tối ưu SEO đã áp dụng

- **Render phía server + ISR** (`revalidate = 60`): HTML đầy đủ cho bot, tự làm mới khi có bài mới; admin lưu xong gọi `revalidatePath` để cập nhật ngay.
- **Metadata API**: title theo mẫu `%s | Tạp chí…`, meta description, canonical, Open Graph (article: published_time, author, section, tag), Twitter Card, robots (`max-image-preview:large`), hreflang `vi`, RSS alternate, Google Site Verification.
- **JSON-LD**: `NewsMediaOrganization`, `WebSite` (SearchAction), `BreadcrumbList`, `NewsArticle` (author, publisher, dateModified, wordCount), `CollectionPage` + `ItemList` cho chuyên mục.
- **HTML ngữ nghĩa**: đúng một `h1` mỗi trang (logo ở trang chủ, tiêu đề ở bài viết/chuyên mục), `h2` cho khối, `article`, `time datetime`, `nav aria-label`, `figure/figcaption`, skip-link.
- **Ảnh**: `next/image` (AVIF/WebP, `sizes` theo từng khối, `priority` cho ảnh LCP, giữ tỷ lệ tránh CLS), alt = tiêu đề bài, sitemap ảnh.
- **Hiệu năng**: font self-host `display: swap`, gần như không có JS phía client ngoài slider/tab nhỏ, CSS thuần, nén, header bảo mật.
- **Sitemap & feed**: `sitemap.xml`, `news-sitemap.xml`, `rss.xml`, `robots.txt` chặn `/admin`, `/api`, `/tim-kiem`.
- **URL chuẩn**: giữ cấu trúc gốc, 301 khi slug sai, `/trang-chu` → `/`, trang tìm kiếm `noindex`.
- **Liên kết nội bộ**: breadcrumb, tin liên quan (cùng chuyên mục, ưu tiên trùng tag), tag → trang tìm kiếm, tác giả.
- **Admin hỗ trợ SEO**: xem trước snippet Google, cảnh báo độ dài tiêu đề/mô tả, tự sinh slug và meta description, nhập alt khi chèn ảnh.
- **Responsive**: bố cục 1180px của site gốc được chuyển sang grid co giãn, dùng được trên di động (Google mobile-first).

## Trang quản trị

- **Tổng quan**: số bài, bản nháp, chuyên mục, lượt xem, bài cập nhật gần đây.
- **Bài viết**: tìm kiếm, lọc theo chuyên mục/trạng thái, thêm/sửa/xóa. Form soạn thảo gồm tiêu đề, slug, kicker, sa-pô, nội dung (TipTap: đậm/nghiêng/tiêu đề/danh sách/trích dẫn/liên kết/ảnh tải lên), chuyên mục, loại bài, tiêu điểm/nổi bật, tác giả, nguồn, ảnh đại diện, ảnh OG, meta description, tags, thời gian đăng (hẹn giờ được), lượt xem.
- **Chuyên mục**: 2 cấp, vị trí trên menu (chính / mở rộng / ẩn), thứ tự, mô tả SEO. Không xóa được chuyên mục đang có bài.
- **Cài đặt website**: tên, mô tả, từ khóa, logo, liên hệ & chân trang, mạng xã hội, Google Search Console/GTM, bố cục trang chủ (chuyên mục nào ở khối nào), thời tiết, banner quảng cáo cột phải.

Ảnh tải lên được lưu tại `public/uploads/YYYY/MM/`.

## Triển khai

- Cần Node.js 18.18+ và PostgreSQL. Đặt `NEXT_PUBLIC_SITE_URL` đúng domain thật (dùng cho canonical, sitemap, OG).
- Đổi `ADMIN_PASSWORD`, `AUTH_SECRET` trước khi đưa lên production.
- Chạy `npm run build` rồi `npm start` (hoặc PM2/Docker). Nếu triển khai serverless (Vercel), thư mục `public/uploads` không ghi được: thay `src/app/api/admin/upload/route.ts` bằng lưu trữ S3/Cloudinary.
- Ảnh bài viết mẫu vẫn trỏ về `langngheviet.com.vn` (đã khai báo trong `images.remotePatterns`). Bài viết mới nên dùng ảnh tải lên.

## Mở rộng

- Đổi CSDL: sửa `provider` trong `prisma/schema.prisma` và `DATABASE_URL`, chạy `npm run db:push`.
- Thêm trường cho bài viết: cập nhật `schema.prisma`, `src/lib/types.ts`, hàm chuyển đổi trong `src/lib/db.ts`, `validate.ts` và form admin.
- Nhiều tài khoản quản trị: thay `src/lib/auth.ts` bằng NextAuth/Auth.js, giữ nguyên `middleware.ts`.
- Ghi chú: TipTap chưa có node `figure`, nên khi mở bài cũ (có chú thích ảnh) trong admin và lưu lại, chú thích sẽ thành đoạn văn thường bên dưới ảnh.
- Ghi chú: với URL không tồn tại, Next.js trả mã 404 + `noindex` và render nội dung trang 404 ở phía client (hành vi chuẩn của `notFound()` lúc runtime); bot tìm kiếm chỉ cần mã 404 nên không ảnh hưởng SEO.
- Khi build, số worker được giới hạn (`experimental.cpus`) và `connection_limit` trong `DATABASE_URL` để không vượt `max_connections` của PostgreSQL. Máy nhiều CPU hơn có thể tăng `cpus` nếu DB cho phép.
