"use client";

import { useCallback, useState } from "react";

interface BlogShareButtonProps {
  title: string;
  shareUrl: string;
}

export default function BlogShareButton({
  title,
  shareUrl,
}: BlogShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const onShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        /* dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [shareUrl, title]);

  return (
    <div className="blog-share-row mb-4">
      <span className="blog-share-label">
        {copied ? "Link copied!" : "Share"}
      </span>
      <button
        type="button"
        className="blog-share-icon-btn"
        onClick={onShare}
        aria-label="Share this article"
        title={copied ? "Link copied" : "Share"}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>
    </div>
  );
}
