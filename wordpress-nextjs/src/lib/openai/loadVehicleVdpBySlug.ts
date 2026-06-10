import { cache } from "react";
import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import { dealerVehicleToListing } from "@/lib/inventory/transform";
import { buildVehicleSlug, findVehicleByPublicSlug } from "@/lib/inventory/slug";
import type { DealerVehicle, VehicleListing } from "@/types/inventory";
import { buildVehicleVdpSnapshot } from "./vehicleVdpTypes";
import type { VehicleVdpSnapshot } from "./vehicleVdpTypes";
import {
  buildVehicleVdpFallbackSeo,
  getVehicleVdpAiContent,
} from "./vehicleVdpCopy";
import type { VehicleVdpAiContent } from "./vehicleVdpTypes";

const getDealerInventoryCached = cache(fetchDealerInventory);

type ResolveSlugResult =
  | { status: "not_found" }
  | { status: "redirect"; redirectTo: string }
  | { status: "ok"; vehicle: DealerVehicle };

function resolvePublicVehicleSlug(
  slug: string,
  all: DealerVehicle[],
): ResolveSlugResult {
  const trimmed = slug.trim();

  if (/^\d+$/.test(trimmed)) {
    const legacy = all.find((x) => String(x.ItemID) === trimmed);
    if (!legacy) return { status: "not_found" };
    return {
      status: "redirect",
      redirectTo: `/cars/${buildVehicleSlug(legacy)}`,
    };
  }

  const v = findVehicleByPublicSlug(all, trimmed);
  if (!v) return { status: "not_found" };

  const canonicalSlug = buildVehicleSlug(v);
  if (trimmed.toLowerCase() !== canonicalSlug.toLowerCase()) {
    return {
      status: "redirect",
      redirectTo: `/cars/${canonicalSlug}`,
    };
  }

  return { status: "ok", vehicle: v };
}

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

export type LoadVehicleVdpMetaResult =
  | {
      ok: true;
      vehicle: DealerVehicle;
      listing: VehicleListing;
      snapshot: VehicleVdpSnapshot;
      seoTitle: string;
      metaDescription: string;
      featuredImage: string;
      canonicalPath: string;
    }
  | { ok: false; error: "not_found" }
  | { ok: false; error: "redirect"; redirectTo: string };

/**
 * Fast metadata path: inventory + fallback SEO only (no OpenAI wait).
 */
export const loadVehicleVdpMetaBySlug = cache(
  async (slug: string): Promise<LoadVehicleVdpMetaResult> => {
    const all = await getDealerInventoryCached();
    const resolved = resolvePublicVehicleSlug(slug, all);
    if (resolved.status === "not_found") {
      return { ok: false, error: "not_found" };
    }
    if (resolved.status === "redirect") {
      return { ok: false, error: "redirect", redirectTo: resolved.redirectTo };
    }

    const v = resolved.vehicle;
    const listing = dealerVehicleToListing(v);
    const snapshot = buildVehicleVdpSnapshot(v, listing);
    const { seoTitle, metaDescription } = buildVehicleVdpFallbackSeo(snapshot);
    const featuredImage =
      v.Photos?.[0]?.PhotoUrl ?? listing.featured_image ?? "";
    const canonicalPath = `/cars/${buildVehicleSlug(v)}`;

    return {
      ok: true,
      vehicle: v,
      listing,
      snapshot,
      seoTitle,
      metaDescription,
      featuredImage,
      canonicalPath,
    };
  },
);

/**
 * Resolves inventory + AI VDP copy for a public slug (same rules as /cars/[slug]).
 * Redirect targets are canonical `/cars/{slug}` (no /preview segment).
 */
export const loadVehicleVdpBySlug = cache(
  async (slug: string): Promise<LoadVehicleVdpBySlugResult> => {
    const all = await getDealerInventoryCached();
    const resolved = resolvePublicVehicleSlug(slug, all);
    if (resolved.status === "not_found") {
      return { ok: false, error: "not_found" };
    }
    if (resolved.status === "redirect") {
      return { ok: false, error: "redirect", redirectTo: resolved.redirectTo };
    }

    const v = resolved.vehicle;
    const listing = dealerVehicleToListing(v);
    const snapshot = buildVehicleVdpSnapshot(v, listing);
    const ai = await getVehicleVdpAiContent(snapshot);

    return { ok: true, vehicle: v, listing, snapshot, ai, allVehicles: all };
  },
);
