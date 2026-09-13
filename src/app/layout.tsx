import type { Metadata, Viewport } from "next";
import { Lora, Be_Vietnam_Pro } from "next/font/google";
import { db } from "@/lib/db";
import { baseMetadata } from "@/lib/seo";
import "./globals.css";

const lora = Lora({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-lora",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-be-vietnam",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await db.settings.get();
  return baseMetadata(settings);
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#9b2318",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${lora.variable} ${beVietnamPro.variable}`}>
      <body>{children}</body>
    </html>
  );
}

