"use client";

import { useRef } from "react";
import type { Article, Category } from "@/lib/types";
import ArticleCard from "./ArticleCard";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

export default function SpotlightSlider({ articles, categories }: { articles: Article[]; categories: Category[] }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    let next = el.scrollLeft + dir * (el.clientWidth * 0.75);
    if (next > max + 10) next = 0;
    if (next < -10) next = max;
    el.scrollTo({ left: next, behavior: "smooth" });
  };
  return (
    <div className="spotlight__wrap">
      <div className="spotlight__track" ref={track}>
        {articles.map((a) => (
          <div className="spotlight__item" key={a.id}>
            <ArticleCard article={a} categories={categories} sizes="(max-width: 767px) 75vw, 240px" showDesc={false} className="card--spotlight" />
          </div>
        ))}
      </div>
      <button type="button" className="spotlight__btn spotlight__btn--prev" onClick={() => scroll(-1)} aria-label="Xem tin trước">
        <ChevronLeftIcon />
      </button>
      <button type="button" className="spotlight__btn spotlight__btn--next" onClick={() => scroll(1)} aria-label="Xem tin tiếp">
        <ChevronRightIcon />
      </button>
    </div>
  );
}
