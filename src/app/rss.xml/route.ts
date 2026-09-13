import { db } from "@/lib/db";
import { getLatestArticles } from "@/lib/queries";
import { getSiteUrl, toAbs } from "@/lib/seo";
import { articlePath } from "@/lib/utils";

export const revalidate = 300;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const [settings, articles, categories] = await Promise.all([db.settings.get(), getLatestArticles(30), db.categories.all()]);
  const base = getSiteUrl();
  const items = articles
    .map((a) => {
      const cat = categories.find((c) => c.slug === a.category);
      const link = toAbs(articlePath(a));
      const img = a.image ? toAbs(a.image) : "";
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${esc(a.description)}</description>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <dc:creator>${esc(a.author)}</dc:creator>
      ${cat ? `<category>${esc(cat.name)}</category>` : ""}
      ${img ? `<enclosure url="${esc(img)}" type="image/jpeg" length="0" />` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(settings.siteName)}</title>
    <link>${base}/</link>
    <description>${esc(settings.description)}</description>
    <language>vi-vn</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${toAbs(settings.logo)}</url>
      <title>${esc(settings.siteName)}</title>
      <link>${base}/</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
