import type { Metadata } from "next";
import { headers } from "next/headers";

/** Normalize app pathname (e.g. `/blog`, `/cars/foo`). */
export function normalizePathname(pathname: string): string {
  if (!pathname.startsWith("/")) return `/${pathname}`;
  return pathname;
}

/** True for hosts where we should not rewrite http→https (local / private LAN). */
function isLocalOrPrivateHost(hostname: string): boolean {
  const h = hostname.split(":")[0].toLowerCase();
  if (h === "localhost" || h === "127.0.0.1") return true;
  const m = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(h);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/**
 * If `NEXT_PUBLIC_SITE_URL` is mistakenly set to `http://` on a public hostname,
 * canonical URLs become http while users hit https — bad for SEO.
 * Upgrade to https for public hosts; keep http for localhost / private IPs.
 */
export function normalizePublicSiteBase(base: string): string {
  const trimmed = base.replace(/\/$/, "");
  if (!trimmed) return trimmed;
  try {
    const u = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (u.protocol === "http:" && !isLocalOrPrivateHost(u.hostname)) {
      u.protocol = "https:";
    }
    return u.origin;
  } catch {
    return trimmed;
  }
}

/**
 * When `NEXT_PUBLIC_SITE_URL` is unset, build `https://host` from request headers
 * (same rules as `getCurrentUrlAndRoute` fallback).
 */
export async function resolvePublicOriginFromRequest(): Promise<string> {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "localhost:3000";
  const proto = resolveRequestProtocol(hdrs, host);
  return `${proto}://${host}`;
}

function resolveRequestProtocol(hdrs: Headers, hostHeader: string): string {
  const chain = hdrs.get("x-forwarded-proto");
  if (chain) {
    const first = chain.split(",")[0]?.trim().toLowerCase();
    if (first === "https" || first === "http") return first;
  }
  if (hdrs.get("x-forwarded-ssl") === "on") return "https";
  const cf = hdrs.get("cf-visitor");
  if (cf?.includes('"scheme":"https"')) return "https";
  // TLS terminators sometimes omit x-forwarded-proto; public hosts are almost always https in prod
  if (process.env.NODE_ENV === "production" && !isLocalOrPrivateHost(hostHeader)) {
    return "https";
  }
  return "http";
}

/**
 * Server-only: absolute URL for the request + pathname derived from it.
 * Uses `NEXT_PUBLIC_SITE_URL` when set; otherwise `x-forwarded-*` / `host` headers.
 */
export async function getCurrentUrlAndRoute(
  pathname: string
): Promise<{ currentUrl: string; currentRoute: string }> {
  const route = normalizePathname(pathname);
  const rawBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const base = rawBase ? normalizePublicSiteBase(rawBase) : "";
  let currentUrl: string;
  if (base) {
    currentUrl = `${base}${route === "/" ? "/" : route}`;
  } else {
    const hdrs = await headers();
    const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "localhost:3000";
    const proto = resolveRequestProtocol(hdrs, host);
    currentUrl = `${proto}://${host}${route}`;
  }
  const parsedPath = new URL(currentUrl).pathname;
  const currentRoute = parsedPath === "" ? "/" : parsedPath;
  return { currentUrl, currentRoute };
}

/** Small icon for the browser tab. */
export const FAVICON_PATH = "/assets/images/favicon.png";

/** Default share image under `public/` (PNG wordmark, 635×250). */
export const DEFAULT_OG_IMAGE_PATH = "/metalogo.jpg";

/** Pixel size of `carsalesbrisbane_logo.png` (IHDR). */
export const OG_SHARE_IMAGE_DIMENSIONS = { width: 635, height: 250 } as const;

export const OG_SHARE_IMAGE_ALT = "Car Sales Brisbane";

/** Absolute logo URL so crawlers get a plain `/assets/...` path (not rewritten `__static/...`). */
export function absoluteOgLogoUrl(origin: string): string {
  return new URL(DEFAULT_OG_IMAGE_PATH, origin).href;
}

export function defaultOpenGraphLogoImage(origin: string) {
  return {
    url: "/metalogo.jpg",
    type: "image/jpg" as const,
    width: OG_SHARE_IMAGE_DIMENSIONS.width,
    height: OG_SHARE_IMAGE_DIMENSIONS.height,
    alt: "Car Sales Brisbane Logo",
  };
}

type OgImageEntry = NonNullable<
  NonNullable<Metadata["openGraph"]>["images"]
> extends infer I
  ? I extends readonly (infer E)[]
    ? E
    : I
  : never;

/** Fills missing `alt` on `openGraph.images` (emits `og:image:alt`). */
export function openGraphWithImageAlts(
  openGraph: NonNullable<Metadata["openGraph"]>,
  fallbackAlt: string,
): NonNullable<Metadata["openGraph"]> {
  if (!openGraph.images) return openGraph;
  const raw = openGraph.images;
  const list = (Array.isArray(raw) ? raw : [raw]) as OgImageEntry[];
  const normalized = list.map((img) => {
    if (typeof img === "string") return { url: img, alt: fallbackAlt };
    if (img instanceof URL) return { url: img.href, alt: fallbackAlt };
    const d = img as {
      url: string | URL;
      alt?: string;
      width?: string | number;
      height?: string | number;
      type?: string;
      secureUrl?: string | URL;
    };
    const url = typeof d.url === "string" ? d.url : d.url.href;
    const alt = d.alt?.trim() ? d.alt : fallbackAlt;
    return { ...d, url, alt };
  });
  return { ...openGraph, images: normalized };
}

/** Canonical + Open Graph URL + metadataBase from resolved site URL (Next.js pattern). */
export function siteUrlMetadataFields(
  currentUrl: string,
  currentRoute: string
): Pick<Metadata, "metadataBase" | "alternates" | "openGraph" | "robots"> {
  const origin = new URL(currentUrl).origin;
  return {
    metadataBase: new URL(origin),
    alternates: {
      canonical: currentRoute,
    },
    openGraph: {
      url: currentUrl,
      images: [defaultOpenGraphLogoImage(origin)],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/** Merge CMS/basic metadata with site URL + canonical + Open Graph. */
export async function mergeSiteUrlMetadata(
  meta: Metadata,
  pathname: string
): Promise<Metadata> {
  const { currentUrl, currentRoute } = await getCurrentUrlAndRoute(pathname);
  const origin = new URL(currentUrl).origin;
  const existingOg = meta.openGraph;
  const ogImages = existingOg?.images;
  const hasOgImages =
    Array.isArray(ogImages) ? ogImages.length > 0 : Boolean(ogImages);

  const mergedOpenGraph =
    existingOg == null || !hasOgImages
      ? {
          ...(existingOg ?? {}),
          url: currentUrl,
          images: [defaultOpenGraphLogoImage(origin)],
        }
      : openGraphWithImageAlts(
          { ...existingOg, url: currentUrl },
          typeof existingOg.title === "string" && existingOg.title.trim()
            ? existingOg.title
            : OG_SHARE_IMAGE_ALT,
        );

  return {
    ...meta,
    metadataBase: new URL(origin),
    alternates: {
      ...meta.alternates,
      canonical: currentRoute,
    },
    openGraph: mergedOpenGraph,
    robots: meta.robots ?? {
      index: true,
      follow: true,
    },
  };
}
