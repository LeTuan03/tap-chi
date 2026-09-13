import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import LiveDate from "./LiveDate";
import LogoHeading from "./LogoHeading";
import SearchForm from "./SearchForm";

export default function SiteHeader({ settings: s }: { settings: SiteSettings }) {
  return (
    <header>
      <div className="topbar">
        <div className="container topbar__inner">
          <div className="topbar__left">
            <LiveDate />
            <span className="topbar__phone">Hotline: {s.hotline}</span>
            {s.partnerLink?.url && (
              <a className="topbar__partner" href={s.partnerLink.url} target="_blank" rel="noopener nofollow" title={s.partnerLink.label}>
                <Image src={s.partnerLink.image} alt={s.partnerLink.label} width={60} height={20} />
              </a>
            )}
          </div>
          <div className="topbar__right">
            {s.socials.facebook && <a className="icon-social-top icon-social-top--facebook" href={s.socials.facebook} target="_blank" rel="noopener" aria-label="Facebook" />}
            {s.socials.tiktok && <a className="icon-social-top icon-social-top--tiktok" href={s.socials.tiktok} target="_blank" rel="noopener" aria-label="TikTok" />}
            <a className="icon-social-top icon-social-top--tel" href={`tel:${s.hotline.replace(/\D/g, "")}`} aria-label={`Gọi hotline ${s.hotline}`} />
            {s.socials.youtube && <a className="icon-social-top icon-social-top--youtube" href={s.socials.youtube} target="_blank" rel="noopener" aria-label="YouTube" />}
            <Link className="topbar__lang" href="/" title="Tiếng Việt" aria-label="Tiếng Việt" />
            <SearchForm />
          </div>
        </div>
      </div>
      <div className="masthead">
        <div className="container">
          <LogoHeading className="masthead__logo">
            <Link href="/" title={s.siteName}>
              <Image src={s.logoBanner || s.logo} alt={`${s.tagline} - ${s.issn}`} width={850} height={113} priority />
            </Link>
          </LogoHeading>
        </div>
      </div>
    </header>
  );
}
