import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import { db } from "@/lib/db";
import { baseMetadata } from "@/lib/seo";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await db.settings.get();
  return baseMetadata(settings);
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={notoSans.variable}>
      <body>{children}</body>
    </html>
  );
}
