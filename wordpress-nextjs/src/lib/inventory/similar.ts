import type { DealerVehicle } from "@/types/inventory";

/**
 * Prefer same make, then same body type, excluding current vehicle.
 */
export function getSimilarVehicles(
  all: DealerVehicle[],
  current: DealerVehicle,
  limit = 6
): DealerVehicle[] {
  const id = current.ItemID;
  const make = current.Make.trim().toLowerCase();
  const body = current.BodyType.trim().toLowerCase();

  const sameMake = all.filter(
    (v) => v.ItemID !== id && v.Make.trim().toLowerCase() === make
  );
  if (sameMake.length >= limit) return sameMake.slice(0, limit);

  const rest = all.filter(
    (v) =>
      v.ItemID !== id &&
      !sameMake.some((s) => s.ItemID === v.ItemID) &&
      body &&
      v.BodyType.trim().toLowerCase() === body
  );
  const merged = [...sameMake, ...rest];
  if (merged.length >= limit) return merged.slice(0, limit);

  const filler = all.filter(
    (v) => v.ItemID !== id && !merged.some((m) => m.ItemID === v.ItemID)
  );
  return [...merged, ...filler].slice(0, limit);
}
