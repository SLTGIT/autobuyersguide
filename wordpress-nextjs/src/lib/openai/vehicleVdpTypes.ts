import type { DealerVehicle, VehicleListing } from "@/types/inventory";
import { dealerVehicleToListing, inventoryPriceField } from "@/lib/inventory/transform";
import { vehicleCardTrimFromTitle } from "@/lib/inventory/card-display";
import { buildVehicleSlug } from "@/lib/inventory/slug";

/** Fields sent to OpenAI (no photo URLs required; counts only). */
export interface VehicleVdpSnapshot {
  itemId: number;
  slug: string;
  title: string;
  make: string;
  model: string;
  year: number;
  condition: string;
  bodyType: string;
  fuelType: string;
  driveType: string;
  transmission: string;
  bodyColour: string;
  odometerKm: number | null;
  /** Trim line derived from listing title. */
  trim: string;
  /** Price shown on the VDP (drive-away when applicable). */
  displayPrice: string;
  vin: string;
  locationShort: string;
  stockNumber: string;
  advertisedPrice: string;
  driveAwayPrice: string;
  showDriveAway: boolean;
  description: string;
  comments: string;
  photoCount: number;
  typeCode: string;
}

export type VdpSpecSourceTag = "listing" | "inferred" | "mixed";

export interface VehicleVdpAiSpecRow {
  label: string;
  value: string;
  sourceTag: VdpSpecSourceTag;
  /** Bootstrap Icons suffix, e.g. "speedometer2" → class "bi bi-speedometer2" */
  icon?: string;
}

/** Legacy grouped sections (older model output); parsed then mapped to rows. */
export interface VehicleVdpAiSpecSection {
  title: string;
  rows: VehicleVdpAiSpecRow[];
}

/** One equipment row in "Features listed" — same idea as spec rows: name + detail + icon. */
export interface VehicleVdpAiFeatureItem {
  /** Short feature name, e.g. "Stereo", "Climate control". */
  label: string;
  /** Specific spec, e.g. "2-speaker", "Dual-zone automatic". */
  value: string;
  /** Bootstrap Icons suffix, required, e.g. "volume-up". */
  icon: string;
}

export interface VehicleVdpAiFaq {
  question: string;
  answer: string;
}

export interface VehicleVdpAiQuickBuyer {
  title: string;
  body: string;
  bestFor: string;
  checkFirst: string;
  searchIntent: string;
}

export interface VehicleVdpAiBreakdownCard {
  title: string;
  body: string;
}

export interface VehicleVdpAiContent {
  heroBadge: string;
  heroLead: string;
  /** Short feature pills for "Key highlights" (from comments/description). */
  highlightChips: string[];
  overviewParagraphs: string[];
  /** Core listing fields — same card as "Car details" on the reference VDP. */
  carDetailsRows: VehicleVdpAiSpecRow[];
  /** Engine, dimensions, towing, payload, compliance, etc. */
  engineTowingRows: VehicleVdpAiSpecRow[];
  /** Equipment / comfort lines with icons. */
  featureItems: VehicleVdpAiFeatureItem[];
  quickBuyer: VehicleVdpAiQuickBuyer;
  dealerBreakdownCards: VehicleVdpAiBreakdownCard[];
  /** Full rewritten dealer comments (paragraphs + optional feature bullets). */
  dealerCommentsParagraphs: string[];
  dealerCommentsBullets: string[];
  faqs: VehicleVdpAiFaq[];
  goodNextStep: string;
  /** @deprecated VDP SEO comes from WordPress; not populated by OpenAI. */
  seoTitle: string;
  /** @deprecated VDP SEO comes from WordPress; not populated by OpenAI. */
  metaDescription: string;
}

const MAX_SNIPPET = 8000;

function trimSnippet(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export function buildVehicleVdpSnapshot(
  v: DealerVehicle,
  listing: VehicleListing
): VehicleVdpSnapshot {
  const advertised = inventoryPriceField(v.Pricing?.AdvertisedPrice);
  const driveAway = inventoryPriceField(v.Pricing?.DriveAwayPrice);
  const displayPrice =
    listing.show_drive_away && listing.drive_away_price
      ? listing.drive_away_price.trim()
      : listing.formatted_price?.trim() || "";
  return {
    itemId: v.ItemID,
    slug: buildVehicleSlug(v),
    title: listing.title,
    make: (v.Make || listing.make).trim(),
    model: (v.Model || listing.model).trim(),
    year: listing.year,
    condition: listing.condition || v.Condition || "Used",
    bodyType: (v.BodyType || listing.body_type).trim(),
    fuelType: (v.FuelType || listing.fuel_type).trim(),
    driveType: (v.DriveType || listing.drive_type).trim(),
    transmission: (v.TransmissionType || listing.transmission).trim(),
    bodyColour: (v.BodyColour || "").trim(),
    odometerKm: listing.odometer,
    trim: vehicleCardTrimFromTitle(listing),
    displayPrice,
    vin: (v.VIN || v.Vin || "").trim().toUpperCase(),
    locationShort: listing.location_short || (v.Location || "").trim(),
    stockNumber: listing.stock_number || String(v.ItemID),
    advertisedPrice: advertised,
    driveAwayPrice: driveAway,
    showDriveAway: Boolean(listing.show_drive_away && driveAway),
    description: trimSnippet(v.Description || "", MAX_SNIPPET),
    comments: trimSnippet(v.Comments || "", MAX_SNIPPET),
    photoCount: v.Photos?.length ?? 0,
    typeCode: (v.Type || listing.type_code || "").trim(),
  };
}

export function buildVehicleVdpSnapshotFromVehicle(v: DealerVehicle): VehicleVdpSnapshot {
  return buildVehicleVdpSnapshot(v, dealerVehicleToListing(v));
}
