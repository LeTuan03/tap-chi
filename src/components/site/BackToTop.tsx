"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "./Icons";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`back-top ${visible ? "is-visible" : ""}`.trim()}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Lên đầu trang"
      title="Lên đầu trang"
    >
      <ArrowUpIcon />
      <span className="sr-only">Lên đầu trang</span>
    </button>
  );
}
