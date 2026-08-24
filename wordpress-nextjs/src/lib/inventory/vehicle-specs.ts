import type { DealerVehicle, VehicleListing } from "@/types/inventory";
import { displayFuelType, simplifyTransmission } from "./powertrain";
import { buildVehicleHeadline, extractVehicleNameParts } from "./vehicle-name";

/**
 * Feed-level accessors.
 *
 * Cards, filters, facets, structured data and export feeds all read the
 * corrected values from here, so a hybrid filed under "Petrol - Unleaded"
 * cannot read as petrol on one surface and hybrid on another.
 */

/**
 * First non-empty value among candidates. Exports spell these fields several
 * ways, so each accessor resolves its alternates in order. A miss returns ""
 * and the row is dropped rather than rendering blank.
 */
function firstNonEmpty(values: Array<string | number | undefined>): string {
  for (const raw of values) {
    const t = raw === undefined || raw === null ? "" : String(raw).trim();
    if (t) return t;
  }
  return "";
}

export function vehicleFeedBadge(v: DealerVehicle): string {
  return firstNonEmpty([v.Badge, v.BadgeDescription, v.Variant, v.Trim]);
}

export function vehicleFeedSeries(v: DealerVehicle): string {
  return firstNonEmpty([v.Series]);
}

/** Fuel with the powertrain recovered from Description / Comments. */
export function vehicleDisplayFuelType(v: DealerVehicle): string {
  return displayFuelType({
    feedFuelType: v.FuelType,
    name: v.Description,
    comments: v.Comments,
  });
}

/** Transmission in buyer wording: "Automatic" / "Manual". */
export function vehicleDisplayTransmission(v: DealerVehicle): string {
  return simplifyTransmission(v.TransmissionType);
}

function nameContext(v: DealerVehicle) {
  return {
    description: v.Description,
    year: v.ManufactureYear,
    make: v.Make,
    model: v.Model,
    bodyType: v.BodyType,
    bodyColour: v.BodyColour,
    trimColour: v.TrimColour,
    transmission: v.TransmissionType,
    fuelType: v.FuelType,
    driveType: v.DriveType,
    condition: v.Condition,
    stockNumber: v.SKU,
    feedBadge: vehicleFeedBadge(v),
    feedSeries: vehicleFeedSeries(v),
  };
}

/** "2019 Toyota Corolla Ascent Sport Hybrid ZWE211R". */
export function vehicleHeadline(v: DealerVehicle): string {
  return buildVehicleHeadline(nameContext(v));
}

export function vehicleNameParts(v: DealerVehicle) {
  return extractVehicleNameParts(nameContext(v));
}

/**
 * Engine displacement for display, e.g. "1.5 L" or "1868 cc".
 *
 * Dealer Solutions publishes a bare litre figure under `Capacity`. Exports that
 * carry no engine field often still name the displacement inside `Description`
 * (the motorcycle's "1868cc"), so that is read as a fallback — the value is in
 * the feed either way, just embedded. Returns "" when neither has it.
 */
export function vehicleEngine(v: DealerVehicle): string {
  const direct = firstNonEmpty([
    v.Capacity,
    v.EngineSize,
    v.EngineCapacity,
    v.EngineDescription,
    v.Engine,
  ]);
  const source = direct || (v.Description ?? "");

  const litres = source.match(/\b(\d{1,2}(?:\.\d)?)\s*L(?:itre)?\b/i);
  if (litres) return `${litres[1]} L`;
  const cc = source.match(/\b(\d{3,5})\s*cc\b/i);
  if (cc) return `${cc[1]} cc`;
  // A bare number in a dedicated engine field is a litre figure.
  if (direct && /^\d{1,2}(\.\d)?$/.test(direct)) return `${direct} L`;
  return direct;
}

/** Seat count as a label, e.g. "5 seats". "" when the export omits it. */
export function vehicleSeats(v: DealerVehicle): string {
  const n = firstNonEmpty([v.SeatCount, v.Seats]);
  return n ? `${n} seats` : "";
}

/** Door count as a label, e.g. "5 doors". "" when the export omits it. */
export function vehicleDoors(v: DealerVehicle): string {
  const n = firstNonEmpty([v.DoorCount, v.Doors]);
  return n ? `${n} doors` : "";
}

/** Registration plate, on the exports that publish one. */
export function vehicleRego(v: DealerVehicle): string {
  return firstNonEmpty([
    v.Rego,
    v.RegistrationNumber,
    v.RegistrationPlate,
  ]).toUpperCase();
}

export interface VehicleSpecRow {
  key: string;
  /** Read out by screen readers, e.g. "Transmission: Automatic". */
  label: string;
  value: string;
  /** Bootstrap Icons suffix — class becomes "bi bi-{icon}". */
  icon: string;
}

/**
 * Card specification grid, in the order a buyer scans. Rows without a value are
 * dropped, so a vehicle whose export omits the engine shows a shorter grid
 * rather than an empty row.
 */
export function buildListingSpecRows(listing: VehicleListing): VehicleSpecRow[] {
  const odometer =
    listing.odometer != null && listing.odometer > 0
      ? `${listing.odometer.toLocaleString("en-AU")} km`
      : "";

  const rows: VehicleSpecRow[] = [
    { key: "odometer", label: "Odometer", value: odometer, icon: "speedometer2" },
    { key: "fuel", label: "Fuel type", value: listing.fuel_type, icon: "fuel-pump" },
    {
      key: "transmission",
      label: "Transmission",
      value: listing.transmission,
      icon: "gear-wide-connected",
    },
    { key: "body", label: "Body type", value: listing.body_type, icon: "car-front" },
    { key: "drive", label: "Drivetrain", value: listing.drive_type, icon: "diagram-3" },
    { key: "engine", label: "Engine", value: listing.engine, icon: "nut" },
    { key: "seats", label: "Seats", value: listing.seats, icon: "person" },
    { key: "doors", label: "Doors", value: listing.doors, icon: "door-open" },
    { key: "colour", label: "Colour", value: listing.body_colour, icon: "palette" },
    { key: "rego", label: "Registration", value: listing.rego, icon: "card-heading" },
    {
      key: "stock",
      label: "Stock number",
      value: listing.stock_number,
      icon: "upc-scan",
    },
  ];

  return rows.filter((r) => r.value.trim().length > 0);
}
