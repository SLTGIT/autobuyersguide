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

/** Legacy URLs included `unknown` when BodyColour was missing; kept for lookup only. */
function colourSegmentLegacy(colour: string | undefined): string {
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
 * Public slug: condition, optional colour, year, make, model, stock.
 * When BodyColour is empty, no colour segment (avoids `used-unknown-2013-...`).
 * Example: used-2013-whittley-cruiser-2080-00101806
 */
export function buildVehicleSlug(v: DealerVehicle): string {
  const year = Number.isFinite(v.ManufactureYear)
    ? String(v.ManufactureYear)
    : "0";
  const make = slugifyInventoryPart(v.Make) || "make";
  const model = slugifyInventoryPart(v.Model) || "model";
  const colour = slugifyInventoryPart(v.BodyColour ?? "");

  const parts: string[] = [conditionSegment(v.Condition)];
  if (colour) parts.push(colour);
  parts.push(year, make, model, stockSegment(v));

  return parts.join("-");
}

/** Same as pre-fix slugs (includes `unknown` when colour missing) — for resolving old links. */
function buildVehicleSlugLegacy(v: DealerVehicle): string {
  const year = Number.isFinite(v.ManufactureYear)
    ? String(v.ManufactureYear)
    : "0";
  const make = slugifyInventoryPart(v.Make) || "make";
  const model = slugifyInventoryPart(v.Model) || "model";

  return [
    conditionSegment(v.Condition),
    colourSegmentLegacy(v.BodyColour),
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

  return (
    vehicles.find((v) => buildVehicleSlug(v).toLowerCase() === key) ||
    vehicles.find((v) => buildVehicleSlugLegacy(v).toLowerCase() === key)
  );
}
