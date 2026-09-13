import Link from "next/link";

/** 404 cho các đường dẫn thuộc giao diện công khai (được render bên trong khung site) */
export default function SiteNotFound() {
  return (
    <div className="error-page">
      <p style={{ fontSize: 64, color: "#ddd", fontWeight: 700 }}>404</p>
      <h1>Trang bạn tìm không tồn tại hoặc đã bị xóa.</h1>
      <p style={{ marginTop: 10, color: "#666" }}>Bài viết có thể đã được gỡ hoặc đường dẫn không đúng. Hãy thử tìm kiếm hoặc quay về trang chủ.</p>
      <Link className="btn-home" href="/">
        Về trang chủ
      </Link>
    </div>
  );
}
