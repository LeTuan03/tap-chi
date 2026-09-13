import Link from "next/link";

export interface Crumb {
  name: string;
  href: string;
}

/**
 * Thanh điều hướng đầu trang chuyên mục / bài viết.
 * `h1Index`: vị trí mục dùng thẻ h1 (trang chuyên mục), bỏ trống khi trang đã có h1 riêng.
 */
export default function Breadcrumbs({ items, h1Index }: { items: Crumb[]; h1Index?: number }) {
  return (
    <div className="navigation">
      <ol className="breadcrumb" aria-label="Đường dẫn">
        {items.map((it, i) => {
          const link = <Link href={it.href}>{it.name}</Link>;
          return <li key={it.href}>{i === h1Index ? <h1>{link}</h1> : link}</li>;
        })}
      </ol>
    </div>
  );
}
