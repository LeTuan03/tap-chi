"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Article, Category } from "@/lib/types";
import { articlePath, categoryPath, formatDateTime } from "@/lib/utils";
import { CameraIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, PlayIcon } from "./Icons";

export default function CoverSlider({ articles, categories }: { articles: Article[]; categories: Category[] }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const count = articles.length;
  const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count]);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (count < 2 || isPaused) return;
    const t = setInterval(() => go(index + 1), 6000);
    return () => clearInterval(t);
  }, [index, count, go, isPaused]);

  if (count === 0) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) go(index + 1);
      else go(index - 1);
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="cover-slider"
      aria-roledescription="carousel"
      aria-label="Tin nổi bật"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Khung ảnh Slider (Navigation buttons & Dots đặt chuẩn xác trên ảnh) */}
      <div className="cover-slider__media-wrap">
        <div className="cover-slider__track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {articles.map((a, i) => (
            <div
              className="cover-slider__slide-media"
              key={a.id}
              aria-hidden={i !== index}
            >
              <Link href={articlePath(a)} className="cover-slider__img-link" tabIndex={-1} aria-hidden="true">
                <Image
                  src={a.image || "/images/noimage.png"}
                  alt={a.title}
                  fill
                  sizes="(max-width: 767px) 100vw, 680px"
                  priority={i === 0}
                  className="card__img"
                />
                {a.type === "photo" && (
                  <span className="card__badge card__badge--photo" title="Phóng sự ảnh">
                    <CameraIcon />
                    <span className="card__badge-text">Ảnh</span>
                  </span>
                )}
                {a.type === "video" && (
                  <span className="card__badge card__badge--video" title="Video làng nghề">
                    <PlayIcon />
                    <span className="card__badge-text">Video</span>
                  </span>
                )}
              </Link>
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              className="cover-slider__btn cover-slider__btn--prev"
              onClick={() => go(index - 1)}
              aria-label="Tin trước"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className="cover-slider__btn cover-slider__btn--next"
              onClick={() => go(index + 1)}
              aria-label="Tin tiếp"
            >
              <ChevronRightIcon />
            </button>
            <div className="cover-slider__dots">
              {articles.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  aria-label={`Tin ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                  className="cover-slider__dot"
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Khung nội dung text chuyển động đồng bộ, không bao giờ bị nút hay chấm phân trang đè lên */}
      <div className="cover-slider__content-wrap">
        <div className="cover-slider__content-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {articles.map((a, i) => {
            const cat = categories.find((c) => c.slug === a.category);
            const href = articlePath(a);
            return (
              <div
                className="cover-slider__content-slide card--hero"
                key={a.id}
                aria-hidden={i !== index}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${count}`}
              >
                <div className="card__content">
                  <div className="card__meta">
                    {cat && (
                      <Link className="card__cat" href={categoryPath(cat, categories)}>
                        {cat.name}
                      </Link>
                    )}
                    <span className="card__time">
                      <ClockIcon className="card__time-icon" />
                      <time dateTime={a.publishedAt}>{formatDateTime(a.publishedAt)}</time>
                    </span>
                  </div>

                  <h2 className="card__title">
                    <Link href={href} title={a.title}>
                      {a.title}
                    </Link>
                  </h2>

                  {a.description && <p className="card__desc clamp-2">{a.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

