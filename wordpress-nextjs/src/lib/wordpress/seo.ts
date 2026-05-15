import { Metadata } from "next";
import { stripHtml } from "@/lib/json-ld";
import { WPPost, WPPage } from "@/types/wordpress";

type YoastHeadJson = {
  title?: string;
  description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: { url: string; width?: number; height?: number; alt?: string }[];
};

function yoastFrom(item: WPPost | WPPage): YoastHeadJson | null {
  const raw = item.yoast_head_json;
  if (!raw || typeof raw !== "object") return null;
  return raw as YoastHeadJson;
}

/** Yoast SEO title + meta description when present on the REST item. */
export function getYoastSeoCopy(
  item: WPPost | WPPage,
): { title: string; description: string } | null {
  const yoast = yoastFrom(item);
  if (!yoast) return null;

  const title = stripHtml(String(yoast.title ?? "")).trim();
  const description = stripHtml(
    String(yoast.og_description ?? yoast.description ?? ""),
  ).trim();

  if (!title && !description) return null;
  return { title, description };
}

export function getMetadata(
  item: WPPost | WPPage,
  fallbackTitle?: string,
): Metadata {
  if (!item) {
    return { title: fallbackTitle || "Not Found" };
  }

  const yoast = yoastFrom(item);
  const pageTitle = stripHtml(item.title.rendered);
  const excerptPlain = stripHtml(item.excerpt?.rendered ?? "").slice(0, 160);

  if (yoast) {
    const yoastTitle = stripHtml(String(yoast.title ?? "")).trim();
    const yoastDescription = stripHtml(
      String(yoast.og_description ?? yoast.description ?? ""),
    ).trim();
    const ogTitle = stripHtml(String(yoast.og_title ?? yoast.title ?? "")).trim();

    return {
      title: yoastTitle || pageTitle,
      description:
        yoastDescription ||
        excerptPlain ||
        `Read more about ${pageTitle}`,
      openGraph: {
        title: ogTitle || yoastTitle || pageTitle,
        description: yoastDescription || excerptPlain || undefined,
        images: yoast.og_image?.length
          ? yoast.og_image.map((img) => ({
              url: img.url,
              width: img.width,
              height: img.height,
              alt: img.alt?.trim() || pageTitle,
            }))
          : [],
      },
    };
  }

  return {
    title: `${pageTitle} | Car Sales Brisbane`,
    description:
      excerptPlain || `Read more about ${pageTitle}`,
  };
}
