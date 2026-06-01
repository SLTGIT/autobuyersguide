import { escapeXml } from "@/lib/sitemap-xml";
import {
  GOOGLE_PRODUCT_CATEGORY,
  SITE_NAME,
} from "@/lib/catalog-feed/build-items";
import type { CatalogFeedItem } from "@/lib/catalog-feed/types";

function productDetailXml(name: string, value: string): string {
  if (!value.trim()) return "";
  return `      <g:product_detail>
        <g:attribute_name>${escapeXml(name)}</g:attribute_name>
        <g:attribute_value>${escapeXml(value)}</g:attribute_value>
      </g:product_detail>
`;
}

/** Always emitted (e.g. odometer when value may be empty). */
function productDetailXmlAlways(name: string, value: string): string {
  return `      <g:product_detail>
        <g:attribute_name>${escapeXml(name)}</g:attribute_name>
        <g:attribute_value>${escapeXml(value)}</g:attribute_value>
      </g:product_detail>
`;
}

function productDetailsBlock(entries: Array<[string, string]>): string {
  return entries
    .map(([name, value]) => productDetailXml(name, value).trimEnd())
    .filter(Boolean)
    .join("\n");
}

/** make, model, year, location before g:title */
function leadingProductDetails(item: CatalogFeedItem): string {
  return productDetailsBlock([
    ["make", item.make],
    ["model", item.model],
    ["year", item.year != null ? String(item.year) : ""],
    ["location", item.location],
  ]);
}

function odometerProductDetails(item: CatalogFeedItem): string {
  return [
    productDetailXmlAlways("odometer.unit", item.odometer.unit),
    productDetailXmlAlways("odometer.value", item.odometer.value),
  ].join("\n");
}

function trailingProductDetails(item: CatalogFeedItem): string {
  return productDetailsBlock([
    ["fuel_type", item.fuel_type],
    ["transmission", item.transmission],
    ["vin", item.vin],
  ]);
}

function itemXml(item: CatalogFeedItem): string {
  const parts = [`    <item>`, `      <g:id>${escapeXml(item.id)}</g:id>`];

  const leading = leadingProductDetails(item);
  if (leading) parts.push(leading);

  parts.push(`      <g:title>${escapeXml(item.title)}</g:title>`);

  parts.push(
    `      <g:description>${escapeXml(item.description)}</g:description>`,
    `      <g:availability>${escapeXml(item.availability)}</g:availability>`,
    `      <g:condition>${escapeXml(item.condition)}</g:condition>`,
    `      <g:price>${escapeXml(item.priceFormatted)}</g:price>`,
    `      <g:link>${escapeXml(item.link)}</g:link>`,
    `      <g:image_link>${escapeXml(item.imageLink)}</g:image_link>`,
    `      <g:google_product_category>${escapeXml(GOOGLE_PRODUCT_CATEGORY)}</g:google_product_category>`,
    `      <g:identifier_exists>no</g:identifier_exists>`,
  );

  if (item.additionalImageLinks.length) {
    for (const url of item.additionalImageLinks) {
      parts.push(
        `      <g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`,
      );
    }
  }

  parts.push(odometerProductDetails(item));

  const trailing = trailingProductDetails(item);
  if (trailing) parts.push(trailing);

  parts.push(`    </item>`);
  return parts.join("\n");
}

export function buildGoogleMerchantXml(
  origin: string,
  items: CatalogFeedItem[],
): string {
  const channelLink = escapeXml(origin.replace(/\/$/, ""));
  const itemBlocks = items.map(itemXml).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(SITE_NAME)} Inventory</title>
    <link>${channelLink}</link>
    <description>${escapeXml(`${SITE_NAME} vehicle inventory for Google Merchant Center`)}</description>
${itemBlocks}
  </channel>
</rss>
`;
}
