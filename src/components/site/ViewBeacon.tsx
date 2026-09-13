"use client";

import { useEffect } from "react";

/** Ghi nhận lượt xem bài viết (không chặn render, không ảnh hưởng SEO) */
export default function ViewBeacon({ id }: { id: number }) {
  useEffect(() => {
    const key = `viewed:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* bỏ qua */
    }
    const url = `/api/articles/${id}/view`;
    if (navigator.sendBeacon) navigator.sendBeacon(url);
    else fetch(url, { method: "POST", keepalive: true }).catch(() => undefined);
  }, [id]);
  return null;
}
