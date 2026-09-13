import Script from "next/script";
import type { ReactNode } from "react";
import { db } from "@/lib/db";
import { getCategories, getTicker } from "@/lib/queries";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import BackToTop from "./BackToTop";
import JsonLd from "./JsonLd";
import MainNav from "./MainNav";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import UtilityBar from "./UtilityBar";

/** Khung giao diện chung: header, menu, ticker, footer */
export default async function SiteChrome({ children }: { children: ReactNode }) {
  const [settings, categories, ticker] = await Promise.all([db.settings.get(), getCategories(), getTicker()]);
  return (
    <>
      <a className="skip-link" href="#main">
        Bỏ qua điều hướng
      </a>
      <JsonLd data={[organizationJsonLd(settings), websiteJsonLd(settings)]} />
      <SiteHeader settings={settings} />
      <MainNav categories={categories} siteName={settings.siteName} />
      <UtilityBar ticker={ticker} weather={settings.weather} />
      <main id="main" className="container">
        {children}
      </main>
      <SiteFooter settings={settings} />
      <BackToTop />
      {settings.gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${settings.gtmId}');`}
        </Script>
      )}
    </>
  );
}
