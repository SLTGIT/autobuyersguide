import { formatCatalogPriceAud } from "@/lib/catalog-feed/build-items";
import {
  META_CATALOG_CSV_HEADERS,
  type CatalogFeedItem,
} from "@/lib/catalog-feed/types";

function escapeCsvField(value: string): string {
  const t = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/[",\n]/.test(t)) {
    return `"${t.replace(/"/g, '""')}"`;
  }
  return t;
}

function rowValues(item: CatalogFeedItem): string[] {
  return [
    item.vehicle_id,
    item.make,
    item.model,
    item.year != null ? String(item.year) : "",
    item.address.addr1,
    item.address.city,
    item.address.country,
    item.title,
    item.description,
    item.availability,
    item.state_of_vehicle,
    formatCatalogPriceAud(item.priceAud),
    item.link,
    item.imageLink,
    item.exterior_color,
    item.body_style,
    item.drivetrain,
    item.vehicle_type,
    item.odometer.unit,
    item.odometer.value,
    item.fuel_type,
    item.transmission,
    item.vin,
    item.sku,
  ];
}

export function buildMetaCatalogCsv(items: CatalogFeedItem[]): string {
  const lines = [
    META_CATALOG_CSV_HEADERS.join(","),
    ...items.map((item) =>
      rowValues(item).map((v) => escapeCsvField(v)).join(","),
    ),
  ];
  return `${lines.join("\n")}\n`;
}
