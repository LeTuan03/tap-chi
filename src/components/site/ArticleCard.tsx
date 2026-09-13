import Image from "next/image";
import Link from "next/link";
import type { Article, Category } from "@/lib/types";
import { articlePath, categoryPath, formatDateTime } from "@/lib/utils";
import { CameraIcon, ClockIcon, PlayIcon } from "./Icons";

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

export { CameraIcon, PlayIcon };

export default function ArticleCard({
  article: a,
  category,
  categories,
  className = "",
  heading = "h3",
  sizes = "(max-width: 767px) 100vw, 300px",
  priority = false,
  showDesc = true,
  descClamp = 3,
}: ArticleCardProps) {
  const href = articlePath(a);
  const cat = category ?? categories?.find((c) => c.slug === a.category);
  const Heading = heading;

  return (
    <article className={`card ${className}`.trim()}>
      <Link href={href} className="card__media" tabIndex={-1} aria-hidden="true">
        <Image
          src={a.image || "/images/noimage.png"}
          alt={a.title}
          fill
          sizes={sizes}
          priority={priority}
          className="card__img"
        />
        {a.type === "photo" && (
          <span className="card__badge card__badge--photo" title="Phóng sự ảnh">
            <CameraIcon />
            <span className="card__badge-text">Ảnh</span>
          </span>
        )}
        {a.type === "video" && (
          <span className="card__badge card__badge--video" title="Video làng nghề">
            <PlayIcon />
            <span className="card__badge-text">Video</span>
          </span>
        )}
      </Link>

      <div className="card__content">
        <div className="card__meta">
          {cat && (
            <Link className="card__cat" href={categoryPath(cat, categories)}>
              {cat.name}
            </Link>
          )}
          <span className="card__time">
            <ClockIcon className="card__time-icon" />
            <time dateTime={a.publishedAt}>{formatDateTime(a.publishedAt)}</time>
          </span>
        </div>

        <Heading className="card__title">
          <Link href={href} title={a.title}>
            {a.title}
          </Link>
        </Heading>

        {showDesc && a.description && <p className={`card__desc clamp-${descClamp}`}>{a.description}</p>}
      </div>
    </article>
  );
}
