import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import {
  buildVehicleListingDescription,
  upgradeHttpToHttpsUrl,
} from "@/lib/json-ld";
import {
  dealerVehicleToListing,
  inventoryPriceField,
  listingDisplayNumericPriceAud,
  priceNumber,
} from "@/lib/inventory/transform";
import { resolveSitemapOrigin } from "@/lib/sitemap-xml";
import type { DealerVehicle, VehicleListing } from "@/types/inventory";
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

function catalogTitle(listing: VehicleListing): string {
  const make = listing.make.trim();
  const model = listing.model.trim();
  const year =
    listing.year != null && Number.isFinite(listing.year) ? listing.year : null;
  const built = [year, make, model].filter(Boolean).join(" ").trim();
  const fromListing = listing.title.trim();
  return built || fromListing || "Vehicle";
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

function formatGooglePriceAud(amount: number): string {
  return `${amount.toFixed(2)} AUD`;
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

  const description = buildVehicleListingDescription(listing, v);
  const brand = listing.make.trim() || v.Make?.trim() || "";
  const model = listing.model.trim() || v.Model?.trim() || "";

  return {
    id: catalogId(v, listing),
    title: catalogTitle(listing),
    description,
    link,
    imageLink,
    additionalImageLinks,
    priceAud,
    priceFormatted: formatGooglePriceAud(priceAud),
    availability: "in stock",
    condition: normalizeCondition(listing),
    brand,
    model,
    year: resolveYear(listing, v),
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
