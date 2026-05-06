import type { DealerVehicle } from "@/types/inventory";
import type { InventoryFilterState } from "@/types/inventory";
import { slugifyInventoryPart } from "@/lib/inventory/slug";
import {
  isSearchMakePathAllowed,
  resolveMakeFilterFromPathSlug,
} from "@/lib/research/research-make-slugs";

/** Same shape as research make slugs: lowercase alphanumerics + hyphens. */
export const SEARCH_PATH_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const PRICE_BUCKET_STEP = 5000;

export type InventoryPathFacetSitemapKey =
  | "bodyType"
  | "fuelType"
  | "bodyColour"
  | "driveType"
  | "transmission"
  /** Feed `Type` (e.g. CAR / TRU) — key is not `type` to avoid confusion with TS `type`. */
  | "vehicleType"
  | "year"
  | "price";

const STRING_FACET_FIELDS: Record<
  Exclude<InventoryPathFacetSitemapKey, "year" | "price">,
  keyof DealerVehicle
> = {
  bodyType: "BodyType",
  fuelType: "FuelType",
  bodyColour: "BodyColour",
  driveType: "DriveType",
  transmission: "TransmissionType",
  vehicleType: "Type",
};

const STRING_FACET_PRIORITY: Exclude<
  InventoryPathFacetSitemapKey,
  "year" | "price"
>[] = [
  "bodyType",
  "fuelType",
  "bodyColour",
  "driveType",
  "transmission",
  "vehicleType",
];

function vehiclePrice(v: DealerVehicle): number {
  const p =
    v.Pricing?.AdvertisedPrice?.trim() || v.Pricing?.DriveAwayPrice?.trim();
  if (!p) return 0;
  const n = Number(String(p).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function distinctFieldStrings(
  vehicles: DealerVehicle[],
  field: keyof DealerVehicle,
): string[] {
  const map = new Map<string, number>();
  for (const v of vehicles) {
    const raw = v[field];
    const key =
      typeof raw === "string" ? raw.trim() : raw != null ? String(raw) : "";
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.keys()].sort((a, b) => a.localeCompare(b, "en"));
}

export function makePathSlugSet(vehicles: DealerVehicle[]): Set<string> {
  const set = new Set<string>();
  for (const v of vehicles) {
    const slug = slugifyInventoryPart(v.Make ?? "");
    if (slug) set.add(slug);
  }
  return set;
}

export function isPriceBucketSlug(slug: string): boolean {
  return /^price-\d+-\d+$/.test(slug.trim().toLowerCase());
}

export function priceBucketSlug(lo: number, hi: number): string {
  return `price-${lo}-${hi}`;
}

export function parsePriceBucketSlug(
  slug: string,
): { lo: number; hi: number } | null {
  const key = slug.trim().toLowerCase();
  const m = /^price-(\d+)-(\d+)$/.exec(key);
  if (!m) return null;
  const lo = parseInt(m[1], 10);
  const hi = parseInt(m[2], 10);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return null;
  return { lo, hi };
}

function priceBucketHasInventory(
  vehicles: DealerVehicle[],
  lo: number,
  hi: number,
): boolean {
  for (const v of vehicles) {
    const p = vehiclePrice(v);
    if (p <= 0) continue;
    const bLo = Math.floor(p / PRICE_BUCKET_STEP) * PRICE_BUCKET_STEP;
    const bHi = bLo + PRICE_BUCKET_STEP;
    if (bLo === lo && bHi === hi) return true;
  }
  return false;
}

/** Distinct `price-{lo}-{hi}` slugs that match at least one vehicle bucket. */
export function distinctPriceBucketSlugs(vehicles: DealerVehicle[]): string[] {
  const set = new Set<string>();
  for (const v of vehicles) {
    const p = vehiclePrice(v);
    if (p <= 0) continue;
    const lo = Math.floor(p / PRICE_BUCKET_STEP) * PRICE_BUCKET_STEP;
    const hi = lo + PRICE_BUCKET_STEP;
    set.add(priceBucketSlug(lo, hi));
  }
  return [...set].sort((a, b) => a.localeCompare(b, "en"));
}

export function distinctYearPathSlugs(vehicles: DealerVehicle[]): string[] {
  const makeSlugs = makePathSlugSet(vehicles);
  const facetSlugs = buildFacetSlugResolutionMap(vehicles);
  const years = new Set<number>();
  for (const v of vehicles) {
    if (Number.isFinite(v.ManufactureYear)) years.add(v.ManufactureYear);
  }
  return [...years]
    .sort((a, b) => a - b)
    .map(String)
    .filter((slug) => {
      if (!/^\d{4}$/.test(slug)) return false;
      if (makeSlugs.has(slug)) return false;
      return !facetSlugs.has(slug);
    });
}

/**
 * When two facet values slugify to the same segment, first facet in priority
 * wins for `/search/{slug}` resolution; others omit that slug from sitemaps.
 */
export function buildFacetSlugResolutionMap(
  vehicles: DealerVehicle[],
): Map<string, { facet: InventoryPathFacetSitemapKey; raw: string }> {
  const makeSlugs = makePathSlugSet(vehicles);
  const map = new Map<string, { facet: InventoryPathFacetSitemapKey; raw: string }>();
  for (const facet of STRING_FACET_PRIORITY) {
    const field = STRING_FACET_FIELDS[facet];
    for (const raw of distinctFieldStrings(vehicles, field)) {
      const slug = slugifyInventoryPart(raw);
      if (!slug || !SEARCH_PATH_SLUG_RE.test(slug)) continue;
      if (makeSlugs.has(slug)) continue;
      if (/^\d{4}$/.test(slug)) continue;
      if (isPriceBucketSlug(slug)) continue;
      if (map.has(slug)) continue;
      map.set(slug, { facet, raw });
    }
  }
  return map;
}

export function pathSlugsForStringFacetSitemap(
  vehicles: DealerVehicle[],
  facet: Exclude<InventoryPathFacetSitemapKey, "year" | "price">,
): string[] {
  const map = buildFacetSlugResolutionMap(vehicles);
  return [...map.entries()]
    .filter(([, v]) => v.facet === facet)
    .map(([slug]) => slug)
    .sort((a, b) => a.localeCompare(b, "en"));
}

function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatPriceHero(lo: number, hi: number): string {
  return `$${lo.toLocaleString("en-AU")}–$${hi.toLocaleString("en-AU")}`;
}

export type SearchPathResolution =
  | {
      kind: "make";
      pathMakeFilter: string;
      heroLabel: string;
      pathAugment: Pick<InventoryFilterState, "make">;
    }
  | {
      kind: "facet";
      facet: InventoryPathFacetSitemapKey;
      heroLabel: string;
      pathAugment: Partial<InventoryFilterState>;
    };

export function resolveSearchPathSlug(
  slug: string,
  vehicles: DealerVehicle[],
): SearchPathResolution | null {
  const key = slug.trim().toLowerCase();
  if (!key) return null;

  if (isSearchMakePathAllowed(key, vehicles)) {
    const pathMakeFilter = resolveMakeFilterFromPathSlug(key, vehicles);
    return {
      kind: "make",
      pathMakeFilter,
      heroLabel: titleCaseFromSlug(key),
      pathAugment: { make: pathMakeFilter.trim().toLowerCase() },
    };
  }

  if (isPriceBucketSlug(key)) {
    const parsed = parsePriceBucketSlug(key);
    if (!parsed) return null;
    if (!priceBucketHasInventory(vehicles, parsed.lo, parsed.hi)) return null;
    return {
      kind: "facet",
      facet: "price",
      heroLabel: formatPriceHero(parsed.lo, parsed.hi),
      pathAugment: {
        minPrice: parsed.lo,
        maxPrice: parsed.hi,
      },
    };
  }

  if (/^\d{4}$/.test(key)) {
    const y = parseInt(key, 10);
    const hasYear = vehicles.some((v) => v.ManufactureYear === y);
    if (!hasYear) return null;
    const makeSlugs = makePathSlugSet(vehicles);
    if (makeSlugs.has(key)) return null;
    return {
      kind: "facet",
      facet: "year",
      heroLabel: String(y),
      pathAugment: { minYear: y, maxYear: y },
    };
  }

  const facetMap = buildFacetSlugResolutionMap(vehicles);
  const hit = facetMap.get(key);
  if (!hit) return null;

  const pathAugment: Partial<InventoryFilterState> = {};
  switch (hit.facet) {
    case "bodyType":
      pathAugment.bodyType = [hit.raw];
      break;
    case "fuelType":
      pathAugment.fuelType = [hit.raw];
      break;
    case "bodyColour":
      pathAugment.bodyColour = [hit.raw];
      break;
    case "driveType":
      pathAugment.driveType = [hit.raw];
      break;
    case "transmission":
      pathAugment.transmission = [hit.raw];
      break;
    case "vehicleType":
      pathAugment.type = [hit.raw];
      break;
    default:
      return null;
  }

  return {
    kind: "facet",
    facet: hit.facet,
    heroLabel: hit.raw,
    pathAugment,
  };
}

function isEmptyArray(a: string[] | undefined): boolean {
  return !a || a.length === 0;
}

export function mergePathAugmentIntoFilters(
  fromQuery: InventoryFilterState,
  augment: Partial<InventoryFilterState>,
): InventoryFilterState {
  const out = { ...fromQuery };
  if (!fromQuery.make?.trim() && augment.make?.trim()) {
    out.make = augment.make.trim().toLowerCase();
  }
  if (!fromQuery.model?.trim() && augment.model?.trim()) {
    out.model = augment.model.trim().toLowerCase();
  }
  if (isEmptyArray(fromQuery.bodyType) && augment.bodyType?.length) {
    out.bodyType = [...augment.bodyType];
  }
  if (isEmptyArray(fromQuery.fuelType) && augment.fuelType?.length) {
    out.fuelType = [...augment.fuelType];
  }
  if (isEmptyArray(fromQuery.bodyColour) && augment.bodyColour?.length) {
    out.bodyColour = [...augment.bodyColour];
  }
  if (isEmptyArray(fromQuery.driveType) && augment.driveType?.length) {
    out.driveType = [...augment.driveType];
  }
  if (isEmptyArray(fromQuery.transmission) && augment.transmission?.length) {
    out.transmission = [...augment.transmission];
  }
  if (isEmptyArray(fromQuery.type) && augment.type?.length) {
    out.type = [...augment.type];
  }
  if (
    fromQuery.minPrice === null &&
    fromQuery.maxPrice === null &&
    augment.minPrice !== null &&
    augment.minPrice !== undefined &&
    augment.maxPrice !== null &&
    augment.maxPrice !== undefined
  ) {
    out.minPrice = augment.minPrice;
    out.maxPrice = augment.maxPrice;
  }
  if (
    fromQuery.minYear === null &&
    fromQuery.maxYear === null &&
    augment.minYear !== null &&
    augment.minYear !== undefined &&
    augment.maxYear !== null &&
    augment.maxYear !== undefined
  ) {
    out.minYear = augment.minYear;
    out.maxYear = augment.maxYear;
  }
  return out;
}

export function mergeSearchPathIntoFilters(
  fromQuery: InventoryFilterState,
  resolution: SearchPathResolution,
): InventoryFilterState {
  if (resolution.kind === "make" && fromQuery.make?.trim()) return fromQuery;
  return mergePathAugmentIntoFilters(fromQuery, resolution.pathAugment);
}

export type PathSlugForListing = {
  slug: string;
  facet: InventoryPathFacetSitemapKey;
};

function activeFacetDims(f: InventoryFilterState): number {
  let n = 0;
  if (f.bodyType.length) n++;
  if (f.fuelType.length) n++;
  if (f.bodyColour.length) n++;
  if (f.driveType.length) n++;
  if (f.transmission.length) n++;
  if (f.type.length) n++;
  if (f.minPrice !== null || f.maxPrice !== null) n++;
  if (f.minYear !== null || f.maxYear !== null) n++;
  return n;
}

/**
 * When filters are representable as a single `/search/{slug}` (no make in state),
 * returns slug metadata for {@link inventoryListingHref}.
 */
export function pathSlugForInventoryListing(
  f: InventoryFilterState,
  vehicles?: DealerVehicle[],
): PathSlugForListing | null {
  if (f.make.trim()) return null;

  if (f.q.trim() || f.condition || f.sort !== "best") {
    return null;
  }

  if (activeFacetDims(f) !== 1) return null;

  if (f.bodyType.length === 1) {
    const slug = slugifyInventoryPart(f.bodyType[0]);
    if (!slug || !SEARCH_PATH_SLUG_RE.test(slug)) return null;
    if (vehicles) {
      const r = resolveSearchPathSlug(slug, vehicles);
      if (!r || r.kind !== "facet" || r.facet !== "bodyType") return null;
    }
    return { slug, facet: "bodyType" };
  }
  if (f.fuelType.length === 1) {
    const slug = slugifyInventoryPart(f.fuelType[0]);
    if (!slug || !SEARCH_PATH_SLUG_RE.test(slug)) return null;
    if (vehicles) {
      const r = resolveSearchPathSlug(slug, vehicles);
      if (!r || r.kind !== "facet" || r.facet !== "fuelType") return null;
    }
    return { slug, facet: "fuelType" };
  }
  if (f.bodyColour.length === 1) {
    const slug = slugifyInventoryPart(f.bodyColour[0]);
    if (!slug || !SEARCH_PATH_SLUG_RE.test(slug)) return null;
    if (vehicles) {
      const r = resolveSearchPathSlug(slug, vehicles);
      if (!r || r.kind !== "facet" || r.facet !== "bodyColour") return null;
    }
    return { slug, facet: "bodyColour" };
  }
  if (f.driveType.length === 1) {
    const slug = slugifyInventoryPart(f.driveType[0]);
    if (!slug || !SEARCH_PATH_SLUG_RE.test(slug)) return null;
    if (vehicles) {
      const r = resolveSearchPathSlug(slug, vehicles);
      if (!r || r.kind !== "facet" || r.facet !== "driveType") return null;
    }
    return { slug, facet: "driveType" };
  }
  if (f.transmission.length === 1) {
    const slug = slugifyInventoryPart(f.transmission[0]);
    if (!slug || !SEARCH_PATH_SLUG_RE.test(slug)) return null;
    if (vehicles) {
      const r = resolveSearchPathSlug(slug, vehicles);
      if (!r || r.kind !== "facet" || r.facet !== "transmission") return null;
    }
    return { slug, facet: "transmission" };
  }
  if (f.type.length === 1) {
    const slug = slugifyInventoryPart(f.type[0]);
    if (!slug || !SEARCH_PATH_SLUG_RE.test(slug)) return null;
    if (vehicles) {
      const r = resolveSearchPathSlug(slug, vehicles);
      if (!r || r.kind !== "facet" || r.facet !== "vehicleType") return null;
    }
    return { slug, facet: "vehicleType" };
  }

  if (
    f.minYear !== null &&
    f.maxYear !== null &&
    f.minYear === f.maxYear &&
    f.minYear >= 1900 &&
    f.minYear <= 2100
  ) {
    const slug = String(f.minYear);
    if (vehicles) {
      const r = resolveSearchPathSlug(slug, vehicles);
      if (!r || r.kind !== "facet" || r.facet !== "year") return null;
    }
    return { slug, facet: "year" };
  }

  if (
    f.minPrice !== null &&
    f.maxPrice !== null &&
    f.minPrice < f.maxPrice &&
    f.minPrice % PRICE_BUCKET_STEP === 0 &&
    f.maxPrice === f.minPrice + PRICE_BUCKET_STEP
  ) {
    const slug = priceBucketSlug(f.minPrice, f.maxPrice);
    if (vehicles) {
      const r = resolveSearchPathSlug(slug, vehicles);
      if (!r || r.kind !== "facet" || r.facet !== "price") return null;
    }
    return { slug, facet: "price" };
  }

  return null;
}

export function serializeOmitKeysForPathFacet(
  facet: InventoryPathFacetSitemapKey,
): Set<string> {
  const s = new Set<string>();
  switch (facet) {
    case "bodyType":
      s.add("bodyType");
      break;
    case "fuelType":
      s.add("fuelType");
      break;
    case "bodyColour":
      s.add("bodyColour");
      break;
    case "driveType":
      s.add("driveType");
      break;
    case "transmission":
      s.add("transmission");
      break;
    case "vehicleType":
      s.add("type");
      break;
    case "year":
      s.add("minYear");
      s.add("maxYear");
      break;
    case "price":
      s.add("minPrice");
      s.add("maxPrice");
      break;
    default:
      break;
  }
  return s;
}

export function inventoryPathFacetSitemapUrls(
  origin: string,
  vehicles: DealerVehicle[],
  facet: InventoryPathFacetSitemapKey,
): Array<{ loc: string }> {
  if (facet === "year") {
    return distinctYearPathSlugs(vehicles).map((slug) => ({
      loc: `${origin}/search/${slug}`,
    }));
  }
  if (facet === "price") {
    return distinctPriceBucketSlugs(vehicles).map((slug) => ({
      loc: `${origin}/search/${slug}`,
    }));
  }
  return pathSlugsForStringFacetSitemap(vehicles, facet).map((slug) => ({
    loc: `${origin}/search/${slug}`,
  }));
}
