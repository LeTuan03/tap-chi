"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Article, Category } from "@/lib/types";
import { articlePath, categoryPath, formatDateTime } from "@/lib/utils";
import { CameraIcon, ClockIcon, PlayIcon, ChevronRightIcon } from "./Icons";

interface MultimediaSectionProps {
  articles: Article[];
  subs: Category[];
  categories: Category[];
}

export default function MultimediaSection({
  articles,
  subs,
  categories,
}: MultimediaSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("all");

  // Lọc bài viết theo tab nếu người dùng chọn tab cụ thể
  const filteredArticles = useMemo(() => {
    if (activeTab === "all") return articles;
    const match = articles.filter((a) => {
      if (activeTab === "video") return a.type === "video";
      if (activeTab === "photo" || activeTab === "anh") return a.type === "photo";
      return a.category === activeTab;
    });
    return match.length > 0 ? match : articles;
  }, [articles, activeTab]);

  if (!articles || articles.length === 0) return null;

  const leadArticle = filteredArticles[0];
  const playlistArticles = filteredArticles.slice(1, 5);

  const getCategory = (catSlug?: string) => {
    if (!catSlug) return undefined;
    return categories.find((c) => c.slug === catSlug);
  };

  const leadCat = getCategory(leadArticle.category);

  return (
    <section className="multimedia" aria-label="Multimedia - Đa phương tiện">
      <div className="container">
        {/* Header với thương hiệu Multimedia và các tab điều hướng */}
        <div className="multimedia__header">
          <div className="multimedia__brand">
            <h2 className="multimedia__title">
              <Link href={subs[0] ? categoryPath(subs[0], categories) : "/video"}>
                Multimedia Làng nghề
              </Link>
            </h2>
          </div>

          <div className="multimedia__subs" role="tablist" aria-label="Bộ lọc Multimedia">
            <button
              type="button"
              className={`multimedia__sub-pill ${activeTab === "all" ? "is-active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả
            </button>
            {subs.map((s) => (
              <button
                key={s.slug}
                type="button"
                className={`multimedia__sub-pill ${activeTab === s.slug ? "is-active" : ""}`}
                onClick={() => setActiveTab(s.slug)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Nội dung chính: Cột trái bài tiêu điểm lớn, cột phải playlist ngang */}
        <div className="multimedia__body">
          {/* CỘT TRÁI: Lead Article */}
          <div className="multimedia__lead">
            <article className="mm-lead-card">
              <Link
                href={articlePath(leadArticle)}
                className="mm-lead-card__media-wrap"
                tabIndex={-1}
                aria-hidden="true"
              >
                <div className="mm-lead-card__media">
                  <Image
                    src={leadArticle.image || "/images/noimage.png"}
                    alt={leadArticle.title}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1024px) 60vw, 680px"
                    priority
                    className="mm-lead-card__img"
                  />
                  <div className="mm-lead-card__overlay" />

                  {/* Nút Play trung tâm nếu là Video */}
                  {leadArticle.type === "video" ? (
                    <div className="mm-lead-card__play-btn" aria-hidden="true">
                      <span className="mm-lead-card__play-pulse" />
                      <PlayIcon className="mm-lead-card__play-icon" />
                    </div>
                  ) : (
                    /* Badge Phóng sự ảnh nếu là Photo */
                    <span className="mm-badge mm-badge--photo">
                      <CameraIcon className="mm-badge__icon" />
                      <span>Phóng sự ảnh</span>
                    </span>
                  )}
                </div>
              </Link>

              <div className="mm-lead-card__content">
                <div className="mm-lead-card__meta">
                  {leadCat && (
                    <Link
                      href={categoryPath(leadCat, categories)}
                      className="mm-lead-card__cat"
                    >
                      {leadCat.name}
                    </Link>
                  )}
                  <span className="mm-lead-card__time">
                    <ClockIcon className="mm-lead-card__time-icon" />
                    <time dateTime={leadArticle.publishedAt}>
                      {formatDateTime(leadArticle.publishedAt)}
                    </time>
                  </span>
                </div>

                <h3 className="mm-lead-card__title">
                  <Link href={articlePath(leadArticle)} title={leadArticle.title}>
                    {leadArticle.title}
                  </Link>
                </h3>

                {leadArticle.description && (
                  <p className="mm-lead-card__desc clamp-3">
                    {leadArticle.description}
                  </p>
                )}

                <div className="mm-lead-card__actions">
                  <Link
                    href={articlePath(leadArticle)}
                    className="mm-lead-card__btn-view"
                  >
                    <span>
                      {leadArticle.type === "video"
                        ? "Xem video"
                        : leadArticle.type === "photo"
                        ? "Xem phóng sự ảnh"
                        : "Khám phá ngay"}
                    </span>
                    <ChevronRightIcon className="mm-lead-card__btn-icon" />
                  </Link>
                </div>
              </div>
            </article>
          </div>

          {/* CỘT PHẢI: Playlist các bài multimedia tiếp theo */}
          <div className="multimedia__playlist">
            <div className="mm-playlist__header">
              <span className="mm-playlist__label">Tiêu điểm tiếp theo</span>
              <span className="mm-playlist__count">
                {playlistArticles.length > 0 ? `1 / ${playlistArticles.length}` : ""}
              </span>
            </div>

            <div className="mm-playlist__list">
              {playlistArticles.map((article, idx) => {
                const cat = getCategory(article.category);
                return (
                  <article key={article.id} className="mm-playlist-item">
                    <Link
                      href={articlePath(article)}
                      className="mm-playlist-item__media-link"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <div className="mm-playlist-item__media">
                        <Image
                          src={article.image || "/images/noimage.png"}
                          alt={article.title}
                          fill
                          sizes="(max-width: 767px) 140px, 160px"
                          className="mm-playlist-item__img"
                        />
                        {article.type === "video" ? (
                          <span className="mm-badge-mini mm-badge-mini--video">
                            <PlayIcon />
                          </span>
                        ) : (
                          <span className="mm-badge-mini mm-badge-mini--photo">
                            <CameraIcon />
                          </span>
                        )}
                        <span className="mm-playlist-item__index">{idx + 1}</span>
                      </div>
                    </Link>

                    <div className="mm-playlist-item__body">
                      <div className="mm-playlist-item__meta">
                        {cat && (
                          <Link
                            href={categoryPath(cat, categories)}
                            className="mm-playlist-item__cat"
                          >
                            {cat.name}
                          </Link>
                        )}
                        <span className="mm-playlist-item__time">
                          <ClockIcon className="mm-playlist-item__time-icon" />
                          <time dateTime={article.publishedAt}>
                            {formatDateTime(article.publishedAt)}
                          </time>
                        </span>
                      </div>

                      <h4 className="mm-playlist-item__title">
                        <Link href={articlePath(article)} title={article.title}>
                          {article.title}
                        </Link>
                      </h4>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
