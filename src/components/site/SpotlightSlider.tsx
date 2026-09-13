"use client";

import { useRef } from "react";
import type { Article, Category } from "@/lib/types";
import ArticleCard from "./ArticleCard";

export default function SpotlightSlider({ articles, categories }: { articles: Article[]; categories: Category[] }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    let next = el.scrollLeft + dir * el.clientWidth;
    if (next > max + 10) next = 0;
    if (next < -10) next = max;
    el.scrollTo({ left: next, behavior: "smooth" });
  };
  return (
    <div className="spotlight__wrap">
      <div className="spotlight__track" ref={track}>
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} categories={categories} sizes="(max-width: 767px) 72vw, 220px" showDesc={false} />
        ))}
      </div>
      <button type="button" className="spotlight__btn spotlight__btn--prev" onClick={() => scroll(-1)} aria-label="Xem tin trước">
        ‹
      </button>
      <button type="button" className="spotlight__btn spotlight__btn--next" onClick={() => scroll(1)} aria-label="Xem tin tiếp">
        ›
      </button>
    </div>
  );
}
