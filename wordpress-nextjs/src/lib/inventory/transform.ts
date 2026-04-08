import type { DealerVehicle, VehicleListing } from "@/types/inventory";
import { buildVehicleSlug } from "./slug";

function formatAudPrice(raw: string | undefined): string {
  if (raw === undefined || raw === null || String(raw).trim() === "") return "";
  const n = Number(String(raw).replace(/[^\d.]/g, ""));
  if (Number.isNaN(n)) return `$${raw}`;
  return `$${Math.round(n).toLocaleString("en-AU")}`;
}

function priceNumber(raw: string | undefined): number | null {
  if (raw === undefined || raw === null || String(raw).trim() === "") return null;
  const n = Number(String(raw).replace(/[^\d.]/g, ""));
  return Number.isNaN(n) ? null : n;
}

export function shortenLocation(loc: string): string {
  if (!loc?.trim()) return "";
  const parts = loc.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return parts.slice(-2).join(", ");
  return loc.trim();
}

export function dealerVehicleToListing(v: DealerVehicle): VehicleListing {
  const advertised = v.Pricing?.AdvertisedPrice?.trim();
  const driveAway = v.Pricing?.DriveAwayPrice?.trim();
  const isDriveAway =
    Boolean(v.Pricing?.IsDriveAwayPrice) && Boolean(driveAway);
  const priceStr = advertised || driveAway || "";
  const photo = v.Photos?.[0]?.PhotoUrl ?? null;
  const make = v.Make?.trim() || "";
  const model = v.Model?.trim() || "";
  const title =
    v.Description?.trim() ||
    [v.ManufactureYear, make, model].filter(Boolean).join(" ");

  const egcRaw = v.Pricing?.EGCPrice?.trim();
  const advN = priceNumber(advertised || driveAway || undefined);
  const egcN = priceNumber(egcRaw);
  const compare_at_price =
    egcRaw && egcN != null && advN != null && egcN > advN
      ? formatAudPrice(egcRaw)
      : null;

  return {
    id: v.ItemID,
    slug: buildVehicleSlug(v),
    title,
    make,
    model,
    featured_image: photo,
    condition: v.Condition || "Used",
    body_type: v.BodyType?.trim() || "",
    transmission: v.TransmissionType?.trim() || "",
    fuel_type: v.FuelType?.trim() || "",
    drive_type: v.DriveType?.trim() || "",
    type_code: v.Type?.trim() || "",
    odometer: v.Odometer,
    stock_number: v.SKU?.trim() || "",
    formatted_price: formatAudPrice(priceStr),
    compare_at_price,
    drive_away_price: driveAway ? formatAudPrice(driveAway) : null,
    show_drive_away: isDriveAway,
    location_short: shortenLocation(v.Location || ""),
    year: v.ManufactureYear,
  };
}

/**
 * Split long dealer comments into readable paragraphs.
 */
export function splitVehicleDescription(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const blocks = normalized
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (blocks.length > 1) return blocks;

  const single = blocks[0] ?? "";
  if (single.length < 420) return [single];

  const sentences = single.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 1) return [single];

  const out: string[] = [];
  let buf = "";
  for (const sent of sentences) {
    const next = buf ? `${buf} ${sent}` : sent;
    if (next.length > 400 && buf) {
      out.push(buf.trim());
      buf = sent;
    } else {
      buf = next;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out.length ? out : [single];
}

export function typeCodeLabel(code: string): string {
  const c = code?.toUpperCase();
  if (c === "CAR") return "Car";
  if (c === "TRU") return "Truck";
  if (c === "OTH") return "Other";
  return code || "";
}
