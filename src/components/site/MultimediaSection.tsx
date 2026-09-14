"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Article, Category } from "@/lib/types";
import { categoryPath } from "@/lib/utils";
import MultimediaLead from "./MultimediaLead";
import MultimediaPlaylist from "./MultimediaPlaylist";

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
          <MultimediaLead leadArticle={leadArticle} leadCat={leadCat} categories={categories} />

          {/* CỘT PHẢI: Playlist các bài multimedia tiếp theo */}
          <MultimediaPlaylist playlistArticles={playlistArticles} categories={categories} />
        </div>
      </div>
    </section>
  );
}
