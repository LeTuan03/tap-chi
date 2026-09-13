"use client";

import { useCallback, useEffect, useState } from "react";
import type { Article, Category } from "@/lib/types";
import ArticleCard from "./ArticleCard";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

export default function CoverSlider({ articles, categories }: { articles: Article[]; categories: Category[] }) {
  const [index, setIndex] = useState(0);
  const count = articles.length;
  const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => go(index + 1), 6000);
    return () => clearInterval(t);
  }, [index, count, go]);

  if (count === 0) return null;
  return (
    <div className="cover-slider" aria-roledescription="carousel" aria-label="Tin nổi bật">
      <div className="cover-slider__track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {articles.map((a, i) => (
          <div className="cover-slider__slide" key={a.id} aria-hidden={i !== index} role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${count}`}>
            <ArticleCard article={a} categories={categories} heading="h2" sizes="(max-width: 767px) 100vw, 680px" priority={i === 0} descClamp={2} className="card--hero" />
          </div>
        ))}
      </div>
      {count > 1 && (
        <>
          <button type="button" className="cover-slider__btn cover-slider__btn--prev" onClick={() => go(index - 1)} aria-label="Tin trước">
            <ChevronLeftIcon />
          </button>
          <button type="button" className="cover-slider__btn cover-slider__btn--next" onClick={() => go(index + 1)} aria-label="Tin tiếp">
            <ChevronRightIcon />
          </button>
          <div className="cover-slider__dots">
            {articles.map((a, i) => (
              <button key={a.id} type="button" aria-label={`Tin ${i + 1}`} aria-current={i === index} onClick={() => go(i)} className="cover-slider__dot" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
