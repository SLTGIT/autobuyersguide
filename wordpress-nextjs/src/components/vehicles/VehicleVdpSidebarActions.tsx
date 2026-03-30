"use client";

import { useCallback, useState } from "react";

interface VehicleVdpSidebarActionsProps {
  title: string;
  shareUrl: string;
  mailto?: string;
}

export default function VehicleVdpSidebarActions({
  title,
  shareUrl,
  mailto,
}: VehicleVdpSidebarActionsProps) {
  const [saved, setSaved] = useState(false);
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
    <div className="vdp-sidebar-actions" role="group" aria-label="Save and share">
      <button
        type="button"
        className={`vdp-icon-btn ${saved ? "is-active" : ""}`}
        onClick={() => setSaved((s) => !s)}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save vehicle"}
        title="Save"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
      {mailto ? (
        <a className="vdp-icon-btn" href={mailto} aria-label="Email about this vehicle" title="Email">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </a>
      ) : null}
      <button
        type="button"
        className="vdp-icon-btn"
        onClick={onShare}
        aria-label="Share listing"
        title={copied ? "Link copied" : "Share"}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
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
