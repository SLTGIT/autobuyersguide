"use client";

import { useLayoutEffect } from "react";

const BREADCRUMB_ANCHOR_ID = "blog-breadcrumb";

/**
 * Scrolls the blog detail view to the breadcrumb on open and when navigating
 * between posts (client-side) so the previous page's scroll position is not kept.
 */
export function BlogPostScrollToBreadcrumb({ slug }: { slug: string }) {
  useLayoutEffect(() => {
    const el = document.getElementById(BREADCRUMB_ANCHOR_ID);
    if (el) {
      el.scrollIntoView({ block: "start", behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [slug]);

  return null;
}
