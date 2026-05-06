import {
  buildSitemapIndex,
  getSitemapPathSegment,
  resolveSitemapOrigin,
  xmlResponse,
} from "@/lib/sitemap-xml";

export const revalidate = 3600;

export async function GET() {
  const origin = await resolveSitemapOrigin();
  const segment = getSitemapPathSegment();
  const base = `${origin}/sitemap/${segment}`;
  const xml = buildSitemapIndex([
    `${base}/pages.xml`,
    `${base}/blog-detail.xml`,
    `${base}/vehicle-listing.xml`,
    `${base}/inventory-make.xml`,
    `${base}/inventory-make-model.xml`,
    `${base}/inventory-body-type.xml`,
    `${base}/inventory-fuel-type.xml`,
    `${base}/inventory-color.xml`,
    `${base}/inventory-price.xml`,
    `${base}/inventory-year.xml`,
    `${base}/inventory-drive-type.xml`,
    `${base}/inventory-transmission.xml`,
    `${base}/inventory-vehicle-type.xml`,
  ]);
  return xmlResponse(xml);
}
