"use client";

import { useCallback, useState } from "react";

interface VdpShareLinksProps {
  title: string;
  shareUrl: string;
  className?: string;
}

export default function VdpShareLinks({
  title,
  shareUrl,
  className,
}: VdpShareLinksProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        /* dismissed — fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [shareUrl, title]);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(title);

  const networks = [
    {
      key: "facebook",
      label: "Share on Facebook",
      icon: "bi-facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: "whatsapp",
      label: "Share on WhatsApp",
      icon: "bi-whatsapp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      key: "x",
      label: "Share on X",
      icon: "bi-twitter-x",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      key: "email",
      label: "Share by email",
      icon: "bi-envelope-fill",
      href: `mailto:?subject=${encodedText}&body=${encodedText}%20${encodedUrl}`,
    },
  ];

  return (
    <div
      className={`vdp-ref-share${className ? ` ${className}` : ""}`}
      role="group"
      aria-label="Share this car"
    >
      <span className="vdp-ref-share__label">
        {copied ? "Link copied!" : "Share"}
      </span>
      <div className="vdp-ref-share__icons">
        {networks.map((network) => (
          <a
            key={network.key}
            className={`vdp-ref-share__btn vdp-ref-share__btn--${network.key}`}
            href={network.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={network.label}
            title={network.label}
          >
            <i className={`bi ${network.icon}`} aria-hidden="true"></i>
          </a>
        ))}
        <button
          type="button"
          className="vdp-ref-share__btn vdp-ref-share__btn--copy"
          onClick={onCopy}
          aria-label={copied ? "Link copied" : "Copy link to this car"}
          title={copied ? "Link copied" : "Copy link"}
        >
          <i
            className={`bi ${copied ? "bi-check-lg" : "bi-link-45deg"}`}
            aria-hidden="true"
          ></i>
        </button>
      </div>
    </div>
  );
}
