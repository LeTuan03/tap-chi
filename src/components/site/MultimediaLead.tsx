import Image from "next/image";
import Link from "next/link";
import type { Article, Category } from "@/lib/types";
import { articlePath, categoryPath, formatDateTime } from "@/lib/utils";
import { CameraIcon, ClockIcon, PlayIcon, ChevronRightIcon } from "./Icons";

interface MultimediaLeadProps {
  leadArticle: Article;
  leadCat?: Category;
  categories: Category[];
}

export default function MultimediaLead({ leadArticle, leadCat, categories }: MultimediaLeadProps) {
  if (!leadArticle) return null;

  return (
    <div className="multimedia__lead">
      <article className="mm-lead-card">
        <Link
          href={articlePath(leadArticle)}
          className="mm-lead-card__media-wrap"
          tabIndex={-1}
          aria-hidden="true"
        >
          <div className="mm-lead-card__media">
            <Image
              src={leadArticle.image || "/images/noimage.png"}
              alt={leadArticle.title}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1024px) 60vw, 680px"
              priority
              className="mm-lead-card__img"
            />
            <div className="mm-lead-card__overlay" />

            {leadArticle.type === "video" ? (
              <div className="mm-lead-card__play-btn" aria-hidden="true">
                <span className="mm-lead-card__play-pulse" />
                <PlayIcon className="mm-lead-card__play-icon" />
              </div>
            ) : (
              <span className="mm-badge mm-badge--photo">
                <CameraIcon className="mm-badge__icon" />
                <span>Phóng sự ảnh</span>
              </span>
            )}
          </div>
        </Link>

        <div className="mm-lead-card__content">
          <div className="mm-lead-card__meta">
            {leadCat && (
              <Link
                href={categoryPath(leadCat, categories)}
                className="mm-lead-card__cat"
              >
                {leadCat.name}
              </Link>
            )}
            <span className="mm-lead-card__time">
              <ClockIcon className="mm-lead-card__time-icon" />
              <time dateTime={leadArticle.publishedAt}>
                {formatDateTime(leadArticle.publishedAt)}
              </time>
            </span>
          </div>

          <h3 className="mm-lead-card__title">
            <Link href={articlePath(leadArticle)} title={leadArticle.title}>
              {leadArticle.title}
            </Link>
          </h3>

          {leadArticle.description && (
            <p className="mm-lead-card__desc clamp-3">
              {leadArticle.description}
            </p>
          )}

          <div className="mm-lead-card__actions">
            <Link
              href={articlePath(leadArticle)}
              className="mm-lead-card__btn-view"
            >
              <span>
                {leadArticle.type === "video"
                  ? "Xem video"
                  : leadArticle.type === "photo"
                  ? "Xem phóng sự ảnh"
                  : "Khám phá ngay"}
              </span>
              <ChevronRightIcon className="mm-lead-card__btn-icon" />
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
