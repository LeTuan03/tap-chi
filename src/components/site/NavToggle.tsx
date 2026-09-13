"use client";

import { useEffect, useState } from "react";

export default function NavToggle() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const nav = document.getElementById("main-nav");
    nav?.classList.toggle("is-open", open);
  }, [open]);
  return (
    <button type="button" className="mainnav__toggle" aria-expanded={open} aria-controls="main-nav-list" aria-label={open ? "Đóng menu" : "Mở menu"} onClick={() => setOpen((v) => !v)}>
      <span />
      <span />
      <span />
    </button>
  );
}
