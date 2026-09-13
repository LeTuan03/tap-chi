import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { FacebookIcon, TiktokIcon, YoutubeIcon } from "./Icons";

export default function SiteFooter({ settings: s }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" role="contentinfo">
      {/* Khung chính của chân trang */}
      <div className="container footer__main">
        <div className="footer__grid">
          {/* Cột 1: Logo và Định vị tạp chí */}
          <div className="footer__col footer__col--brand">
            <Link href="/" title={s.siteName} className="footer__logo-link">
              <Image src={s.logoFooter || s.logo} alt={s.siteName} width={160} height={160} className="footer__logo-img" />
            </Link>
            <h3 className="footer__brand-title">{s.siteName}</h3>
            <p className="footer__brand-tagline">Cơ quan ngôn luận của Hiệp hội Làng nghề Việt Nam</p>
            <div className="footer__socials" aria-label="Mạng xã hội">
              {s.socials.facebook && (
                <a className="footer__social-btn footer__social-btn--facebook" href={s.socials.facebook} target="_blank" rel="noopener" aria-label="Facebook">
                  <FacebookIcon />
                </a>
              )}
              {s.socials.youtube && (
                <a className="footer__social-btn footer__social-btn--youtube" href={s.socials.youtube} target="_blank" rel="noopener" aria-label="YouTube">
                  <YoutubeIcon />
                </a>
              )}
              {s.socials.tiktok && (
                <a className="footer__social-btn footer__social-btn--tiktok" href={s.socials.tiktok} target="_blank" rel="noopener" aria-label="TikTok">
                  <TiktokIcon />
                </a>
              )}
            </div>
          </div>

          {/* Cột 2: Thông tin tòa soạn & Pháp lý báo chí */}
          <div className="footer__col footer__col--editorial">
            <h4 className="footer__heading">TÒA SOẠN & GIẤY PHÉP</h4>
            <ul className="footer__list">
              <li>
                <span className="footer__label">Tổng biên tập:</span> <strong>{s.editorInChief}</strong>
              </li>
              <li>
                <span className="footer__label">Trụ sở tòa soạn:</span> {s.address}
              </li>
              <li>
                <span className="footer__label">Điện thoại:</span> <a href={`tel:${s.phone.replace(/\D/g, "")}`}>{s.phone}</a>
              </li>
              <li>
                <span className="footer__label">Đường dây nóng:</span> <a href={`tel:${s.hotline.replace(/\D/g, "")}`} className="footer__hotline">{s.hotline}</a>
              </li>
              <li>
                <span className="footer__label">Hòm thư điện tử:</span> <a href={`mailto:${s.email}`}>{s.email}</a>
              </li>
              <li className="footer__license">
                {s.license}
              </li>
            </ul>
          </div>

          {/* Cột 3: Liên hệ quảng cáo & Bản quyền */}
          <div className="footer__col footer__col--contact">
            <h4 className="footer__heading">LIÊN HỆ PHÁT TRIỂN & BẢN QUYỀN</h4>
            {s.adsContact?.name && (
              <div className="footer__ad-box">
                <span className="footer__ad-title">Liên hệ hợp tác & truyền thông:</span>
                <p><strong>{s.adsContact.name}</strong></p>
                <p>Điện thoại: <a href={`tel:${s.adsContact.phone}`} className="footer__ad-phone">{s.adsContact.phone}</a></p>
              </div>
            )}
            <p className="footer__copyright-notice">{s.copyright}</p>
          </div>
        </div>
      </div>

      {/* Dải bản quyền dưới cùng */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span className="footer__copy-text">
            © {year} {s.siteName}. {s.issn}. Bảo lưu mọi quyền.
          </span>
          <div className="footer__links">
            <Link href="/rss.xml">Dòng tin RSS</Link>
            <span className="footer__sep">|</span>
            <Link href="/sitemap.xml">Sơ đồ trang</Link>
            <span className="footer__sep">|</span>
            <Link href="/doc-tap-chi-in">Ấn phẩm tạp chí in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
