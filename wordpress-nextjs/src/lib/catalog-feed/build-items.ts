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

function mapStateOfVehicle(
  listing: VehicleListing,
): "USED" | "NEW" | "CPO" {
  const raw = (listing.condition || "").trim().toLowerCase();
  if (raw === "new") return "NEW";
  if (raw === "cpo" || raw.includes("certified")) return "CPO";
  return "USED";
}

function normalizeCondition(listing: VehicleListing): "new" | "used" {
  return (listing.condition || "used").trim().toLowerCase() === "new"
    ? "new"
    : "used";
}

function catalogDescriptionLine(
  listing: VehicleListing,
  make: string,
  model: string,
  year: number | null,
): string {
  const raw = (listing.condition || "used").trim().toLowerCase();
  const conditionLabel = raw === "new" ? "New" : raw === "cpo" ? "CPO" : "Used";
  const yearLabel = year != null ? String(year) : "";
  const makeModel = [make, model].filter(Boolean).join(" ").trim();
  const headline = [conditionLabel, yearLabel, makeModel].filter(Boolean).join(" ").trim();
  return headline ? `${headline} for sale` : "";
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

function splitAddress(input: string): {
  addr1: string;
  city: string;
  postal_code: string;
  country: string;
} {
  const empty = {
    addr1: "",
    city: "",
    postal_code: "",
    country: "AU",
  };
  const t = input.trim();
  if (!t) return empty;

  const parts = t.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 4) {
    return {
      addr1: parts[0] || "",
      city: parts[1] || "",
      postal_code: parts[3]?.replace(/\D/g, "") || "",
      country: parts[4] || "AU",
    };
  }

  if (parts.length === 3) {
    const regionPostal = parts[2].match(/^([A-Za-z]{2,4})\s+(\d{4})$/);
    return {
      addr1: parts[0] || "",
      city: parts[1] || "",
      postal_code: regionPostal?.[2] || "",
      country: "AU",
    };
  }

  return { ...empty, addr1: t };
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
  const address = splitAddress(location);
  const descriptionTemplate = catalogDescriptionLine(listing, make, model, year);
  const descriptionFallback = buildVehicleListingDescription(listing, v)
    .trim()
    .slice(0, 5000);
  const description = descriptionTemplate || descriptionFallback;

  return {
    id: catalogId(v, listing),
    vehicle_id: catalogId(v, listing),
    sku: listing.stock_number.trim() || v.SKU?.trim() || "",
    title: catalogTitle(listing),
    description,
    link,
    imageLink,
    additionalImageLinks,
    priceAud,
    priceFormatted: formatCatalogPriceAud(priceAud),
    availability: "in stock",
    state_of_vehicle: mapStateOfVehicle(listing),
    condition: normalizeCondition(listing),
    make,
    model,
    year,
    location,
    address,
    odometer: catalogOdometer(listing, v),
    exterior_color: (v.BodyColour || "").trim(),
    body_style: (listing.body_type || v.BodyType || "").trim(),
    drivetrain: (listing.drive_type || v.DriveType || "").trim(),
    vehicle_type: (listing.type_code || v.Type || "").trim(),
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
