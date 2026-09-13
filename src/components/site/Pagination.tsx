import Link from "next/link";

interface Props {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}

export default function Pagination({ page, totalPages, hrefFor }: Props) {
  if (totalPages <= 1) return null;
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  return (
    <nav className="pagination" aria-label="Phân trang">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} rel="prev" aria-label="Trang trước">
          ‹
        </Link>
      )}
      {start > 1 && <Link href={hrefFor(1)}>1</Link>}
      {start > 2 && <span aria-hidden="true">…</span>}
      {pages.map((p) =>
        p === page ? (
          <span key={p} aria-current="page">
            {p}
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)}>
            {p}
          </Link>
        ),
      )}
      {end < totalPages - 1 && <span aria-hidden="true">…</span>}
      {end < totalPages && <Link href={hrefFor(totalPages)}>{totalPages}</Link>}
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} rel="next" aria-label="Trang sau">
          ›
        </Link>
      )}
    </nav>
  );
}
