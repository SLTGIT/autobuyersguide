/** Dealer Solutions MostRecentFile feed shape */
export interface DealerPricing {
  DriveAwayPrice: string;
  IsDriveAwayPrice: boolean;
  EGCPrice: string;
  AdvertisedPrice: string;
}

export interface DealerPhoto {
  PhotoUrl: string;
}

export interface DealerVehicle {
  ItemID: number;
  SKU: string;
  Description: string;
  Make: string;
  Model: string;
  ManufactureYear: number;
  Condition: string;
  BodyType: string;
  FuelType: string;
  BodyColour: string;
  /** Interior / trim colour when provided by the feed. */
  TrimColour?: string;
  DriveType: string;
  TransmissionType: string;
  Type: string;
  Odometer: number | null;
  Location: string;
  Pricing: DealerPricing;
  Photos: DealerPhoto[];
  Comments?: string;
  /** Present on some Dealer Solutions exports. */
  VIN?: string;
  Vin?: string;
}

export interface DealerInventoryFeed {
  Vehicles: DealerVehicle[];
  DataFeed?: {
    CreationDate: string;
    DataExportFeedID: number;
  };
}

/** Normalized listing for cards & detail */
export interface VehicleListing {
  id: number;
  /** Raw feed `Description` — the packed name line, kept for the record. */
  title: string;
  slug: string;
  /** Headline: "2019 Toyota Corolla Ascent Sport Hybrid ZWE211R". */
  headline: string;
  /** Badge / variant only, e.g. "Ascent Sport Hybrid". */
  badge: string;
  /** Series code only, e.g. "ZWE211R". Empty when the feed has none. */
  series: string;
  /** Feed make — used for card headline "Make, Model". */
  make: string;
  /** Feed model — used for card headline. */
  model: string;
  featured_image: string | null;
  condition: string;
  body_type: string;
  /** Simplified for scanning: "Automatic" / "Manual". */
  transmission: string;
  /** Raw feed `TransmissionType`, e.g. "Constant Variable". */
  transmission_raw: string;
  /** Powertrain-corrected: a hybrid filed as petrol reads "Hybrid" here. */
  fuel_type: string;
  /** Raw feed `FuelType`, e.g. "Petrol - Unleaded". */
  fuel_type_raw: string;
  drive_type: string;
  /**
   * Optional specs. Dealer Solutions exports vary between dealers, so these are
   * read defensively and are empty when the feed omits them — an empty value
   * drops its row rather than rendering a dash.
   */
  engine: string;
  seats: string;
  doors: string;
  rego: string;
  type_code: string;
  odometer: number | null;
  stock_number: string;
  formatted_price: string;
  /** EGC / list price when higher than advertised (strikethrough on cards). */
  compare_at_price: string | null;
  drive_away_price: string | null;
  show_drive_away: boolean;
  location_short: string;
  year: number;
  /** Feed BodyColour — exterior paint. */
  body_colour: string;
  /** Feed TrimColour — shown in card headline after trim when present. */
  trim_colour: string;
}

export interface FilterOptionCount {
  value: string;
  label: string;
  count: number;
}

/** Facet options for the inventory sidebar (counts reflect other active filters). */
export interface InventoryFacets {
  conditions: FilterOptionCount[];
  makes: FilterOptionCount[];
  /** Models for the selected make (empty when no make selected). */
  models: FilterOptionCount[];
  bodyTypes: FilterOptionCount[];
  fuelTypes: FilterOptionCount[];
  colours: FilterOptionCount[];
  driveTypes: FilterOptionCount[];
  transmissions: FilterOptionCount[];
  types: FilterOptionCount[];
}

export interface InventoryFilterState {
  q: string;
  condition: string; // "" | Used | New
  make: string;
  /** Single model filter; lowercase for matching feed `Model`. */
  model: string;
  bodyType: string[];
  fuelType: string[];
  bodyColour: string[];
  driveType: string[];
  transmission: string[];
  type: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minYear: number | null;
  maxYear: number | null;
  sort: InventorySort;
  view: "grid" | "list";
  page: number;
}

export type InventorySort =
  | "best"
  | "price-asc"
  | "price-desc"
  | "year-desc"
  | "year-asc"
  | "odometer-asc";

/** Default SRP sort; omitted from listing URLs when unchanged. */
export const DEFAULT_INVENTORY_SORT: InventorySort = "year-desc";
