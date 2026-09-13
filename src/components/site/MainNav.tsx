import Link from "next/link";
import type { Category } from "@/lib/types";
import { categoryPath } from "@/lib/utils";
import { ChevronDownIcon, MenuIcon } from "./Icons";
import NavToggle from "./NavToggle";

export default function MainNav({ categories, siteName }: { categories: Category[]; siteName: string }) {
  const top = categories.filter((c) => !c.parent);
  const main = top.filter((c) => c.menu === "main");
  const more = top.filter((c) => c.menu === "more");
  const childrenOf = (slug: string) => categories.filter((c) => c.parent === slug && c.menu !== "hidden");

  return (
    <nav className="mainnav" id="main-nav" aria-label="Chuyên mục chính">
      <div className="container mainnav__inner">
        <NavToggle />
        <span className="mainnav__brand sr-only">{siteName}</span>
        <ul className="mainnav__list" id="main-nav-list">
          <li className="mainnav__item mainnav__item--home">
            <Link href="/" aria-label="Trang chủ" title="Trang chủ" className="mainnav__link mainnav__link--home">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M12 3 2 12h3v8h5v-6h4v6h5v-8h3L12 3z" />
              </svg>
            </Link>
          </li>
          {main.map((c) => {
            const subs = childrenOf(c.slug);
            return (
              <li className={`mainnav__item ${subs.length > 0 ? "has-sub" : ""}`} key={c.slug}>
                <Link href={categoryPath(c)} className="mainnav__link">
                  <span>{c.name}</span>
                  {subs.length > 0 && <ChevronDownIcon className="mainnav__arrow" />}
                </Link>
                {subs.length > 0 && (
                  <ul className="mainnav__sub">
                    {subs.map((s) => (
                      <li key={s.slug} className="mainnav__sub-item">
                        <Link href={categoryPath(s, categories)}>{s.name}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
          {more.length > 0 && (
            <li className="mainnav__item mainnav__more">
              <button type="button" className="mainnav__more-btn" aria-haspopup="true" aria-label="Tất cả chuyên mục">
                <MenuIcon className="mainnav__more-icon" />
                <span>Thêm</span>
              </button>
              <div className="mainnav__more-panel">
                <div className="mainnav__more-header">
                  <span>Tất cả chuyên mục</span>
                </div>
                <div className="mainnav__more-grid">
                  {more.map((c) => (
                    <Link key={c.slug} href={categoryPath(c)} className="mainnav__more-item">
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
