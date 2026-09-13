import Image from "next/image";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import JsonLd from "@/components/site/JsonLd";
import Sidebar from "@/components/site/Sidebar";
import { db } from "@/lib/db";
import { getSidebarData } from "@/lib/queries";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { Category } from "@/lib/types";
import { categoryPath, formatDate } from "@/lib/utils";

export default async function EpaperView({ category, categories }: { category: Category; categories: Category[] }) {
  const [epapers, sidebar] = await Promise.all([db.epapers.all(), getSidebarData()]);
  const base = categoryPath(category, categories);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Trang chủ", path: "/" }, { name: category.name, path: base }])} />
      <Breadcrumbs items={[{ name: category.name, href: base }]} h1Index={0} />
      <div className="grid-section">
        <div>
          {epapers.length ? (
            <div className="epaper-list">
              {epapers.map((e) => (
                <article className="card" key={e.id}>
                  <a className="card__media" href={e.link} target="_blank" rel="noopener" title={e.title}>
                    <Image src={e.cover} alt={e.title} fill sizes="(max-width: 767px) 50vw, 212px" />
                  </a>
                  <div className="card__meta">
                    <time dateTime={e.publishedAt}>{formatDate(e.publishedAt)}</time>
                  </div>
                  <h2 className="card__title">
                    <a href={e.link} target="_blank" rel="noopener">
                      {e.title}
                    </a>
                  </h2>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty">Chưa có số tạp chí nào.</p>
          )}
        </div>
        <Sidebar latest={sidebar.latest} popular={sidebar.popular} ads={sidebar.ads} categories={categories} />
      </div>
    </>
  );
}
