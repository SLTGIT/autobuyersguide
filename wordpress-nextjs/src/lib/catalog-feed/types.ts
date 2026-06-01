/** One vehicle row for Google Merchant and Meta catalog exports. */
export type CatalogFeedItem = {
  id: string;
  title: string;
  description: string;
  availability: "in stock";
  condition: "new" | "used";
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
  odometer: { value: string; unit: string };
  fuel_type: string;
  transmission: string;
  vin: string;
};

/** Meta / Facebook CSV column order (make, model, year, location before title). */
export const META_CATALOG_CSV_HEADERS = [
  "id",
  "make",
  "model",
  "year",
  "location",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "odometer.unit",
  "odometer.value",
  "fuel_type",
  "transmission",
  "vin",
] as const;
