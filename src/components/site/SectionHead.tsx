import Link from "next/link";
import type { Category } from "@/lib/types";
import { categoryPath } from "@/lib/utils";

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
      <h2 className="section-head__title">{href ? <Link href={href}>{title}</Link> : <span>{title}</span>}</h2>
      {subs && subs.length > 0 && (
        <div className="section-head__subs">
          {subs.map((s) => (
            <Link key={s.slug} href={categoryPath(s, categories)}>
              {s.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
