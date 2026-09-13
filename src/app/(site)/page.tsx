import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ArticleCard from "@/components/site/ArticleCard";
import CoverSlider from "@/components/site/CoverSlider";
import { BookOpenIcon } from "@/components/site/Icons";
import JsonLd from "@/components/site/JsonLd";
import SectionHead from "@/components/site/SectionHead";
import Sidebar from "@/components/site/Sidebar";
import SpotlightSlider from "@/components/site/SpotlightSlider";
import MultimediaSection from "@/components/site/MultimediaSection";
import { db } from "@/lib/db";
import { getCategories, getHomeData } from "@/lib/queries";
import { itemListJsonLd, toAbs } from "@/lib/seo";
import { categoryPath } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await db.settings.get();
  return {
    title: { absolute: `${s.siteName} - Tạp chí Điện tử Di sản & Làng nghề Việt Nam` },
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

      {/* ===== 1. Khối Tiêu Điểm Bất Đối Xứng (Cover Hero Showcase) ===== */}
      <section className="cover" aria-label="Tin tiêu điểm tạp chí">
        {/* Cột 1: Slider Tiêu điểm lớn */}
        <div className="cover__main">
          <CoverSlider articles={data.featured} categories={categories} />
        </div>

        {/* Cột 2: Cột dòng chảy tin tức */}
        <div className="cover-list" aria-label="Dòng thời sự làng nghề">
          <div className="cover-list__header">
            <span className="cover-list__tag">Thời sự Làng nghề</span>
          </div>
          <div className="cover-list__items">
            {data.coverList.map((a, i) => (
              <ArticleCard key={a.id} article={a} categories={categories} sizes="220px" showDesc={false} priority={i === 0} className="card--compact" />
            ))}
          </div>
        </div>

        {/* Cột 3: Tạp chí in E-Paper 3D Showcase */}
        <div className="epaper-box" aria-label="Ấn phẩm tạp chí in">
          <div className="epaper-box__header">
            <span className="epaper-box__badge">Ấn phẩm kỳ này</span>
            <SectionHead title="Tạp chí in" href={epaperCat ? categoryPath(epaperCat) : "/doc-tap-chi-in"} />
          </div>
          {data.epaper && (
            <div className="epaper-box__body">
              <a href={data.epaper.link} target="_blank" rel="noopener" title={data.epaper.title} className="epaper-box__link">
                <div className="epaper-box__frame">
                  <Image src={data.epaper.cover} alt={data.epaper.title} fill sizes="280px" className="epaper-box__img" priority />
                </div>
                <h4 className="epaper-box__title clamp-2">{data.epaper.title}</h4>
                <div className="epaper-box__cta">
                  <BookOpenIcon className="epaper-box__cta-icon" />
                  <span>Đọc ấn phẩm số</span>
                </div>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ===== 2. Nổi Bật / Tinh Hoa Nghệ Nhân (Spotlight Carousel) ===== */}
      {data.spotlight.length > 0 && (
        <section className="spotlight" aria-label="Tinh hoa làng nghề nổi bật">
          <SectionHead title="Tinh hoa Nghệ nhân & Làng nghề" />
          <SpotlightSlider articles={data.spotlight} categories={categories} />
        </section>
      )}

      {/* ===== 3. Tin Nóng & Các Chuyên Mục Trọng Điểm (Stage Sections) ===== */}
      <section className="stage" aria-label="Tin mới và chuyên mục trọng điểm">
        <div className="breaking">
          <div className="breaking__header">
            <span className="breaking__badge">Dòng sự kiện</span>
            <h3 className="breaking__title">Mới cập nhật</h3>
          </div>
          <div className="breaking__list">
            {data.breaking.map((a) => (
              <ArticleCard key={a.id} article={a} categories={categories} sizes="(max-width: 767px) 100vw, 240px" descClamp={3} className="card--breaking" />
            ))}
          </div>
        </div>

        <div className="stage__blocks">
          {data.stage.map((block) => (
            <section className="box-type1" key={block.category.slug} aria-label={block.category.name}>
              <SectionHead title={block.category.name} href={categoryPath(block.category)} subs={block.subs} categories={categories} />
              {block.articles[0] && (
                <div className="box-type1__lead">
                  <ArticleCard article={block.articles[0]} category={block.category} sizes="(max-width: 767px) 100vw, 340px" descClamp={3} className="card--lead" />
                </div>
              )}
              {block.articles.length > 1 && (
                <div className="box-type1__grid">
                  {block.articles.slice(1).map((a) => (
                    <ArticleCard key={a.id} article={a} category={block.category} showDesc={false} className="card--secondary" />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </section>

      {/* ===== 4. Đa Phương Tiện (Multimedia Dark Section) ===== */}
      <MultimediaSection
        articles={data.multimedia.articles}
        subs={data.multimedia.subs}
        categories={categories}
      />

      {/* ===== 5. Lưới Chuyên Mục Sâu + Sidebar ===== */}
      <div className="grid-section">
        <div className="grid-section__main">
          {data.grid.map((block) => (
            <section className="box-type2" key={block.category.slug} aria-label={block.category.name}>
              <SectionHead title={block.category.name} href={categoryPath(block.category)} subs={block.subs} categories={categories} />
              <div className="box-type2__content">
                {block.articles[0] && (
                  <div className="box-type2__lead">
                    <ArticleCard article={block.articles[0]} category={block.category} sizes="(max-width: 767px) 100vw, 420px" descClamp={3} className="card--lead" />
                  </div>
                )}
                <div className="box-type2__list">
                  {block.articles.slice(1).map((a) => (
                    <div className="box-type2__row" key={a.id}>
                      <ArticleCard article={a} category={block.category} showDesc={false} className="card--horizontal" />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
        <Sidebar latest={data.latest} popular={data.popular} ads={settings.ads.sidebar} categories={categories} />
      </div>
    </>
  );
}
