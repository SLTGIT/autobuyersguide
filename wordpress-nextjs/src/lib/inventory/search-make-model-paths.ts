import type { DealerVehicle } from "@/types/inventory";
import type { InventoryFilterState } from "@/types/inventory";
import { slugifyInventoryPart } from "@/lib/inventory/slug";
import {
  isSearchMakePathAllowed,
  resolveMakeFilterFromPathSlug,
} from "@/lib/research/research-make-slugs";

export type MakeModelPathResolution = {
  pathAugment: Pick<InventoryFilterState, "make" | "model">;
  heroLabel: string;
  breadcrumb: {
    parent: { name: string; href: string };
    current: string;
  };
};

/**
 * Resolve `/search/{makeSlug}/{modelSlug}` when both segments match inventory
 * (allowed make path + model on at least one vehicle of that make).
 */
export function resolveMakeModelFromPathSlugs(
  makeSlug: string,
  modelSlug: string,
  vehicles: DealerVehicle[],
): MakeModelPathResolution | null {
  const ms = makeSlug.trim().toLowerCase();
  const mdl = modelSlug.trim().toLowerCase();
  if (!ms || !mdl) return null;
  if (!isSearchMakePathAllowed(ms, vehicles)) return null;

  const makeFilter = resolveMakeFilterFromPathSlug(ms, vehicles);

  for (const v of vehicles) {
    const rawMake = v.Make?.trim();
    const rawModel = v.Model?.trim();
    if (!rawMake || !rawModel) continue;
    if (slugifyInventoryPart(rawMake) !== ms) continue;
    if (slugifyInventoryPart(rawModel) !== mdl) continue;

    const modelFilter = rawModel.toLowerCase();
    const heroLabel = `${rawMake} ${rawModel}`;
    return {
      pathAugment: {
        make: makeFilter.trim().toLowerCase(),
        model: modelFilter,
      },
      heroLabel,
      breadcrumb: {
        parent: {
          name: rawMake,
          href: `/search/${ms}`,
        },
        current: rawModel,
      },
    };
  }
  return null;
}

/** Distinct make/model pairs for `inventory-make-model.xml` (same path rules as listing pages). */
export function allInventoryMakeModelSitemapUrls(
  origin: string,
  vehicles: DealerVehicle[],
): Array<{ loc: string }> {
  const seen = new Set<string>();
  const rows: Array<{ loc: string }> = [];
  for (const v of vehicles) {
    const rawMake = v.Make?.trim();
    const rawModel = v.Model?.trim();
    if (!rawMake || !rawModel) continue;
    const makeSlug = slugifyInventoryPart(rawMake);
    const modelSlug = slugifyInventoryPart(rawModel);
    if (!makeSlug || !modelSlug) continue;
    if (!isSearchMakePathAllowed(makeSlug, vehicles)) continue;
    const key = `${makeSlug}/${modelSlug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ loc: `${origin}/search/${makeSlug}/${modelSlug}` });
  }
  rows.sort((a, b) => a.loc.localeCompare(b.loc, "en"));
  return rows;
}
