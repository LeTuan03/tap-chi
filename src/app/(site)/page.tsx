import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ArticleCard from "@/components/site/ArticleCard";
import CoverSlider from "@/components/site/CoverSlider";
import JsonLd from "@/components/site/JsonLd";
import SectionHead from "@/components/site/SectionHead";
import Sidebar from "@/components/site/Sidebar";
import SpotlightSlider from "@/components/site/SpotlightSlider";
import { db } from "@/lib/db";
import { getCategories, getHomeData } from "@/lib/queries";
import { itemListJsonLd, toAbs } from "@/lib/seo";
import { categoryPath } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await db.settings.get();
  return {
    title: { absolute: `${s.siteName} - Tin tức làng nghề, nghệ nhân, OCOP, nông thôn mới` },
    description: s.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      siteName: s.siteName,
      locale: "vi_VN",
      title: s.siteName,
      description: s.description,
      images: [{ url: toAbs(s.ogImage), width: 1200, height: 630, alt: s.siteName }],
    },
  };
}

export default async function HomePage() {
  const [data, categories, settings] = await Promise.all([getHomeData(), getCategories(), db.settings.get()]);
  const epaperCat = categories.find((c) => c.slug === "doc-tap-chi-in");

  return (
    <>
      <JsonLd data={itemListJsonLd(data.breaking, "Tin mới nhất")} />

      {/* ===== Cover ===== */}
      <section className="cover" aria-label="Tin tiêu điểm">
        <CoverSlider articles={data.featured} categories={categories} />
        <div className="cover-list">
          {data.coverList.map((a, i) => (
            <ArticleCard key={a.id} article={a} categories={categories} sizes="200px" showDesc={false} priority={i === 0} />
          ))}
        </div>
        <div className="epaper-box">
          <SectionHead title="Tạp chí in" href={epaperCat ? categoryPath(epaperCat) : "/doc-tap-chi-in"} />
          {data.epaper && (
            <div className="epaper-box__frame">
              <a href={data.epaper.link} target="_blank" rel="noopener" title={data.epaper.title}>
                <Image src={data.epaper.cover} alt={data.epaper.title} fill sizes="280px" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ===== Nổi bật ===== */}
      {data.spotlight.length > 0 && (
        <section className="spotlight" aria-label="Nổi bật">
          <SectionHead title="Nổi bật" />
          <SpotlightSlider articles={data.spotlight} categories={categories} />
        </section>
      )}

      {/* ===== Tin mới + 4 chuyên mục ===== */}
      <section className="stage" aria-label="Tin mới và chuyên mục">
        <div className="breaking">
          {data.breaking.map((a) => (
            <ArticleCard key={a.id} article={a} categories={categories} sizes="(max-width: 767px) 100vw, 240px" descClamp={3} />
          ))}
        </div>
        <div>
          {data.stage.map((block) => (
            <section className="box-type1" key={block.category.slug} aria-label={block.category.name}>
              <SectionHead title={block.category.name} href={categoryPath(block.category)} subs={block.subs} categories={categories} />
              {block.articles[0] && (
                <div className="box-type1__lead">
                  <ArticleCard article={block.articles[0]} category={block.category} sizes="200px" descClamp={3} />
                </div>
              )}
              {block.articles.length > 1 && (
                <div className="box-type1__grid">
                  {block.articles.slice(1).map((a) => (
                    <ArticleCard key={a.id} article={a} category={block.category} showDesc={false} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </section>

      {/* ===== Multimedia ===== */}
      {data.multimedia.articles.length > 0 && (
        <section className="multimedia" aria-label="Multimedia">
          <div className="container">
            <div className="section-head">
              <h2 className="section-head__title">
                <Link href={data.multimedia.subs[0] ? categoryPath(data.multimedia.subs[0]) : "/video"}>Multimedia</Link>
              </h2>
              {data.multimedia.subs.length > 0 && (
                <div className="multimedia__subs">
                  {data.multimedia.subs.map((s) => (
                    <Link key={s.slug} href={categoryPath(s, categories)}>
                      {s.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="multimedia__body">
              <div className="multimedia__lead">
                <ArticleCard article={data.multimedia.articles[0]} categories={categories} sizes="(max-width: 767px) 100vw, 580px" descClamp={3} />
              </div>
              <div className="multimedia__grid">
                {data.multimedia.articles.slice(1, 7).map((a) => (
                  <ArticleCard key={a.id} article={a} categories={categories} sizes="(max-width: 767px) 50vw, 275px" showDesc={false} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== Lưới chuyên mục + sidebar ===== */}
      <div className="grid-section">
        <div>
          {data.grid.map((block) => (
            <section className="box-type2" key={block.category.slug} aria-label={block.category.name}>
              <SectionHead title={block.category.name} href={categoryPath(block.category)} subs={block.subs} categories={categories} />
              {block.articles[0] && (
                <div className="box-type2__lead">
                  <ArticleCard article={block.articles[0]} category={block.category} sizes="(max-width: 767px) 100vw, 420px" descClamp={3} />
                </div>
              )}
              {block.articles.slice(1).map((a) => (
                <div className="box-type2__row" key={a.id}>
                  <ArticleCard article={a} category={block.category} showDesc={false} />
                </div>
              ))}
            </section>
          ))}
        </div>
        <Sidebar latest={data.latest} popular={data.popular} ads={settings.ads.sidebar} categories={categories} />
      </div>
    </>
  );
}
