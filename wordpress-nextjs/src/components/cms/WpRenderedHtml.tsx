"use client";

import { useEffect } from "react";
import { useClientMounted } from "@/hooks/useClientMounted";
import { repairWpRenderedHtml } from "@/lib/wordpress/repair-rendered-html";
import type { ComponentPropsWithoutRef, ElementType } from "react";

type WpRenderedHtmlProps = {
  html: string;
  as?: ElementType;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "dangerouslySetInnerHTML">;

/**
 * Renders WordPress HTML after client mount so invalid/block-nested markup from
 * the CMS cannot break React hydration (insertBefore / removeChild errors).
 */
export default function WpRenderedHtml({
  html,
  as: Tag = "div",
  className,
  ...rest
}: WpRenderedHtmlProps) {
  const mounted = useClientMounted();
  const repaired = repairWpRenderedHtml(html.trim());

  useEffect(() => {
    if (!mounted || !repaired) return;
    void import("aos").then((mod) => {
      if (typeof mod.default.refresh === "function") {
        mod.default.refresh();
      }
    });
  }, [mounted, repaired]);

  if (!repaired) return null;

  if (!mounted) {
    return (
      <Tag
        className={className}
        aria-busy="true"
        suppressHydrationWarning
        {...rest}
      />
    );
  }

  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: repaired }}
      suppressHydrationWarning
      {...rest}
    />
  );
}
