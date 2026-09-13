import Link from "next/link";
import ArticleCard from "@/components/site/ArticleCard";
import Breadcrumbs, { type Crumb } from "@/components/site/Breadcrumbs";
import JsonLd from "@/components/site/JsonLd";
import SectionHead from "@/components/site/SectionHead";
import ShareButtons from "@/components/site/ShareButtons";
import Sidebar from "@/components/site/Sidebar";
import ViewBeacon from "@/components/site/ViewBeacon";
import { getRelatedArticles, getSidebarData } from "@/lib/queries";
import { breadcrumbJsonLd, newsArticleJsonLd, toAbs } from "@/lib/seo";
import type { Article, Category, SiteSettings } from "@/lib/types";
import { articlePath, categoryPath, formatDateTime } from "@/lib/utils";

interface Props {
  article: Article;
  categories: Category[];
  settings: SiteSettings;
}

export default async function ArticleView({ article: a, categories, settings }: Props) {
  const category = categories.find((c) => c.slug === a.category);
  const parent = category?.parent ? categories.find((c) => c.slug === category.parent) : undefined;
  const [related, sidebar] = await Promise.all([getRelatedArticles(a, 6), getSidebarData()]);
  const url = toAbs(articlePath(a));

  const crumbs: Crumb[] = [];
  if (parent) crumbs.push({ name: parent.name, href: categoryPath(parent) });
  if (category) crumbs.push({ name: category.name, href: categoryPath(category, categories) });

  const initials = a.author
    .split(/\s+/)
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([{ name: "Trang chủ", path: "/" }, ...crumbs.map((c) => ({ name: c.name, path: c.href })), { name: a.title, path: articlePath(a) }]), newsArticleJsonLd(a, category, settings)]} />
      <ViewBeacon id={a.id} />
      <Breadcrumbs items={crumbs} />
      <div className="grid-section">
        <div>
          <article className="article-detail">
            {a.subtitle && <span className="article-detail__kicker">{a.subtitle}</span>}
            <h1 className="article-detail__title">{a.title}</h1>
            <div className="article-detail__body">
              <ShareButtons url={url} title={a.title} />
              <div>
                <div className="author-box">
                  <span className="author-box__avatar" aria-hidden="true">
                    {initials || "BT"}
                  </span>
                  <span className="author-box__name" rel="author">
                    <Link href={`/tim-kiem?q=${encodeURIComponent(a.author)}`}>{a.author}</Link>
                  </span>
                  <Link className="author-box__more" href={`/tim-kiem?q=${encodeURIComponent(a.author)}`}>
                    Xem các bài viết của tác giả
                  </Link>
                </div>
                <div className="article-detail__meta">
                  <time dateTime={a.publishedAt}>{formatDateTime(a.publishedAt)}</time>
                  {category && (
                    <Link className="card__cat" href={categoryPath(category, categories)}>
                      {category.name}
                    </Link>
                  )}
                  {a.updatedAt && a.updatedAt.slice(0, 16) !== a.publishedAt.slice(0, 16) && (
                    <span>
                      Cập nhật: <time dateTime={a.updatedAt}>{formatDateTime(a.updatedAt)}</time>
                    </span>
                  )}
                  <a className="google-news" href="https://news.google.com/publications/CAAqBwgKMKiSzgsw2K3lAw?hl=vi&gl=VN&ceid=VN%3Avi" target="_blank" rel="noopener nofollow">
                    Theo dõi {settings.shortName} trên
                  </a>
                </div>
                {a.sapo && <p className="article-detail__sapo">{a.sapo}</p>}
                {/* Nội dung do biên tập viên nhập từ trang quản trị */}
                <div className="prose" dangerouslySetInnerHTML={{ __html: a.content }} />
                <p className="article-detail__author">{a.author}</p>
                {a.source && <p className="article-detail__source">{a.source}</p>}
                {a.tags.length > 0 && (
                  <div className="article-tags">
                    <span className="article-tags__label">Từ khóa:</span>
                    {a.tags.map((t) => (
                      <Link key={t} href={`/tim-kiem?q=${encodeURIComponent(t)}`} rel="tag">
                        {t}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>
          {related.length > 0 && (
            <section className="related" aria-label="Tin liên quan">
              <SectionHead title="Tin liên quan" />
              <div className="related__grid">
                {related.map((r) => (
                  <ArticleCard key={r.id} article={r} categories={categories} sizes="(max-width: 767px) 100vw, 270px" showDesc={false} />
                ))}
              </div>
            </section>
          )}
        </div>
        <Sidebar latest={sidebar.latest} popular={sidebar.popular} ads={sidebar.ads} categories={categories} />
      </div>
    </>
  );
}
