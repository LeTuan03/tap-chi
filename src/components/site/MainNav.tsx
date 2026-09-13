import Link from "next/link";
import type { Category } from "@/lib/types";
import { categoryPath } from "@/lib/utils";
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
            <Link href="/" aria-label="Trang chủ" title="Trang chủ">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M12 3 2 12h3v8h5v-6h4v6h5v-8h3L12 3z" />
              </svg>
            </Link>
          </li>
          {main.map((c) => {
            const subs = childrenOf(c.slug);
            return (
              <li className="mainnav__item" key={c.slug}>
                <Link href={categoryPath(c)}>{c.name}</Link>
                {subs.length > 0 && (
                  <ul className="mainnav__sub">
                    {subs.map((s) => (
                      <li key={s.slug}>
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
              <button type="button" className="mainnav__more-btn" aria-haspopup="true" aria-label="Chuyên mục khác">
                Chuyên mục khác
              </button>
              <div className="mainnav__more-panel">
                {more.map((c) => (
                  <Link key={c.slug} href={categoryPath(c)}>
                    {c.name}
                  </Link>
                ))}
              </div>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
