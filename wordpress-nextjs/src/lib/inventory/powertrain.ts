/**
 * Powertrain and transmission wording for scanning surfaces.
 *
 * Dealer Solutions files hybrids under their combustion fuel. The 2019 Corolla
 * (stock 00102766) arrives as FuelType "Petrol - Unleaded" with the word
 * "Hybrid" present only in the Description, and TransmissionType "Constant
 * Variable" rather than a word a buyer would use.
 *
 * These helpers derive what cards/filters show. They never mutate the feed
 * value — the VDP full-spec panel keeps `TransmissionType` / `FuelType` verbatim.
 */

/** Powertrain values we are willing to recover from free text. */
export type PowertrainLabel = "Hybrid" | "Plug-in Hybrid" | "Electric";

const PLUG_IN_HYBRID = /\b(?:plug[\s-]?in\s+hybrid|phev)\b/i;
const HYBRID = /\bhybrids?\b/i;

/**
 * Explicit EV phrasing only. Dealer comments routinely say "electric windows"
 * or "electric mirrors", so a bare "electric" must never promote a car to EV.
 */
const ELECTRIC_TEXT =
  /\b(?:battery\s+electric|fully\s+electric|all[\s-]?electric|100%\s+electric|bev)\b/i;

/** The feed's own fuel field saying Electric is authoritative. */
const ELECTRIC_FEED_FUEL = /\belectric\b/i;

export interface PowertrainSource {
  /** Feed `FuelType`, e.g. "Petrol - Unleaded". */
  feedFuelType?: string | null;
  /** Feed `Description` — the vehicle name line, the reliable carrier. */
  name?: string | null;
  /** Feed `Comments` — dealer free text. */
  comments?: string | null;
}

/**
 * Recovers the real powertrain when the feed has filed it under combustion fuel.
 * Returns null when there is nothing to recover — callers then keep the feed value.
 */
export function recoverPowertrain(input: PowertrainSource): PowertrainLabel | null {
  const fuel = (input.feedFuelType ?? "").trim();
  const name = (input.name ?? "").trim();
  const comments = (input.comments ?? "").trim();

  if (ELECTRIC_FEED_FUEL.test(fuel) && !HYBRID.test(fuel)) return "Electric";

  const texts = [name, comments].filter(Boolean);
  if (texts.some((t) => PLUG_IN_HYBRID.test(t))) return "Plug-in Hybrid";
  if (texts.some((t) => HYBRID.test(t))) return "Hybrid";

  // Unambiguous EV phrasing, and only from the name line.
  if (name && ELECTRIC_TEXT.test(name)) return "Electric";

  return null;
}

/**
 * Fuel value for cards, filters, structured data and export feeds.
 * Falls back to the raw feed value, so a vehicle we cannot classify still renders.
 */
export function displayFuelType(input: PowertrainSource): string {
  return recoverPowertrain(input) ?? (input.feedFuelType ?? "").trim();
}

const MANUAL = /\bmanual\b/i;
const AUTOMATIC_MECHANISM =
  /\b(?:automatic|auto|cvt|e-?cvt|constant\s+variable|dual\s+clutch|dct|dsg|tiptronic|steptronic|x-?tronic|skyactiv-?drive|multitronic|powershift)\b/i;

/**
 * "Constant Variable" / "Sports Automatic Dual Clutch" -> "Automatic".
 * An unrecognised mechanism name is returned unchanged rather than guessed at,
 * so an oddly formatted feed value still renders something truthful.
 */
export function simplifyTransmission(raw?: string | null): string {
  const t = (raw ?? "").trim();
  if (!t) return "";
  if (MANUAL.test(t) && !/\bautomat/i.test(t)) return "Manual";
  if (AUTOMATIC_MECHANISM.test(t)) return "Automatic";
  return t;
}
