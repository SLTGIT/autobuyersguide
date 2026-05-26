import type { CatalogFeedItem } from "@/lib/catalog-feed/types";

const CSV_HEADERS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "brand",
  "model",
  "year",
] as const;

function escapeCsvField(value: string): string {
  const t = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/[",\n]/.test(t)) {
    return `"${t.replace(/"/g, '""')}"`;
  }
  return t;
}

function rowValues(item: CatalogFeedItem): string[] {
  return [
    item.id,
    item.title,
    item.description,
    item.availability,
    item.condition,
    item.priceFormatted,
    item.link,
    item.imageLink,
    item.brand,
    item.model,
    item.year != null ? String(item.year) : "",
  ];
}

export function buildMetaCatalogCsv(items: CatalogFeedItem[]): string {
  const lines = [
    CSV_HEADERS.join(","),
    ...items.map((item) =>
      rowValues(item).map((v) => escapeCsvField(v)).join(","),
    ),
  ];
  return `${lines.join("\n")}\n`;
}
