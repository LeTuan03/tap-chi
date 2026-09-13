import Image from "next/image";
import Link from "next/link";
import type { Article, Category } from "@/lib/types";
import { articlePath, categoryPath, formatDateTime } from "@/lib/utils";

type HeadingTag = "h2" | "h3" | "h4" | "p";

export interface ArticleCardProps {
  article: Article;
  category?: Category;
  categories?: Category[];
  className?: string;
  heading?: HeadingTag;
  /** Thuộc tính sizes cho next/image */
  sizes?: string;
  /** Ảnh LCP: tải ưu tiên */
  priority?: boolean;
  showDesc?: boolean;
  descClamp?: 2 | 3 | 5;
}

export function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3H9zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function ArticleCard({ article: a, category, categories, className = "", heading = "h3", sizes = "(max-width: 767px) 100vw, 300px", priority = false, showDesc = true, descClamp = 3 }: ArticleCardProps) {
  const href = articlePath(a);
  const cat = category ?? categories?.find((c) => c.slug === a.category);
  const Heading = heading;
  return (
    <article className={`card ${className}`.trim()}>
      <Link href={href} className="card__media" tabIndex={-1}>
        <Image src={a.image || "/images/noimage.png"} alt={a.title} fill sizes={sizes} priority={priority} />
        {a.type === "photo" && (
          <span className="card__badge" title="Phóng sự ảnh">
            <CameraIcon />
          </span>
        )}
        {a.type === "video" && (
          <span className="card__badge" title="Video">
            <PlayIcon />
          </span>
        )}
      </Link>
      <Heading className="card__title">
        <Link href={href} title={a.title}>
          {a.title}
        </Link>
      </Heading>
      <div className="card__meta">
        <time dateTime={a.publishedAt}>{formatDateTime(a.publishedAt)}</time>
        {cat && (
          <Link className="card__cat" href={categoryPath(cat, categories)}>
            {cat.name}
          </Link>
        )}
      </div>
      {showDesc && a.description && <p className={`card__desc clamp-${descClamp}`}>{a.description}</p>}
    </article>
  );
}
