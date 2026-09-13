import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/seo";
import { articlePath } from "@/lib/utils";

export const revalidate = 300;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Google News sitemap: chỉ gồm bài đăng trong 48 giờ gần nhất (tối đa 1000) */
export async function GET() {
  const [settings, refs] = await Promise.all([db.settings.get(), db.articles.publishedRefs()]);
  const base = getSiteUrl();
  const since = Date.now() - 48 * 60 * 60 * 1000;
  const recent = refs.filter((r) => new Date(r.publishedAt).getTime() >= since).slice(0, 1000);
  const urls = recent
    .map(
      (r) => `  <url>
    <loc>${base}${articlePath(r)}</loc>
    <news:news>
      <news:publication>
        <news:name>${esc(settings.siteName)}</news:name>
        <news:language>vi</news:language>
      </news:publication>
      <news:publication_date>${r.publishedAt}</news:publication_date>
      <news:title>${esc(r.title)}</news:title>
    </news:news>
  </url>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
