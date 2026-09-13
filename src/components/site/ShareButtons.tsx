"use client";

import { useState } from "react";
import { CopyIcon } from "./Icons";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="share" aria-label="Chia sẻ bài viết">
      <a
        className="share__btn share__btn--fb"
        href={`https://www.facebook.com/sharer/sharer.php?u=${u}`}
        target="_blank"
        rel="noopener nofollow"
        aria-label="Chia sẻ lên Facebook"
        title="Chia sẻ lên Facebook"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>

      <button
        type="button"
        className={`share__btn share__btn--copy ${copied ? "is-copied" : ""}`.trim()}
        onClick={copyLink}
        aria-label="Sao chép liên kết"
        title={copied ? "Đã sao chép liên kết!" : "Sao chép liên kết"}
      >
        <CopyIcon />
        {copied && <span className="share__tooltip">Đã chép link!</span>}
      </button>

      <a
        className="share__btn share__btn--mail"
        href={`mailto:?subject=${t}&body=${u}`}
        aria-label="Gửi qua email"
        title="Gửi bài qua Email"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.4V18h16V7.4l-8 5.3-8-5.3zM4.9 7l7.1 4.7L19.1 7H4.9z" />
        </svg>
      </a>

      <button
        type="button"
        className="share__btn share__btn--print"
        onClick={() => window.print()}
        aria-label="In bài viết"
        title="In bản thảo bài viết"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 3h12v5h2a2 2 0 0 1 2 2v7h-4v3H6v-3H2v-7a2 2 0 0 1 2-2h2V3zm2 2v3h8V5H8zm0 12v2h8v-2H8zm-4-2h16v-5H4v5z" />
        </svg>
      </button>
    </div>
  );
}
