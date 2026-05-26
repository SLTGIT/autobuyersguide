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

function itemXml(item: CatalogFeedItem): string {
  const parts = [
    `    <item>`,
    `      <g:id>${escapeXml(item.id)}</g:id>`,
    `      <g:title>${escapeXml(item.title)}</g:title>`,
    `      <g:description>${escapeXml(item.description)}</g:description>`,
    `      <g:link>${escapeXml(item.link)}</g:link>`,
    `      <g:image_link>${escapeXml(item.imageLink)}</g:image_link>`,
    `      <g:availability>${escapeXml(item.availability)}</g:availability>`,
    `      <g:price>${escapeXml(item.priceFormatted)}</g:price>`,
    `      <g:brand>${escapeXml(item.brand)}</g:brand>`,
    `      <g:condition>${escapeXml(item.condition)}</g:condition>`,
    `      <g:google_product_category>${escapeXml(GOOGLE_PRODUCT_CATEGORY)}</g:google_product_category>`,
    `      <g:identifier_exists>no</g:identifier_exists>`,
  ];

  if (item.additionalImageLinks.length) {
    for (const url of item.additionalImageLinks) {
      parts.push(
        `      <g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`,
      );
    }
  }

  if (item.model) {
    parts.push(productDetailXml("Model", item.model).trimEnd());
  }
  if (item.year != null) {
    parts.push(productDetailXml("Year", String(item.year)).trimEnd());
  }

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
