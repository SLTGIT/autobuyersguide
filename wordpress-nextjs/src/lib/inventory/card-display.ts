import type { VehicleListing } from "@/types/inventory";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Primary card line: "Make, Model" (screenshot-style). */
export function vehicleCardHeadline(listing: VehicleListing): string {
  const make = listing.make?.trim();
  const model = listing.model?.trim();
  if (make && model) return `${make}, ${model}`;
  if (make) return make;
  if (model) return model;
  const t = listing.title?.trim();
  return t || "Vehicle";
}

/**
 * Trim / variant text from the listing title with year, make, and model stripped.
 */
export function vehicleCardTrimFromTitle(listing: VehicleListing): string {
  const title = listing.title?.trim() || "";
  const year = listing.year;
  const make = listing.make?.trim() || "";
  const model = listing.model?.trim() || "";

  let s = title;
  const yr = year ? String(year) : "";
  if (yr && s.startsWith(yr)) {
    s = s.slice(yr.length).trim();
    if (s.startsWith("-") || s.startsWith(",")) s = s.slice(1).trim();
  }

  if (make) {
    const next = s.replace(new RegExp(`^${escapeRegExp(make)}\\s+`, "i"), "").trim();
    if (next.length < s.length) s = next;
  }
  if (model) {
    let next = s.replace(new RegExp(`^${escapeRegExp(model)}\\b\\s*`, "i"), "").trim();
    if (next.length < s.length) s = next;
    next = s.replace(new RegExp(`^${escapeRegExp(model)}\\b\\s*`, "i"), "").trim();
    if (next.length < s.length) s = next;
  }

  return s.replace(/\s+/g, " ").trim();
}

/** Card headline: "YEAR Make Model Trim" plus trim colour when present. */
export function vehicleCardHeadlineYearMakeModelTrim(
  listing: VehicleListing,
): string {
  const year =
    listing.year != null && listing.year > 0 ? String(listing.year) : "";
  const make = listing.make?.trim() || "";
  const model = listing.model?.trim() || "";
  const trim = vehicleCardTrimFromTitle(listing);
  const trimColour = listing.trim_colour?.trim() || "";
  const parts = [year, make, model].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return vehicleCardHeadline(listing);
}

/** List row primary title: "New Make, Model" / "Used Make, Model". */
export function vehicleCardListPrimaryHeadline(listing: VehicleListing): string {
  const raw = listing.condition?.trim() || "";
  const cond =
    raw.length > 0
      ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
      : "";
      const year = listing.year != null && listing.year > 0 ? String(listing.year) : "";
  const make = listing.make?.trim() || "";
  const model = listing.model?.trim() || "";
  const mm =
    make && model ? `${make}, ${model}` : make || model || "";
  const lead = [year, mm].filter(Boolean).join(" ");
  if (lead) return lead;
  return vehicleCardHeadline(listing);
}

/** List row subtitle: year + variant / trim line (screenshot-style). */
export function vehicleCardListSubtitleLine(listing: VehicleListing): string {
  const year =
    listing.year != null && listing.year > 0 ? String(listing.year) : "";
  const trim = vehicleCardTrimFromTitle(listing);
  const tc = listing.trim_colour?.trim() || "";
  const tail: string[] = [];
  if (trim) tail.push(trim);
  if (tc && !trim.toLowerCase().includes(tc.toLowerCase())) {
    tail.push(tc);
  }
  if (year && tail.length) {
    return `${year} ${tail.join(" ")}`.trim();
  }
  if (year && !tail.length) {
    const bt = listing.body_type?.trim();
    return bt ? `${year} ${bt}` : year;
  }
  if (tail.length) return tail.join(" ");
  const t = listing.title?.trim();
  return t || "";
}

/** Short feature pills for list cards (feed has no equipment list). */
export function vehicleCardFeatureTags(
  listing: VehicleListing,
  max = 3,
): string[] {

  console.log("vehicleCardFeatureTags", listing);
  const candidates = [
    listing.body_type?.trim(),
    listing.drive_type?.trim(),
    // listing.fuel_type?.trim(),
  ].filter(Boolean) as string[];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of candidates) {
    const key = c.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Secondary line: trim / variant text without repeating year + make + model at the start.
 */
export function vehicleCardSubtitle(listing: VehicleListing): string {
  const s = vehicleCardTrimFromTitle(listing);
  if (s) return s;
  const parts = [
    listing.year ? String(listing.year) : "",
    listing.body_type?.trim() || "",
  ].filter(Boolean);
  return parts.join(" · ");
}

export function vehicleCardOdometerLabel(listing: VehicleListing): string | null {
  if (listing.odometer != null && listing.odometer > 0) {
    return `${listing.odometer.toLocaleString("en-AU")} km`;
  }
  return null;
}
