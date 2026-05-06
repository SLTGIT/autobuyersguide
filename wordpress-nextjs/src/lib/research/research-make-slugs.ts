import type { DealerVehicle } from "@/types/inventory";
import { slugifyInventoryPart } from "@/lib/inventory/slug";

/**
 * Make path segments for `/search/{slug}` and `inventory-make.xml` come
 * only from the Dealer Solutions inventory feed (distinct `Make` values).
 */

export const SEARCH_MAKE_PATH_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugFromInventoryMake(raw: string): string | null {
  const s = slugifyInventoryPart(raw.trim());
  return s || null;
}

/** Distinct make path slugs derived from current inventory `Make` values. */
export function researchSlugsFromInventory(vehicles: DealerVehicle[]): string[] {
  const set = new Set<string>();
  for (const v of vehicles) {
    const slug = slugFromInventoryMake(v.Make ?? "");
    if (slug) set.add(slug);
  }
  return [...set];
}

/** Sorted slugs for sitemaps (same set as {@link researchSlugsFromInventory}). */
export function allResearchMakeSlugs(vehicles: DealerVehicle[]): string[] {
  return researchSlugsFromInventory(vehicles).sort((a, b) =>
    a.localeCompare(b, "en"),
  );
}

export function isSearchMakePathAllowed(
  slug: string,
  vehicles: DealerVehicle[],
): boolean {
  const key = slug.trim().toLowerCase();
  if (!SEARCH_MAKE_PATH_SLUG_RE.test(key)) return false;
  const allowed = new Set(researchSlugsFromInventory(vehicles));
  return allowed.has(key);
}

/** Map `/search/{slug}` segment to the lowercase `make` filter value used in inventory. */
export function resolveMakeFilterFromPathSlug(
  slug: string,
  vehicles: DealerVehicle[],
): string {
  const key = slug.trim().toLowerCase();
  for (const v of vehicles) {
    const raw = v.Make?.trim();
    if (!raw) continue;
    if (slugifyInventoryPart(raw) === key) return raw.toLowerCase();
  }
  return key.replace(/-/g, " ").toLowerCase();
}
