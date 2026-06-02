import { escapeXml } from "@/lib/sitemap-xml";
import {
  formatCatalogPriceAud,
  SITE_NAME,
} from "@/lib/catalog-feed/build-items";
import type { CatalogFeedItem } from "@/lib/catalog-feed/types";

function textNode(tag: string, value: string): string {
  return `    <${tag}>${escapeXml(value)}</${tag}>`;
}

function stateOfVehicleLabel(raw: "USED" | "NEW" | "CPO"): string {
  if (raw === "NEW") return "New";
  if (raw === "CPO") return "CPO";
  return "Used";
}

function addressNode(item: CatalogFeedItem): string {
  return `    <address format="simple">
      <component name="addr1">${escapeXml(item.address.addr1)}</component>
      <component name="city">${escapeXml(item.address.city)}</component>
      <component name="region"></component>
      <component name="country">${escapeXml(item.address.country)}</component>
      <component name="postal_code">${escapeXml(item.address.postal_code)}</component>
    </address>`;
}

function imageNodes(item: CatalogFeedItem): string {
  const urls = [item.imageLink, ...item.additionalImageLinks].filter(Boolean);
  return urls
    .map((url) => `    <image>\n      <url>${escapeXml(url)}</url>\n    </image>`)
    .join("\n");
}

function itemXml(item: CatalogFeedItem): string {
  const mileageValue = item.odometer.value || "";
  const mileageUnit = item.odometer.unit ? item.odometer.unit.toUpperCase() : "";
  const images = imageNodes(item);

  return `  <listing>
${textNode("vehicle_id", item.vehicle_id)}
${textNode("title", item.title)}
${textNode("description", item.description)}
${textNode("vin", item.vin)}
${textNode("url", item.link)}
${textNode("make", item.make)}
${textNode("model", item.model)}
${textNode("year", item.year != null ? String(item.year) : "")}
${textNode("drivetrain", item.drivetrain)}
${textNode("vehicle_type", item.vehicle_type)}
${textNode("body_style", item.body_style)}
${textNode("fuel_type", item.fuel_type)}
${textNode("transmission", item.transmission)}
    <mileage>
      <value>${escapeXml(mileageValue)}</value>
      <unit>${escapeXml(mileageUnit)}</unit>
    </mileage>
${images}
${textNode("price", formatCatalogPriceAud(item.priceAud))}
${addressNode(item)}
${textNode("exterior_color", item.exterior_color)}
${textNode("state_of_vehicle", stateOfVehicleLabel(item.state_of_vehicle))}
${textNode("stock_number", item.sku)}
  </listing>`;
}

export function buildGoogleMerchantXml(
  origin: string,
  items: CatalogFeedItem[],
): string {
  const selfLink = escapeXml(`${origin.replace(/\/$/, "")}/feeds/google-merchant.xml`);
  const itemBlocks = items.map(itemXml).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<listings>
  <title>${escapeXml(`${SITE_NAME} Vehicles Feed`)}</title>
  <link rel="self" href="${selfLink}" />
${itemBlocks}
  </listings>
`;
}
