import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import { dealerVehicleToListing } from "@/lib/inventory/transform";
import { buildVehicleSlug, findVehicleByPublicSlug } from "@/lib/inventory/slug";
import type { DealerVehicle, VehicleListing } from "@/types/inventory";
import { buildVehicleVdpSnapshot } from "./vehicleVdpTypes";
import type { VehicleVdpSnapshot } from "./vehicleVdpTypes";
import { getVehicleVdpAiContent } from "./vehicleVdpCopy";
import type { VehicleVdpAiContent } from "./vehicleVdpTypes";

export type LoadVehicleVdpBySlugResult =
  | {
      ok: true;
      vehicle: DealerVehicle;
      listing: VehicleListing;
      snapshot: VehicleVdpSnapshot;
      ai: VehicleVdpAiContent;
      /** Full feed (for similar vehicles without a second fetch). */
      allVehicles: DealerVehicle[];
    }
  | { ok: false; error: "not_found" }
  | { ok: false; error: "redirect"; redirectTo: string };

/**
 * Resolves inventory + AI VDP copy for a public slug (same rules as /cars/[slug]).
 * Redirect targets are canonical `/cars/{slug}` (no /preview segment).
 */
export async function loadVehicleVdpBySlug(
  slug: string
): Promise<LoadVehicleVdpBySlugResult> {
  const trimmed = slug.trim();
  const all = await fetchDealerInventory();

  if (/^\d+$/.test(trimmed)) {
    const legacy = all.find((x) => String(x.ItemID) === trimmed);
    if (!legacy) return { ok: false, error: "not_found" };
    return {
      ok: false,
      error: "redirect",
      redirectTo: `/cars/${buildVehicleSlug(legacy)}`,
    };
  }

  const v = findVehicleByPublicSlug(all, trimmed);
  if (!v) return { ok: false, error: "not_found" };

  const canonicalSlug = buildVehicleSlug(v);
  if (trimmed.toLowerCase() !== canonicalSlug.toLowerCase()) {
    return {
      ok: false,
      error: "redirect",
      redirectTo: `/cars/${canonicalSlug}`,
    };
  }

  const listing = dealerVehicleToListing(v);
  const snapshot = buildVehicleVdpSnapshot(v, listing);
  const ai = await getVehicleVdpAiContent(snapshot);

  return { ok: true, vehicle: v, listing, snapshot, ai, allVehicles: all };
}
