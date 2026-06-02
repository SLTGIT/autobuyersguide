import { Metadata } from "next";
import { stripHtml } from "@/lib/json-ld";
import { WPPost, WPPage } from "@/types/wordpress";
import type { WPSeoACFFields } from "./acf";

function readAcfSeo(item: WPPost | WPPage): {
  title: string;
  description: string;
} {
  const acf = item.acf;
  if (!acf || typeof acf !== "object" || Array.isArray(acf)) {
    return { title: "", description: "" };
  }
  const fields = acf as WPSeoACFFields;
  const title = stripHtml(String(fields.meta_title ?? "")).trim();
  const description = stripHtml(String(fields.meta_description ?? "")).trim();
  return { title, description };
}

/** ACF meta title + meta description when present on the REST item. */
export function getAcfSeoCopy(
  item: WPPost | WPPage,
): { title: string; description: string } | null {
  const { title, description } = readAcfSeo(item);
  if (!title && !description) return null;
  return { title, description };
}

function featuredOgImages(
  item: WPPost | WPPage,
  pageTitle: string,
): { url: string; width?: number; height?: number; alt: string }[] {
  const media = item._embedded?.["wp:featuredmedia"]?.[0];
  const url =
    typeof media?.source_url === "string" ? media.source_url.trim() : "";
  if (!url) return [];
  const details = media?.media_details as
    | { width?: number; height?: number }
    | undefined;
  const alt =
    typeof media?.alt_text === "string" && media.alt_text.trim()
      ? media.alt_text.trim()
      : pageTitle;
  return [
    {
      url,
      width: details?.width,
      height: details?.height,
      alt,
    },
  ];
}

export function getMetadata(
  item: WPPost | WPPage,
  fallbackTitle?: string,
): Metadata {
  if (!item) {
    return { title: fallbackTitle || "Not Found" };
  }

  const pageTitle = stripHtml(item.title.rendered);
  const excerptPlain = stripHtml(item.excerpt?.rendered ?? "").slice(0, 160);
  const { title: acfTitle, description: acfDescription } = readAcfSeo(item);
  const ogImages = featuredOgImages(item, pageTitle);

  if (acfTitle || acfDescription) {
    return {
      title: acfTitle || pageTitle,
      description:
        acfDescription ||
        excerptPlain ||
        `Read more about ${pageTitle}`,
      openGraph: {
        title: acfTitle || pageTitle,
        description: acfDescription || excerptPlain || undefined,
        images: ogImages,
      },
    };
  }

  return {
    title: `${pageTitle} | Car Sales Brisbane`,
    description: excerptPlain || `Read more about ${pageTitle}`,
    ...(ogImages.length
      ? {
          openGraph: {
            title: pageTitle,
            description: excerptPlain || undefined,
            images: ogImages,
          },
        }
      : {}),
  };
}
