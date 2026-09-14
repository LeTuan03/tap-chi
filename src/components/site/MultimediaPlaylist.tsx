import Image from "next/image";
import Link from "next/link";
import type { Article, Category } from "@/lib/types";
import { articlePath, categoryPath, formatDateTime } from "@/lib/utils";
import { CameraIcon, ClockIcon, PlayIcon } from "./Icons";

interface MultimediaPlaylistProps {
  playlistArticles: Article[];
  categories: Category[];
}

export default function MultimediaPlaylist({ playlistArticles, categories }: MultimediaPlaylistProps) {
  const getCategory = (catSlug?: string) => {
    if (!catSlug) return undefined;
    return categories.find((c) => c.slug === catSlug);
  };

  return (
    <div className="multimedia__playlist">
      <div className="mm-playlist__header">
        <span className="mm-playlist__label">Tiêu điểm tiếp theo</span>
        <span className="mm-playlist__count">
          {playlistArticles.length > 0 ? `1 / ${playlistArticles.length}` : ""}
        </span>
      </div>

      <div className="mm-playlist__list">
        {playlistArticles.map((article, idx) => {
          const cat = getCategory(article.category);
          return (
            <article key={article.id} className="mm-playlist-item">
              <Link
                href={articlePath(article)}
                className="mm-playlist-item__media-link"
                tabIndex={-1}
                aria-hidden="true"
              >
                <div className="mm-playlist-item__media">
                  <Image
                    src={article.image || "/images/noimage.png"}
                    alt={article.title}
                    fill
                    sizes="(max-width: 767px) 140px, 160px"
                    className="mm-playlist-item__img"
                  />
                  {article.type === "video" ? (
                    <span className="mm-badge-mini mm-badge-mini--video">
                      <PlayIcon />
                    </span>
                  ) : (
                    <span className="mm-badge-mini mm-badge-mini--photo">
                      <CameraIcon />
                    </span>
                  )}
                  <span className="mm-playlist-item__index">{idx + 1}</span>
                </div>
              </Link>

              <div className="mm-playlist-item__body">
                <div className="mm-playlist-item__meta">
                  {cat && (
                    <Link
                      href={categoryPath(cat, categories)}
                      className="mm-playlist-item__cat"
                    >
                      {cat.name}
                    </Link>
                  )}
                  <span className="mm-playlist-item__time">
                    <ClockIcon className="mm-playlist-item__time-icon" />
                    <time dateTime={article.publishedAt}>
                      {formatDateTime(article.publishedAt)}
                    </time>
                  </span>
                </div>

                <h4 className="mm-playlist-item__title">
                  <Link href={articlePath(article)} title={article.title}>
                    {article.title}
                  </Link>
                </h4>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
