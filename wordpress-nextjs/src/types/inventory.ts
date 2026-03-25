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
  DriveType: string;
  TransmissionType: string;
  Type: string;
  Odometer: number | null;
  Location: string;
  Pricing: DealerPricing;
  Photos: DealerPhoto[];
  Comments?: string;
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
  slug: string;
  title: string;
  featured_image: string | null;
  condition: string;
  body_type: string;
  transmission: string;
  fuel_type: string;
  drive_type: string;
  type_code: string;
  odometer: number | null;
  stock_number: string;
  formatted_price: string;
  drive_away_price: string | null;
  show_drive_away: boolean;
  location_short: string;
  year: number;
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
