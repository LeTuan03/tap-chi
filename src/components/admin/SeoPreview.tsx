"use client";

interface Props {
  siteName: string;
  siteUrl: string;
  path: string;
  title: string;
  description: string;
}

function hint(len: number, min: number, max: number, label: string) {
  if (len === 0) return <div className="seo-hint seo-hint--warn">Chưa nhập {label}.</div>;
  if (len < min) return <div className="seo-hint seo-hint--warn">{label} hơi ngắn ({len} ký tự, nên từ {min}–{max}).</div>;
  if (len > max) return <div className="seo-hint seo-hint--warn">{label} quá dài ({len} ký tự, Google có thể cắt bớt sau {max}).</div>;
  return <div className="seo-hint seo-hint--ok">{label} tốt ({len} ký tự).</div>;
}

/** Xem trước kết quả tìm kiếm Google và gợi ý độ dài tiêu đề / mô tả */
export default function SeoPreview({ siteName, siteUrl, path, title, description }: Props) {
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const url = `${siteUrl.replace(/\/$/, "")}${path}`;
  return (
    <div>
      <div className="seo-preview">
        <div className="seo-preview__url">{url}</div>
        <div className="seo-preview__title">{fullTitle}</div>
        <div className="seo-preview__desc">{description || "Mô tả bài viết sẽ hiển thị ở đây."}</div>
      </div>
      {hint(title.length, 30, 65, "Tiêu đề")}
      {hint(description.length, 70, 160, "Mô tả")}
    </div>
  );
}
