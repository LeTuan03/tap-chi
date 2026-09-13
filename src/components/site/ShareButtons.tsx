"use client";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return (
    <div className="share" aria-label="Chia sẻ bài viết">
      <a className="share__btn" href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener nofollow" aria-label="Chia sẻ lên Facebook" title="Facebook">
        <svg viewBox="0 0 24 24">
          <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4V14h2.8v8h3.3z" />
        </svg>
      </a>
      <a className="share__btn" href={`https://twitter.com/intent/tweet?url=${u}&text=${t}`} target="_blank" rel="noopener nofollow" aria-label="Chia sẻ lên X" title="X (Twitter)">
        <svg viewBox="0 0 24 24">
          <path d="M17.5 3h3l-6.6 7.6L21.7 21h-6.1l-4.8-6.2L5.3 21h-3l7.1-8.1L2 3h6.2l4.3 5.7L17.5 3zm-1.1 16.2h1.7L7.7 4.7H5.9l10.5 14.5z" />
        </svg>
      </a>
      <a className="share__btn" href={`mailto:?subject=${t}&body=${u}`} aria-label="Gửi qua email" title="Email">
        <svg viewBox="0 0 24 24">
          <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.4V18h16V7.4l-8 5.3-8-5.3zM4.9 7l7.1 4.7L19.1 7H4.9z" />
        </svg>
      </a>
      <button type="button" className="share__btn" onClick={() => window.print()} aria-label="In bài viết" title="In">
        <svg viewBox="0 0 24 24">
          <path d="M6 3h12v5h2a2 2 0 0 1 2 2v7h-4v3H6v-3H2v-7a2 2 0 0 1 2-2h2V3zm2 2v3h8V5H8zm0 12v2h8v-2H8zm-4-2h16v-5H4v5z" />
        </svg>
      </button>
    </div>
  );
}
