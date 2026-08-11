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

/** Stock / vehicle_id values omitted from Meta and Google catalog feeds. */
const CATALOG_FEED_EXCLUDED_VEHICLE_IDS = new Set(["00101806"]);

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

function normalizeBodyStyle(raw: string): string {
  const t = (raw || "").trim().toLowerCase();
  if (!t) return "OTHER";
  if (/cab\s*chassis/.test(t)) return "TRUCK";
  if (/dual\s*cab\s*utility/.test(t)) return "PICKUP";
  if (/pickup\s*crew\s*cab/.test(t)) return "PICKUP";
  if (/utility/.test(t)) return "PICKUP";
  if (/wagon/.test(t)) return "WAGON";
  if (/suv|crossover/.test(t)) return "SUV";
  if (/hatch/.test(t)) return "HATCHBACK";
  if (/ute|pickup|pick-up/.test(t)) return "PICKUP";
  if (/truck/.test(t)) return "TRUCK";
  if (/van|people mover|peoplemover/.test(t)) return "VAN";
  if (/sedan|saloon/.test(t)) return "SEDAN";
  if (/coupe/.test(t)) return "COUPE";
  if (/convertible|cabriolet|roadster/.test(t)) return "CONVERTIBLE";
  if (/boat|marine|vessel/.test(t)) return "OTHER";
  return "OTHER";
}

function normalizeFuelType(raw: string): string {
  const t = (raw || "").trim().toLowerCase();
  if (!t) return "";
  if (/hybrid|phev|plug[-\s]?in/.test(t)) return "HYBRID";
  if (/electric|ev/.test(t)) return "ELECTRIC";
  if (/diesel/.test(t)) return "DIESEL";
  if (/petrol|gasoline|unleaded/.test(t)) return "PETROL";
  if (/lpg|cng|gas/.test(t)) return "GAS";
  return t.toUpperCase();
}

function normalizeTransmission(raw: string): string {
  const t = (raw || "").trim().toLowerCase();
  if (!t) return "";
  if (/manual/.test(t)) return "MANUAL";
  if (/auto|automatic|cvt|dct|tiptronic/.test(t)) return "AUTOMATIC";
  return "AUTOMATIC";
}

function normalizeVehicleType(raw: string): string {
  const t = (raw || "").trim().toLowerCase();
  if (!t) return "CAR_TRUCK";
  if (/boat|marine|vessel/.test(t)) return "BOAT";
  if (t === "car") return "CAR_TRUCK";
  return "CAR_TRUCK";
}

function normalizeDrivetrain(raw: string): string {
  const t = (raw || "").trim().toUpperCase();
  if (!t) return "";
  if (t === "4WD") return "4X4";
  if (t === "4X4") return "4X4";
  return t;
}

function inferBoatFromVehicle(v: DealerVehicle, listing: VehicleListing): boolean {
  const text = [
    v.Type,
    listing.type_code,
    v.BodyType,
    listing.body_type,
    v.Make,
    v.Model,
    listing.title,
    v.Description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/landcruiser/.test(text)) return false;
  return /boat|marine|vessel|outboard|stern\s*drive|trailer\s*boat|whittley/.test(text);
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

/** Force feed image URLs to absolute HTTP. */
function normalizeFeedImageUrl(raw: string): string {
  const t = (raw || "").trim();
  if (!t) return "";
  if (/^http:\/\//i.test(t)) return t;
  if (/^https:\/\//i.test(t)) return `http://${t.slice(8)}`;
  if (t.startsWith("//")) return `http:${t}`;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(?:\/|$)/i.test(t)) return `http://${t}`;
  return "";
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

const AU_STATE_RE = /^(ACT|NSW|NT|QLD|SA|TAS|VIC|WA)$/i;
const AU_STATE_POSTCODE_SUFFIX_RE =
  /\s+(ACT|NSW|NT|QLD|SA|TAS|VIC|WA)(?:\s+(\d{4}))?\s*$/i;

/** e.g. `22`, `54-56`, `22A` when street name is in the next comma segment */
function isStreetNumberOnly(segment: string): boolean {
  return /^\d+[A-Za-z]?(?:\s*[-–]\s*\d+[A-Za-z]?)?$/.test(segment.trim());
}

/** Split "Tombo Street Capalaba" → street line + suburb. */
function splitStreetLineAndSuburb(line: string): {
  street: string;
  suburb: string;
} {
  const t = line.replace(/\s+/g, " ").trim();
  if (!t) return { street: "", suburb: "" };

  const suffixRe =
    /\b(street|st|road|rd|avenue|ave|drive|dr|court|ct|way|parade|pde|boulevard|blvd|lane|ln|crescent|cres|place|pl|terrace|tce|circuit|cct|close|cl|grove|gr)\b/gi;

  let lastSuffixEnd = -1;
  for (const m of t.matchAll(suffixRe)) {
    lastSuffixEnd = (m.index ?? 0) + m[0].length;
  }

  if (lastSuffixEnd > 0) {
    const street = t.slice(0, lastSuffixEnd).trim();
    const suburb = t.slice(lastSuffixEnd).trim();
    if (suburb) return { street, suburb };
  }

  const words = t.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return {
      street: words.slice(0, -1).join(" "),
      suburb: words[words.length - 1] ?? "",
    };
  }

  return { street: t, suburb: "" };
}

function parseStateFromSegment(segment: string): string {
  const t = segment.trim();
  if (AU_STATE_RE.test(t)) return t.toUpperCase();
  const m = t.match(/^(ACT|NSW|NT|QLD|SA|TAS|VIC|WA)(?:\s+\d{4})?$/i);
  return m ? m[1].toUpperCase() : "";
}

/** e.g. `Ormiston QLD` → city `Ormiston`, region `QLD` */
function splitCityAndRegion(
  city: string,
  region: string,
): { city: string; region: string } {
  const c = city.trim();
  let r = region.trim().toUpperCase();
  if (r) return { city: c, region: r };

  const embedded = c.match(/^(.+?)\s+(ACT|NSW|NT|QLD|SA|TAS|VIC|WA)$/i);
  if (embedded) {
    return { city: embedded[1].trim(), region: embedded[2].toUpperCase() };
  }
  return { city: c, region: "" };
}

function findRegionAndCountry(parts: string[]): {
  region: string;
  country: string;
} {
  const region =
    parts.map(parseStateFromSegment).find(Boolean) || "";
  const country =
    parts.find((p) => /^(AU|Australia)$/i.test(p))?.toUpperCase() || "AU";
  return { region, country };
}

function finalizeAddress(address: {
  addr1: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
}): {
  addr1: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
} {
  const { city, region } = splitCityAndRegion(address.city, address.region);
  return { ...address, city, region };
}

function splitAddress(input: string): {
  addr1: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
} {
  const empty = {
    addr1: "",
    city: "",
    region: "",
    postal_code: "",
    country: "AU",
  };
  const t = input.trim();
  if (!t) return empty;

  const parts = t.split(",").map((s) => s.trim()).filter(Boolean);

  // "22, Tombo Street Capalaba" or "54-56, Freeth Street West, Ormiston"
  if (parts.length >= 2 && isStreetNumberOnly(parts[0])) {
    const explicitCity = parts
      .slice(2)
      .find(
        (p) =>
          !AU_STATE_RE.test(p) &&
          !/^(AU|Australia)$/i.test(p) &&
          !/^\d{4}$/.test(p),
      );
    const { street, suburb } = explicitCity
      ? { street: parts[1], suburb: "" }
      : splitStreetLineAndSuburb(parts[1]);
    const addr1 = [parts[0], street].filter(Boolean).join(" ").trim();
    const city = explicitCity || suburb;
    const { region, country } = findRegionAndCountry(parts.slice(2));
    return finalizeAddress({ addr1, city, region, postal_code: "", country });
  }

  // "54-56 Freeth Street West, Ormiston QLD" or "22 Tombo St, Capalaba, QLD"
  if (parts.length >= 2) {
    const { region, country } = findRegionAndCountry(parts.slice(2));
    return finalizeAddress({
      addr1: parts[0] || "",
      city: parts[1] || "",
      region,
      postal_code: "",
      country,
    });
  }

  // "22 Tombo Street Capalaba QLD 4157" (no commas)
  const stateMatch = t.match(AU_STATE_POSTCODE_SUFFIX_RE);
  const lineBody = stateMatch
    ? t.slice(0, stateMatch.index).trim().replace(/,\s*$/, "")
    : t;
  const region = stateMatch?.[1]?.toUpperCase() || "";
  const postal_code = stateMatch?.[2] || "";
  const { street, suburb } = splitStreetLineAndSuburb(lineBody);
  return finalizeAddress({
    addr1: street,
    city: suburb,
    region,
    postal_code,
    country: "AU",
  });
}

export function vehicleToCatalogItem(
  origin: string,
  v: DealerVehicle,
): CatalogFeedItem | null {
  const listing = dealerVehicleToListing(v);
  const priceAud = catalogOfferPriceAud(v, listing);
  const imageRaw = listing.featured_image || v.Photos?.[0]?.PhotoUrl || "";
  const imageLink = normalizeFeedImageUrl(imageRaw);

  if (!imageLink || priceAud == null) return null;

  const siteOrigin = upgradeHttpToHttpsUrl(origin.replace(/\/$/, ""));
  const link = upgradeHttpToHttpsUrl(`${siteOrigin}/cars/${listing.slug}`);
  const additionalImageLinks = (v.Photos ?? [])
    .map((p) => normalizeFeedImageUrl(p.PhotoUrl?.trim() || ""))
    .filter((url) => url && url !== imageLink)
    .slice(0, 9);

  const make = listing.make.trim() || v.Make?.trim() || "";
  const model = listing.model.trim() || v.Model?.trim() || "";
  const year = resolveYear(listing, v);
  const location = catalogLocation(listing, v);
  const address = splitAddress(location);
  const isBoat = inferBoatFromVehicle(v, listing);
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
    body_style: normalizeBodyStyle(listing.body_type || v.BodyType || ""),
    drivetrain: normalizeDrivetrain(listing.drive_type || v.DriveType || ""),
    vehicle_type: isBoat ? "BOAT" : normalizeVehicleType(listing.type_code || v.Type || ""),
    fuel_type: normalizeFuelType(listing.fuel_type.trim() || v.FuelType?.trim() || ""),
    transmission: normalizeTransmission(
      listing.transmission.trim() || v.TransmissionType?.trim() || "",
    ),
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
    if (CATALOG_FEED_EXCLUDED_VEHICLE_IDS.has(item.vehicle_id)) continue;
    const key = item.link.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
  }

  return { origin, items };
}
