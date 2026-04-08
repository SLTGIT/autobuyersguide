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
 * Secondary line: trim / variant text without repeating year + make + model at the start.
 */
export function vehicleCardSubtitle(listing: VehicleListing): string {
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

  s = s.replace(/\s+/g, " ").trim();

  if (!s) {
    const parts = [year ? String(year) : "", listing.body_type?.trim() || ""].filter(
      Boolean,
    );
    return parts.join(" · ");
  }
  return s;
}

export function vehicleCardOdometerLabel(listing: VehicleListing): string | null {
  if (listing.odometer != null && listing.odometer > 0) {
    return `${listing.odometer.toLocaleString("en-AU")} km`;
  }
  return null;
}
