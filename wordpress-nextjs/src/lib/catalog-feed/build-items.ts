import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import {
  buildVehicleListingDescription,
  upgradeHttpToHttpsUrl,
} from "@/lib/json-ld";
import {
  dealerVehicleToListing,
  inventoryPriceField,
  listingDisplayNumericPriceAud,
  parseInventoryOdometerKm,
  priceNumber,
} from "@/lib/inventory/transform";
import { resolveSitemapOrigin } from "@/lib/sitemap-xml";
import type { DealerVehicle, VehicleListing } from "@/types/inventory";
import { extractVinFromDealerVehicle } from "./extract-vin";
import type { CatalogFeedItem } from "./types";

const SITE_NAME = "Car Sales Brisbane";
const GOOGLE_PRODUCT_CATEGORY = "916";

export { GOOGLE_PRODUCT_CATEGORY, SITE_NAME };

function catalogOfferPriceAud(
  v: DealerVehicle,
  listing: VehicleListing,
): number | null {
  const fromListing = listingDisplayNumericPriceAud(listing);
  if (fromListing != null) return fromListing;

  const advertised = inventoryPriceField(v.Pricing?.AdvertisedPrice);
  const driveAway = inventoryPriceField(v.Pricing?.DriveAwayPrice);
  const primary =
    listing.show_drive_away && driveAway ? driveAway : advertised || driveAway;

  const candidates: Array<string | number | undefined | null> = [
    primary,
    advertised,
    driveAway,
    listing.formatted_price,
    listing.drive_away_price ?? undefined,
    inventoryPriceField(v.Pricing?.EGCPrice),
  ];

  if (v.Pricing && typeof v.Pricing === "object") {
    for (const val of Object.values(v.Pricing)) {
      if (typeof val === "boolean") continue;
      if (typeof val === "number" || typeof val === "string") {
        candidates.push(val);
      }
    }
  }

  for (const raw of candidates) {
    const n = priceNumber(raw);
    if (n != null && n > 0 && Number.isFinite(n)) return n;
  }

  return null;
}

function catalogId(v: DealerVehicle, listing: VehicleListing): string {
  const sku = listing.stock_number.trim();
  if (sku) return sku;
  return String(v.ItemID);
}

/** Dealer headline for `title` (make / model / year are separate columns, before title). */
function catalogTitle(listing: VehicleListing): string {
  const fromListing = listing.title.trim();
  if (fromListing) return fromListing;
  const make = listing.make.trim();
  const model = listing.model.trim();
  const year =
    listing.year != null && Number.isFinite(listing.year) ? listing.year : null;
  return [year, make, model].filter(Boolean).join(" ").trim() || "Vehicle";
}

function catalogLocation(listing: VehicleListing, v: DealerVehicle): string {
  return v.Location?.trim() || listing.location_short.trim() || "";
}

function normalizeCondition(listing: VehicleListing): "new" | "used" {
  return (listing.condition || "used").trim().toLowerCase() === "new"
    ? "new"
    : "used";
}

function resolveYear(listing: VehicleListing, v: DealerVehicle): number | null {
  const y = listing.year ?? v.ManufactureYear;
  if (y == null || !Number.isFinite(Number(y))) return null;
  const n = Math.round(Number(y));
  return n > 0 ? n : null;
}

/** Whole dollars + space + AUD (Google Merchant + Meta catalog). */
export function formatCatalogPriceAud(amount: number): string {
  return `${Math.round(amount)} AUD`;
}

const ODOMETER_UNIT_KM = "km";

function catalogOdometer(
  listing: VehicleListing,
  v: DealerVehicle,
): { value: string; unit: string } {
  const km =
    parseInventoryOdometerKm(listing.odometer) ??
    parseInventoryOdometerKm(v.Odometer);
  if (km == null || km < 0) return { value: "", unit: "" };
  return { value: String(Math.round(km)), unit: ODOMETER_UNIT_KM };
}

export function vehicleToCatalogItem(
  origin: string,
  v: DealerVehicle,
): CatalogFeedItem | null {
  const listing = dealerVehicleToListing(v);
  const priceAud = catalogOfferPriceAud(v, listing);
  const imageRaw = listing.featured_image || v.Photos?.[0]?.PhotoUrl || "";
  const imageLink = upgradeHttpToHttpsUrl(imageRaw.trim());

  if (!imageLink || priceAud == null) return null;

  const siteOrigin = upgradeHttpToHttpsUrl(origin.replace(/\/$/, ""));
  const link = upgradeHttpToHttpsUrl(`${siteOrigin}/cars/${listing.slug}`);
  const additionalImageLinks = (v.Photos ?? [])
    .map((p) => upgradeHttpToHttpsUrl(p.PhotoUrl?.trim() || ""))
    .filter((url) => url && url !== imageLink)
    .slice(0, 9);

  const make = listing.make.trim() || v.Make?.trim() || "";
  const model = listing.model.trim() || v.Model?.trim() || "";
  const year = resolveYear(listing, v);
  const location = catalogLocation(listing, v);
  const description = buildVehicleListingDescription(listing, v)
    .trim()
    .slice(0, 5000);

  return {
    id: catalogId(v, listing),
    title: catalogTitle(listing),
    description,
    link,
    imageLink,
    additionalImageLinks,
    priceAud,
    priceFormatted: formatCatalogPriceAud(priceAud),
    availability: "in stock",
    condition: normalizeCondition(listing),
    make,
    model,
    year,
    location,
    odometer: catalogOdometer(listing, v),
    fuel_type: listing.fuel_type.trim() || v.FuelType?.trim() || "",
    transmission:
      listing.transmission.trim() || v.TransmissionType?.trim() || "",
    vin: extractVinFromDealerVehicle(v),
  };
}

export async function buildCatalogFeedItems(): Promise<{
  origin: string;
  items: CatalogFeedItem[];
}> {
  const origin = await resolveSitemapOrigin();
  const vehicles = await fetchDealerInventory();
  const seen = new Set<string>();
  const items: CatalogFeedItem[] = [];

  for (const v of vehicles) {
    const item = vehicleToCatalogItem(origin, v);
    if (!item) continue;
    const key = item.link.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
  }

  return { origin, items };
}
