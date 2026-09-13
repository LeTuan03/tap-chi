import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { FacebookIcon, PhoneIcon, TiktokIcon, YoutubeIcon } from "./Icons";
import LiveDate from "./LiveDate";
import LogoHeading from "./LogoHeading";
import SearchForm from "./SearchForm";

export default function SiteHeader({ settings: s }: { settings: SiteSettings }) {
  return (
    <header className="site-header">
      {/* 1. Thanh tiện ích trên cùng (Top Utility Bar) */}
      <div className="topbar">
        <div className="container topbar__inner">
          <div className="topbar__left">
            <LiveDate />
            <a className="topbar__phone" href={`tel:${s.hotline.replace(/\D/g, "")}`} title="Hotline tòa soạn">
              <PhoneIcon className="topbar__icon" />
              <span>Hotline: <strong>{s.hotline}</strong></span>
            </a>
            {s.partnerLink?.url && (
              <a className="topbar__partner" href={s.partnerLink.url} target="_blank" rel="noopener nofollow" title={s.partnerLink.label}>
                <span className="topbar__partner-label">Đồng hành:</span>
                <Image src={s.partnerLink.image} alt={s.partnerLink.label} width={70} height={22} className="topbar__partner-img" />
              </a>
            )}
          </div>
          <div className="topbar__right">
            <div className="topbar__socials" aria-label="Kênh mạng xã hội">
              {s.socials.facebook && (
                <a className="social-pill social-pill--facebook" href={s.socials.facebook} target="_blank" rel="noopener" aria-label="Facebook">
                  <FacebookIcon />
                </a>
              )}
              {s.socials.tiktok && (
                <a className="social-pill social-pill--tiktok" href={s.socials.tiktok} target="_blank" rel="noopener" aria-label="TikTok">
                  <TiktokIcon />
                </a>
              )}
              {s.socials.youtube && (
                <a className="social-pill social-pill--youtube" href={s.socials.youtube} target="_blank" rel="noopener" aria-label="YouTube">
                  <YoutubeIcon />
                </a>
              )}
            </div>
            <SearchForm className="topbar__search" />
          </div>
        </div>
      </div>

      {/* 2. Brand Masthead Tạp chí Di sản */}
      <div className="masthead">
        <div className="container masthead__inner">
          <div className="masthead__brand">
            <LogoHeading className="masthead__logo-wrap">
              <Link href="/" title={s.siteName} className="masthead__link">
                {s.logoBanner ? (
                  <Image
                    src={s.logoBanner}
                    alt={`${s.siteName} - ${s.tagline}`}
                    width={820}
                    height={110}
                    priority
                    className="masthead__banner-img"
                  />
                ) : (
                  <div className="masthead__text-brand">
                    <span className="masthead__sub-title">CƠ QUAN CỦA HIỆP HỘI LÀNG NGHỀ VIỆT NAM</span>
                    <span className="masthead__main-title">{s.siteName}</span>
                    <span className="masthead__issn">{s.issn}</span>
                  </div>
                )}
              </Link>
            </LogoHeading>
          </div>

          <div className="masthead__meta">
            <span className="masthead__badge">Tạp chí Điện tử</span>
            <span className="masthead__code">{s.issn}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
