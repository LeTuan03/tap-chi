"use client";

import { useEffect, useState } from "react";
import { CalendarIcon } from "./Icons";

/** Ngày giờ hiện tại của người xem (render sau khi mount để không lệch với cache ISR) */
export default function LiveDate() {
  const [text, setText] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const weekday = new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(now);
      const date = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(now);
      const time = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
      setText(`${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${date} - ${time}`);
    };
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="topbar__date" suppressHydrationWarning>
      <CalendarIcon className="topbar__icon" />
      <span>{text || "Đang tải ngày giờ..."}</span>
    </span>
  );
}
