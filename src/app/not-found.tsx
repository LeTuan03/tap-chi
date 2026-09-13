import type { Metadata } from "next";
import Link from "next/link";
import SiteChrome from "@/components/site/SiteChrome";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <SiteChrome>
      <div className="error-page">
        <p style={{ fontSize: 64, color: "#ddd", fontWeight: 700 }}>404</p>
        <h1>Trang bạn tìm không tồn tại hoặc đã bị xóa.</h1>
        <Link className="btn-home" href="/">
          Về trang chủ
        </Link>
      </div>
    </SiteChrome>
  );
}
