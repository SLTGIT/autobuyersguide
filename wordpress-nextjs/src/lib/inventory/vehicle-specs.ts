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
 * Reads the first non-empty value among candidate keys.
 *
 * Dealer Solutions exports differ between dealers, and the `DealerVehicle`
 * interface only declares the keys this site has confirmed. Probing keeps
 * optional specs working where the export carries them without inventing a
 * value where it does not — a miss returns "" and the row is dropped.
 */
export function feedString(v: DealerVehicle, keys: string[]): string {
  const bag = v as unknown as Record<string, unknown>;
  for (const key of keys) {
    const raw = bag[key];
    if (raw === undefined || raw === null) continue;
    const s = typeof raw === "number" ? String(raw) : String(raw).trim();
    if (s && s !== "0") return s;
  }
  return "";
}

/**
 * Candidate key names for specs the confirmed schema does not declare.
 * Unverified against the live export — absent keys simply yield "".
 */
const OPTIONAL_KEYS = {
  engine: ["EngineDescription", "Engine", "EngineSize", "EngineCapacity"],
  seats: ["Seats", "SeatingCapacity", "SeatCapacity"],
  doors: ["Doors", "DoorCount", "NumberOfDoors"],
  rego: ["Registration", "RegistrationNumber", "Rego", "RegoNumber"],
  badge: ["Badge", "Variant", "Trim"],
  series: ["Series", "SeriesCode", "ModelCode"],
} as const;

export function vehicleFeedBadge(v: DealerVehicle): string {
  return feedString(v, [...OPTIONAL_KEYS.badge]);
}

export function vehicleFeedSeries(v: DealerVehicle): string {
  return feedString(v, [...OPTIONAL_KEYS.series]);
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

export function vehicleEngine(v: DealerVehicle): string {
  return feedString(v, [...OPTIONAL_KEYS.engine]);
}

export function vehicleSeats(v: DealerVehicle): string {
  return feedString(v, [...OPTIONAL_KEYS.seats]);
}

export function vehicleDoors(v: DealerVehicle): string {
  return feedString(v, [...OPTIONAL_KEYS.doors]);
}

export function vehicleRego(v: DealerVehicle): string {
  return feedString(v, [...OPTIONAL_KEYS.rego]);
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
