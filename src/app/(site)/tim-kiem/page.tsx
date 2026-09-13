import type { Metadata } from "next";
import ArticleCard from "@/components/site/ArticleCard";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import Pagination from "@/components/site/Pagination";
import SearchForm from "@/components/site/SearchForm";
import Sidebar from "@/components/site/Sidebar";
import { getCategories, getSidebarData, searchArticles } from "@/lib/queries";

// Trang tìm kiếm phụ thuộc query string nên render động và không cho index
export const dynamic = "force-dynamic";

type Search = { q?: string; page?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<Search> }): Promise<Metadata> {
  const { q = "" } = await searchParams;
  return {
    title: q ? `Tìm kiếm: ${q}` : "Tìm kiếm",
    description: q ? `Kết quả tìm kiếm cho từ khóa "${q}"` : "Tìm kiếm bài viết trên Tạp chí Làng nghề Việt Nam",
    robots: { index: false, follow: true },
    // Trang noindex: không đặt canonical
    alternates: { canonical: null },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { q = "", page = "1" } = await searchParams;
  const query = q.trim().slice(0, 100);
  const [result, categories, sidebar] = await Promise.all([searchArticles(query, Number(page) || 1), getCategories(), getSidebarData()]);
  const hrefFor = (n: number) => `/tim-kiem?q=${encodeURIComponent(query)}${n > 1 ? `&page=${n}` : ""}`;

  return (
    <>
      <Breadcrumbs items={[{ name: "Tìm kiếm", href: "/tim-kiem" }]} h1Index={0} />
      <div className="grid-section">
        <div>
          <div className="search-hero">
            <p>
              {query ? (
                <>
                  Có <strong>{result.total}</strong> kết quả cho từ khóa <strong>“{query}”</strong>
                </>
              ) : (
                "Nhập từ khóa để tìm kiếm bài viết."
              )}
            </p>
            <SearchForm defaultValue={query} />
          </div>
          {result.items.length > 0 ? (
            <div className="newsbreak">
              {result.items.map((a) => (
                <ArticleCard key={a.id} article={a} categories={categories} sizes="(max-width: 767px) 100vw, 420px" descClamp={3} />
              ))}
            </div>
          ) : (
            query && <p className="empty">Không tìm thấy bài viết phù hợp.</p>
          )}
          <Pagination page={result.page} totalPages={result.totalPages} hrefFor={hrefFor} />
        </div>
        <Sidebar latest={sidebar.latest} popular={sidebar.popular} ads={sidebar.ads} categories={categories} />
      </div>
    </>
  );
}
