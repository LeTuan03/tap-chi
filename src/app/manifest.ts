import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await db.settings.get();
  return {
    name: s.siteName,
    short_name: s.shortName,
    description: s.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "vi",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
