"use client";

import { useState } from "react";
import type { Article, Category } from "@/lib/types";
import ArticleCard from "./ArticleCard";

export default function LatestPopularTabs({ latest, popular, categories }: { latest: Article[]; popular: Article[]; categories: Category[] }) {
  const [tab, setTab] = useState<"latest" | "popular">("latest");
  const id = "sidebar-tabs";
  return (
    <section className="tabs" aria-label="Tin mới nhất và đọc nhiều">
      <div className="tabs__nav" role="tablist">
        <button type="button" role="tab" id={`${id}-t1`} aria-selected={tab === "latest"} aria-controls={`${id}-p1`} className="tabs__btn tabs__btn--latest" onClick={() => setTab("latest")}>
          Mới nhất
        </button>
        <button type="button" role="tab" id={`${id}-t2`} aria-selected={tab === "popular"} aria-controls={`${id}-p2`} className="tabs__btn tabs__btn--popular" onClick={() => setTab("popular")}>
          Đọc nhiều
        </button>
      </div>
      <div role="tabpanel" id={`${id}-p1`} aria-labelledby={`${id}-t1`} className="tabs__panel" hidden={tab !== "latest"}>
        {latest.map((a) => (
          <ArticleCard key={a.id} article={a} categories={categories} sizes="95px" showDesc={false} />
        ))}
      </div>
      <div role="tabpanel" id={`${id}-p2`} aria-labelledby={`${id}-t2`} className="tabs__panel" hidden={tab !== "popular"}>
        {popular.map((a) => (
          <ArticleCard key={a.id} article={a} categories={categories} sizes="95px" showDesc={false} />
        ))}
      </div>
    </section>
  );
}
