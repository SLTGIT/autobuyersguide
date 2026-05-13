import type { InventoryFilterState } from "@/types/inventory";
import { unstable_cache } from "next/cache";
import { stripHtml } from "@/lib/json-ld";
import { parseInventorySearchParams } from "@/lib/inventory/query";

export type CmsSrpApiFilters = {
  make?: string;
  body_type?: string;
  fuel_type?: string;
  transmission?: string;
  price_range?: string;
};

/** Optional SEO fields from CMS (document title / meta description). */
export type CmsSrpMeta = {
  title?: string;
  description?: string;
};

export type CmsSrpPagePayload = {
  id: number;
  page_slug: string;
  hero_heading: string;
  hero_description: string;
  /** When present, drives `<title>` / meta description and JSON-LD page name; hero copy stays on `hero_*`. */
  meta?: CmsSrpMeta | null;
  filters: CmsSrpApiFilters;
};

function wordpressJsonBase(): string | null {
  const raw =
    process.env.WORDPRESS_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

function facetCsvToParam(s: string | undefined): string {
  const t = (s ?? "").trim();
  if (!t) return "";
  return t
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .join(",");
}

/** Parse values like `10000-25000`, `10000 - 30000`, or a single amount as max price. */
export function parseSrpApiPriceRange(
  raw: string | undefined | null,
): { minPrice: number | null; maxPrice: number | null } {
  const s = (raw ?? "").trim();
  if (!s) return { minPrice: null, maxPrice: null };
  const dash = s.match(/(\d+)\s*[-–—]\s*(\d+)/);
  if (dash) {
    const a = parseInt(dash[1], 10);
    const b = parseInt(dash[2], 10);
    if (Number.isFinite(a) && Number.isFinite(b)) {
      return {
        minPrice: Math.min(a, b),
        maxPrice: Math.max(a, b),
      };
    }
  }
  const one = s.match(/\d{3,}/);
  if (one) {
    const n = parseInt(one[0], 10);
    if (Number.isFinite(n)) return { minPrice: null, maxPrice: n };
  }
  return { minPrice: null, maxPrice: null };
}

/**
 * Build {@link InventoryFilterState} from the CMS SRP `filters` object (same semantics as `/search` query params).
 */
export function inventoryFiltersFromCmsSrpApi(
  api: CmsSrpApiFilters,
): InventoryFilterState {
  const raw: Record<string, string> = {};
  const make = api.make?.trim();
  if (make) raw.make = make;
  const bodyType = facetCsvToParam(api.body_type);
  if (bodyType) raw.bodyType = bodyType;
  const fuelType = facetCsvToParam(api.fuel_type);
  if (fuelType) raw.fuelType = fuelType;
  const transmission = facetCsvToParam(api.transmission);
  if (transmission) raw.transmission = transmission;
  const { minPrice, maxPrice } = parseSrpApiPriceRange(api.price_range);
  if (minPrice !== null) raw.minPrice = String(minPrice);
  if (maxPrice !== null) raw.maxPrice = String(maxPrice);
  return parseInventorySearchParams(raw);
}

/**
 * Dimensions implied by the CMS SRP when the URL has no query string (mirrors `/search/{make}` path augment).
 */
export function cmsSrpPathAugmentFromFilters(
  f: InventoryFilterState,
): Partial<InventoryFilterState> {
  const p: Partial<InventoryFilterState> = {};
  if (f.make.trim()) p.make = f.make;
  if (f.model.trim()) p.model = f.model;
  if (f.bodyType.length) p.bodyType = [...f.bodyType];
  if (f.fuelType.length) p.fuelType = [...f.fuelType];
  if (f.bodyColour.length) p.bodyColour = [...f.bodyColour];
  if (f.driveType.length) p.driveType = [...f.driveType];
  if (f.transmission.length) p.transmission = [...f.transmission];
  if (f.type.length) p.type = [...f.type];
  if (f.minPrice !== null || f.maxPrice !== null) {
    p.minPrice = f.minPrice;
    p.maxPrice = f.maxPrice;
  }
  if (f.minYear !== null || f.maxYear !== null) {
    p.minYear = f.minYear;
    p.maxYear = f.maxYear;
  }
  if (f.condition.trim()) p.condition = f.condition;
  return p;
}

function parseCmsSrpPagePayload(data: unknown): CmsSrpPagePayload | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (!Number.isFinite(Number(o.id))) return null;
  if (typeof o.page_slug !== "string") return null;
  if (typeof o.hero_heading !== "string") return null;
  if (typeof o.hero_description !== "string") return null;
  if (o.filters == null || typeof o.filters !== "object") return null;
  let meta: CmsSrpMeta | null = null;
  if (o.meta != null && typeof o.meta === "object") {
    const m = o.meta as Record<string, unknown>;
    const title = typeof m.title === "string" ? m.title : undefined;
    const description =
      typeof m.description === "string" ? m.description : undefined;
    if (title != null || description != null) {
      meta = { title, description };
    }
  }
  return {
    id: Number(o.id),
    page_slug: o.page_slug,
    hero_heading: o.hero_heading,
    hero_description: o.hero_description,
    meta,
    filters: o.filters as CmsSrpApiFilters,
  };
}

export type CmsSrpResolvedSeo = {
  documentTitle: string;
  documentDescription: string;
  /** When CMS sent `meta`, use these for JSON-LD listing page name/description (aligned with `<title>` / meta desc). */
  listingJsonLd: { title: string; description: string } | null;
};

/**
 * Resolves document + structured-data strings: prefers `meta.title` / `meta.description`, then hero fields.
 */
export function resolveCmsSrpSeoCopy(srp: CmsSrpPagePayload): CmsSrpResolvedSeo {
  const heroTitle =
    stripHtml(srp.hero_heading).trim() || "Vehicles for sale";
  const heroDesc =
    stripHtml(srp.hero_description).trim() || heroTitle;
  const metaTitle =
    srp.meta?.title != null ? stripHtml(String(srp.meta.title)).trim() : "";
  const metaDesc =
    srp.meta?.description != null
      ? stripHtml(String(srp.meta.description)).trim()
      : "";
  const hasMeta = Boolean(metaTitle || metaDesc);
  const documentTitle = metaTitle || heroTitle;
  const documentDescription = metaDesc || metaTitle || heroDesc;
  const listingJsonLd = hasMeta
    ? {
        title: metaTitle || heroTitle,
        description: metaDesc || metaTitle || heroDesc,
      }
    : null;
  return { documentTitle, documentDescription, listingJsonLd };
}

const CMS_SRP_CACHE_SECONDS = (() => {
  const n = Number.parseInt(process.env.CMS_SRP_CACHE_SECONDS ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 600;
})();

async function fetchCmsSrpPageBySlugUncached(
  slug: string,
): Promise<CmsSrpPagePayload | null> {
  const base = wordpressJsonBase();
  if (!base || !slug.trim()) return null;
  const url = `${base}/custom/v1/srp-pages/${encodeURIComponent(slug.trim())}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`CMS SRP fetch failed: ${res.status} ${res.statusText}`);
  }
  const data: unknown = await res.json();
  return parseCmsSrpPagePayload(data);
}

const fetchCmsSrpPageBySlugCached = unstable_cache(
  async (slug: string): Promise<CmsSrpPagePayload | null> =>
    fetchCmsSrpPageBySlugUncached(slug),
  ["cms-srp-page"],
  {
    revalidate: CMS_SRP_CACHE_SECONDS,
    tags: ["cms-srp-pages"],
  },
);

/**
 * Loads CMS-configured SRP data from WordPress `custom/v1/srp-pages/{slug}`.
 * Results are cached across requests (see `CMS_SRP_CACHE_SECONDS`, default 600s).
 * Returns `null` if missing or invalid; throws on transient HTTP errors (not cached).
 */
export async function fetchCmsSrpPageBySlug(
  slug: string,
): Promise<CmsSrpPagePayload | null> {
  const s = slug.trim();
  if (!s) return null;
  return fetchCmsSrpPageBySlugCached(s);
}
