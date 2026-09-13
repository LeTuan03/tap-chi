import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

export default function SiteFooter({ settings: s }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__logo">
          <Link href="/" title={s.siteName}>
            <Image src={s.logoFooter || s.logo} alt={s.siteName} width={170} height={170} />
          </Link>
        </div>
        <div className="footer__info">
          <p>
            Tổng biên tập: <strong>{s.editorInChief}</strong>
          </p>
          <p>Tòa soạn: {s.address}</p>
          <p>
            Email: <a href={`mailto:${s.email}`}>{s.email}</a>
          </p>
          <p>{s.license}</p>
          <p>
            ĐT: <span className="hot">{s.phone}</span> * Hotline: <span className="hot">{s.hotline}</span>
          </p>
          {s.adsContact?.name && (
            <p>
              Liên hệ quảng cáo: <strong>{s.adsContact.name}</strong> / ĐT: <span className="hot">{s.adsContact.phone}</span>
            </p>
          )}
          <p>{s.copyright}</p>
        </div>
        <div className="footer__social">
          {s.socials.facebook && <a className="icon-social icon-social--facebook" href={s.socials.facebook} target="_blank" rel="noopener" aria-label="Facebook" />}
          {s.socials.youtube && <a className="icon-social icon-social--youtube" href={s.socials.youtube} target="_blank" rel="noopener" aria-label="YouTube" />}
          {s.socials.twitter && <a className="icon-social icon-social--twitter" href={s.socials.twitter} target="_blank" rel="noopener" aria-label="X (Twitter)" />}
          {s.socials.tiktok && <a className="icon-social icon-social--tiktok" href={s.socials.tiktok} target="_blank" rel="noopener" aria-label="TikTok" />}
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container">
          <span>
            © {year} {s.siteName}. {s.issn}
          </span>
          <span>
            <Link href="/rss.xml">RSS</Link> · <Link href="/sitemap.xml">Sơ đồ trang</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
