import type { DealerVehicle } from "@/types/inventory";

const MAX_PART_LEN = 48;

/**
 * Lowercase URL segment: alphanumerics and hyphens only.
 * e.g. "Metallic Grey" -> "metallic-grey"
 */
export function slugifyInventoryPart(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_PART_LEN);
}

function conditionSegment(condition: string | undefined): string {
  const c = (condition ?? "").trim().toLowerCase();
  if (c === "new") return "new";
  if (c === "used" || c === "") return "used";
  return slugifyInventoryPart(condition ?? "") || "used";
}

function colourSegment(colour: string | undefined): string {
  return slugifyInventoryPart(colour ?? "") || "unknown";
}

function stockSegment(v: DealerVehicle): string {
  const sku = v.SKU?.trim();
  if (sku) {
    const compact = sku.replace(/\s+/g, "");
    const slug = slugifyInventoryPart(compact);
    if (slug) return slug;
  }
  return `id-${v.ItemID}`;
}

/**
 * SEO slug like: used-green-2008-ford-falcon-00102606
 */
export function buildVehicleSlug(v: DealerVehicle): string {
  const year = Number.isFinite(v.ManufactureYear)
    ? String(v.ManufactureYear)
    : "0";
  const make = slugifyInventoryPart(v.Make) || "make";
  const model = slugifyInventoryPart(v.Model) || "model";

  return [
    conditionSegment(v.Condition),
    colourSegment(v.BodyColour),
    year,
    make,
    model,
    stockSegment(v),
  ].join("-");
}

/**
 * Resolve a vehicle by public slug. Supports legacy numeric ItemID.
 */
export function findVehicleByPublicSlug(
  vehicles: DealerVehicle[],
  slug: string
): DealerVehicle | undefined {
  const key = slug.trim().toLowerCase();
  if (!key) return undefined;

  if (/^\d+$/.test(key)) {
    const id = Number(key);
    return vehicles.find((v) => v.ItemID === id);
  }

  return vehicles.find((v) => buildVehicleSlug(v).toLowerCase() === key);
}
