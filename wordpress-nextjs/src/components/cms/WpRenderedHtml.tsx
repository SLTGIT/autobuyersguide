import { repairWpRenderedHtml } from "@/lib/wordpress/repair-rendered-html";
import type { ComponentPropsWithoutRef, ElementType } from "react";

type WpRenderedHtmlProps = {
  html: string;
  as?: ElementType;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "dangerouslySetInnerHTML">;

/**
 * Server-renders repaired WordPress HTML so content is present in the initial
 * accessibility tree and layout is stable (no client-mount CLS).
 */
export default function WpRenderedHtml({
  html,
  as: Tag = "div",
  className,
  ...rest
}: WpRenderedHtmlProps) {
  const repaired = repairWpRenderedHtml(html.trim());
  if (!repaired) return null;

  const mergedClassName = ["cms-rendered-content", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      className={mergedClassName}
      dangerouslySetInnerHTML={{ __html: repaired }}
      suppressHydrationWarning
      {...rest}
    />
  );
}
