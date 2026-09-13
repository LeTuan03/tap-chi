"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Trang chủ dùng thẻ h1 cho logo, các trang khác dùng div để h1 dành cho tiêu đề nội dung */
export default function LogoHeading({ children, className }: { children: ReactNode; className?: string }) {
  const pathname = usePathname();
  if (pathname === "/") return <h1 className={className}>{children}</h1>;
  return <div className={className}>{children}</div>;
}
