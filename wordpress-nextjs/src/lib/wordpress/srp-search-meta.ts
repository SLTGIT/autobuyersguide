import { unstable_cache } from "next/cache";
import { buildSrpSearchFilterText } from "@/lib/inventory/srp-filter-text";
import type { InventoryFilterState } from "@/types/inventory";

export type SrpSearchMetaTemplates = {
  title: string;
  description: string;
  heading: string;
  sub_heading: string;
};

export type SrpSearchMetaResolved = {
  title: string;
  description: string;
  heading: string;
  subHeading: string;
  filterText: string;
};

const SRP_SEARCH_META_CACHE_SECONDS = 60;

function wordpressJsonBase(): string | null {
  const raw =
    process.env.WORDPRESS_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "").replace(/\/wp\/v2(\/.*)?$/, "");
}

function wordpressAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const user = process.env.WORDPRESS_AUTH_USERNAME;
  const pass = process.env.WORDPRESS_AUTH_PASSWORD;
  if (user && pass) {
    headers.Authorization = `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
  }
  return headers;
}

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Replaces `{filterText}` in WordPress SRP search meta templates. */
export function applySrpSearchMetaTemplate(
  template: string,
  filterText: string,
): string {
  const replaced = template.replace(/\{filterText\}/gi, filterText.trim());
  return collapseWhitespace(replaced);
}

function parseSrpSearchMetaResponse(data: unknown): SrpSearchMetaTemplates | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  const payload =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  const title =
    typeof payload.title === "string" ? payload.title.trim() : "";
  const description =
    typeof payload.description === "string" ? payload.description.trim() : "";
  const heading =
    typeof payload.heading === "string" ? payload.heading.trim() : "";
  const sub_heading =
    typeof payload.sub_heading === "string" ? payload.sub_heading.trim() : "";
  if (!title && !description && !heading && !sub_heading) return null;
  return { title, description, heading, sub_heading };
}

async function fetchSrpSearchMetaTemplatesUncached(): Promise<SrpSearchMetaTemplates | null> {
  const base = wordpressJsonBase();
  if (!base) return null;

  const url = `${base}/csb/v1/srp-search-meta`;
  const res = await fetch(url, {
    headers: wordpressAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[srp-search-meta] fetch failed:", res.status, res.statusText);
    return null;
  }

  const data: unknown = await res.json();
  return parseSrpSearchMetaResponse(data);
}

const fetchSrpSearchMetaTemplatesCached = unstable_cache(
  fetchSrpSearchMetaTemplatesUncached,
  ["srp-search-meta-templates"],
  {
    revalidate: SRP_SEARCH_META_CACHE_SECONDS,
    tags: ["srp-search-meta"],
  },
);

export async function fetchSrpSearchMetaTemplates(): Promise<SrpSearchMetaTemplates | null> {
  return fetchSrpSearchMetaTemplatesCached();
}

function buildFallbackSrpSearchMeta(filterText: string): SrpSearchMetaResolved {
  const ft = filterText.trim() || "cars";
  return {
    filterText: ft,
    title: `${ft} for Sale in Brisbane | Car Sales Brisbane`,
    description: `Browse our range of ${ft} available for sale in Brisbane.`,
    heading: `Explore Our Range of ${ft} Available for Sale in Brisbane`,
    subHeading: `Find quality ${ft} at competitive prices at Car Sales Brisbane.`,
  };
}

/** Resolves SRP document title, meta description, and hero copy from WordPress templates. */
export async function resolveSrpSearchMeta(
  filters: InventoryFilterState,
  opts?: { pathHeroLabel?: string | null },
): Promise<SrpSearchMetaResolved> {
  const filterText = buildSrpSearchFilterText(filters, opts);
  const templates = await fetchSrpSearchMetaTemplates();
  const fallback = buildFallbackSrpSearchMeta(filterText);

  if (!templates) {
    return fallback;
  }

  return {
    filterText,
    title: applySrpSearchMetaTemplate(templates.title, filterText) || fallback.title,
    description:
      applySrpSearchMetaTemplate(templates.description, filterText) ||
      fallback.description,
    heading:
      applySrpSearchMetaTemplate(templates.heading, filterText) ||
      fallback.heading,
    subHeading:
      applySrpSearchMetaTemplate(templates.sub_heading, filterText) ||
      fallback.subHeading,
  };
}
