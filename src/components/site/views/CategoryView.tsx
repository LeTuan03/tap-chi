import ArticleCard from "@/components/site/ArticleCard";
import Breadcrumbs, { type Crumb } from "@/components/site/Breadcrumbs";
import JsonLd from "@/components/site/JsonLd";
import Pagination from "@/components/site/Pagination";
import Sidebar from "@/components/site/Sidebar";
import { getCategoryPage, getSidebarData } from "@/lib/queries";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo";
import type { Category, SiteSettings } from "@/lib/types";
import { categoryPath } from "@/lib/utils";

interface Props {
  category: Category;
  categories: Category[];
  settings: SiteSettings;
  page: number;
}

export default async function CategoryView({ category, categories, settings, page }: Props) {
  const [paged, sidebar] = await Promise.all([getCategoryPage(category.slug, page), getSidebarData()]);
  const base = categoryPath(category, categories);
  const parent = category.parent ? categories.find((c) => c.slug === category.parent) : undefined;

  const crumbs: Crumb[] = [];
  if (parent) crumbs.push({ name: parent.name, href: categoryPath(parent) });
  crumbs.push({ name: category.name, href: base });

  const showCover = page === 1 && paged.items.length >= 4;
  const cover = showCover ? paged.items.slice(0, 4) : [];
  const list = showCover ? paged.items.slice(4) : paged.items;

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([{ name: "Trang chủ", path: "/" }, ...crumbs.map((c) => ({ name: c.name, path: c.href }))]), collectionPageJsonLd(category, categories, paged.items, settings)]} />
      <Breadcrumbs items={crumbs} h1Index={crumbs.length - 1} />
      {page > 1 && <p className="sr-only">Trang {page}</p>}
      <div className="grid-section">
        <div>
          {showCover && (
            <div className="cat-cover">
              <div className="cat-cover__side">
                {cover.slice(1).map((a) => (
                  <ArticleCard key={a.id} article={a} category={category} sizes="200px" showDesc={false} />
                ))}
              </div>
              <div className="cat-cover__lead">
                <ArticleCard article={cover[0]} category={category} heading="h2" sizes="(max-width: 767px) 100vw, 640px" priority descClamp={3} />
              </div>
            </div>
          )}
          {list.length > 0 ? (
            <div className="newsbreak">
              {list.map((a) => (
                <ArticleCard key={a.id} article={a} category={category} sizes="(max-width: 767px) 100vw, 420px" descClamp={5} />
              ))}
            </div>
          ) : (
            !showCover && <p className="empty">Chưa có bài viết trong chuyên mục này.</p>
          )}
          <Pagination page={paged.page} totalPages={paged.totalPages} hrefFor={(n) => (n <= 1 ? base : `${base}/trang/${n}`)} />
        </div>
        <Sidebar latest={sidebar.latest} popular={sidebar.popular} ads={sidebar.ads} categories={categories} />
      </div>
    </>
  );
}
