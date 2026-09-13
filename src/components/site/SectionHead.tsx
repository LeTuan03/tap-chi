import Link from "next/link";
import type { Category } from "@/lib/types";
import { categoryPath } from "@/lib/utils";
import { ChevronRightIcon } from "./Icons";

interface Props {
  title: string;
  href?: string;
  subs?: Category[];
  categories?: Category[];
  className?: string;
}

export default function SectionHead({ title, href, subs, categories, className = "" }: Props) {
  return (
    <div className={`section-head ${className}`.trim()}>
      <div className="section-head__bar">
        <h2 className="section-head__title">
          {href ? (
            <Link href={href} className="section-head__title-link">
              <span className="section-head__indicator" />
              <span>{title}</span>
              <ChevronRightIcon className="section-head__arrow" />
            </Link>
          ) : (
            <span className="section-head__title-text">
              <span className="section-head__indicator" />
              <span>{title}</span>
            </span>
          )}
        </h2>

        {subs && subs.length > 0 && (
          <div className="section-head__subs">
            {subs.map((s) => (
              <Link key={s.slug} href={categoryPath(s, categories)} className="section-head__sub-pill">
                {s.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
