/** One vehicle row for Google Merchant and Meta catalog exports. */
export type CatalogFeedItem = {
  id: string;
  vehicle_id: string;
  sku: string;
  title: string;
  description: string;
  availability: "in stock";
  condition: "new" | "used";
  state_of_vehicle: "USED" | "NEW" | "CPO";
  /** Numeric AUD price for feed formatters. */
  priceAud: number;
  /** Meta CSV / display: e.g. `49990 AUD` (no decimals). */
  priceFormatted: string;
  link: string;
  imageLink: string;
  additionalImageLinks: string[];
  make: string;
  model: string;
  year: number | null;
  /** Stock location from Dealer Solutions (suburb/region or full address). */
  location: string;
  address: {
    addr1: string;
    city: string;
    region: string;
    postal_code: string;
    country: string;
  };
  odometer: { value: string; unit: string };
  exterior_color: string;
  body_style: string;
  drivetrain: string;
  vehicle_type: string;
  fuel_type: string;
  transmission: string;
  vin: string;
};

/** Meta / Facebook CSV column order for vehicles vertical. */
export const META_CATALOG_CSV_HEADERS = [
  "vehicle_id",
  "make",
  "model",
  "year",
  "address.addr1",
  "address.city",
  "address.region",
  "address.country",
  "title",
  "description",
  "availability",
  "state_of_vehicle",
  "sale_price",
  "url",
  "image_link",
  "exterior_color",
  "body_style",
  "drivetrain",
  "vehicle_type",
  "mileage.unit",
  "mileage.value",
  "fuel_type",
  "transmission",
  "vin",
  "stock_number",
] as const;
