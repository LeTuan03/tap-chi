import type { Metadata } from "next";
import type { Article, Category, SiteSettings } from "./types";
import { absoluteUrl, articlePath, categoryPath, stripHtml } from "./utils";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function toAbs(p: string): string {
  return absoluteUrl(p, getSiteUrl() + "/");
}

/** Metadata mặc định cho toàn site (được page ghi đè từng phần) */
export function baseMetadata(s: SiteSettings): Metadata {
  const siteUrl = getSiteUrl();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: s.siteName, template: `%s | ${s.siteName}` },
    description: s.description,
    keywords: s.keywords,
    applicationName: s.siteName,
    authors: [{ name: s.siteName, url: siteUrl }],
    creator: s.siteName,
    publisher: s.siteName,
    formatDetection: { telephone: false, address: false, email: false },
    alternates: {
      canonical: "/",
      languages: { vi: "/" },
      types: { "application/rss+xml": `${siteUrl}/rss.xml` },
    },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: s.siteName,
      url: siteUrl,
      title: s.siteName,
      description: s.description,
      images: [{ url: toAbs(s.ogImage), width: 1200, height: 630, alt: s.siteName }],
    },
    twitter: { card: "summary_large_image", title: s.siteName, description: s.description, images: [toAbs(s.ogImage)] },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    icons: { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/favicon.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }], apple: "/apple-icon.png" },
    manifest: "/manifest.webmanifest",
    verification: s.googleSiteVerification ? { google: s.googleSiteVerification } : undefined,
    other: { "theme-color": "#ffffff" },
  };
}

export function categoryMetadata(c: Category, all: Category[], s: SiteSettings, page = 1): Metadata {
  const path = page > 1 ? `${categoryPath(c, all)}/trang/${page}` : categoryPath(c, all);
  const title = page > 1 ? `${c.name} - Trang ${page}` : c.name;
  const description = c.description || `Tin tức ${c.name} mới nhất trên ${s.siteName}.`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: toAbs(path), title: `${title} | ${s.siteName}`, description, siteName: s.siteName, locale: "vi_VN", images: [{ url: toAbs(s.ogImage), width: 1200, height: 630, alt: s.siteName }] },
    twitter: { card: "summary_large_image", title: `${title} | ${s.siteName}`, description },
  };
}

export function articleMetadata(a: Article, c: Category | undefined, s: SiteSettings): Metadata {
  const path = articlePath(a);
  const description = a.description || stripHtml(a.sapo).slice(0, 160);
  const image = toAbs(a.ogImage || a.image || s.ogImage);
  return {
    title: a.title,
    description,
    keywords: a.tags.length ? a.tags : undefined,
    authors: [{ name: a.author }],
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: toAbs(path),
      title: a.title,
      description,
      siteName: s.siteName,
      locale: "vi_VN",
      publishedTime: a.publishedAt,
      modifiedTime: a.updatedAt,
      authors: [a.author],
      section: c?.name,
      tags: a.tags,
      images: [{ url: image, width: 1200, height: 630, alt: a.title }],
    },
    twitter: { card: "summary_large_image", title: a.title, description, images: [image] },
    other: { "article:publisher": s.socials.facebook || s.siteName },
  };
}

/* ---------------- JSON-LD ---------------- */

export function organizationJsonLd(s: SiteSettings) {
  const siteUrl = getSiteUrl();
  const sameAs = Object.values(s.socials).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${siteUrl}/#organization`,
    name: s.siteName,
    alternateName: s.shortName,
    url: siteUrl,
    logo: { "@type": "ImageObject", url: toAbs(s.logo), width: 300, height: 135 },
    sameAs,
    address: { "@type": "PostalAddress", streetAddress: s.address, addressLocality: "Hà Nội", addressCountry: "VN" },
    contactPoint: [{ "@type": "ContactPoint", telephone: s.hotline, contactType: "customer service", email: s.email, availableLanguage: "Vietnamese" }],
  };
}

export function websiteJsonLd(s: SiteSettings) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: s.siteName,
    alternateName: s.shortName,
    url: siteUrl,
    inLanguage: "vi-VN",
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/tim-kiem?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: toAbs(it.path) })),
  };
}

export function newsArticleJsonLd(a: Article, c: Category | undefined, s: SiteSettings) {
  const siteUrl = getSiteUrl();
  const url = toAbs(articlePath(a));
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: a.title.slice(0, 110),
    description: a.description || stripHtml(a.sapo).slice(0, 160),
    articleSection: c?.name,
    keywords: a.tags.join(", ") || undefined,
    inLanguage: "vi-VN",
    isAccessibleForFree: true,
    image: [toAbs(a.ogImage || a.image || s.ogImage)],
    datePublished: a.publishedAt,
    dateModified: a.updatedAt || a.publishedAt,
    author: { "@type": "Person", name: a.author, url: `${siteUrl}/tim-kiem?q=${encodeURIComponent(a.author)}` },
    publisher: { "@id": `${siteUrl}/#organization`, "@type": "NewsMediaOrganization", name: s.siteName, logo: { "@type": "ImageObject", url: toAbs(s.logo), width: 300, height: 135 } },
    wordCount: stripHtml(a.content).split(/\s+/).filter(Boolean).length,
  };
}

export function collectionPageJsonLd(c: Category, all: Category[], articles: Article[], s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: c.name,
    description: c.description,
    url: toAbs(categoryPath(c, all)),
    inLanguage: "vi-VN",
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.slice(0, 10).map((a, i) => ({ "@type": "ListItem", position: i + 1, url: toAbs(articlePath(a)), name: a.title })),
    },
  };
}

export function itemListJsonLd(articles: Article[], name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: articles.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: toAbs(articlePath(a)), name: a.title })),
  };
}
