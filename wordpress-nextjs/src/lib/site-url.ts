import type { Metadata } from "next";
import { headers } from "next/headers";

/** Normalize app pathname (e.g. `/blog`, `/cars/foo`). */
export function normalizePathname(pathname: string): string {
  if (!pathname.startsWith("/")) return `/${pathname}`;
  return pathname;
}

/**
 * Server-only: absolute URL for the request + pathname derived from it.
 * Uses `NEXT_PUBLIC_SITE_URL` when set; otherwise `x-forwarded-*` / `host` headers.
 */
export async function getCurrentUrlAndRoute(
  pathname: string
): Promise<{ currentUrl: string; currentRoute: string }> {
  const route = normalizePathname(pathname);
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  let currentUrl: string;
  if (base) {
    currentUrl = `${base}${route === "/" ? "/" : route}`;
  } else {
    const hdrs = await headers();
    const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "localhost:3000";
    const proto = hdrs.get("x-forwarded-proto") ?? "http";
    currentUrl = `${proto}://${host}${route}`;
  }
  const parsedPath = new URL(currentUrl).pathname;
  const currentRoute = parsedPath === "" ? "/" : parsedPath;
  return { currentUrl, currentRoute };
}

/** Canonical + Open Graph URL + metadataBase from resolved site URL (Next.js pattern). */
export function siteUrlMetadataFields(
  currentUrl: string,
  currentRoute: string
): Pick<Metadata, "metadataBase" | "alternates" | "openGraph"> {
  const origin = new URL(currentUrl).origin;
  return {
    metadataBase: new URL(origin),
    alternates: {
      canonical: currentRoute,
    },
    openGraph: {
      url: currentUrl,
    },
  };
}

/** Merge Yoast/basic metadata from CMS with site URL + canonical handling. */
export async function mergeSiteUrlMetadata(
  meta: Metadata,
  pathname: string
): Promise<Metadata> {
  const { currentUrl, currentRoute } = await getCurrentUrlAndRoute(pathname);
  const origin = new URL(currentUrl).origin;
  return {
    ...meta,
    metadataBase: new URL(origin),
    alternates: {
      ...meta.alternates,
      canonical: currentRoute,
    },
    openGraph:
      meta.openGraph === undefined
        ? { url: currentUrl }
        : { ...meta.openGraph, url: currentUrl },
  };
}
