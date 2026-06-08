import {
  buildSitemapIndex,
  getSitemapPathSegment,
  resolveSitemapOrigin,
  xmlResponse,
} from "@/lib/sitemap-xml";

export const revalidate = 3600; // 1 hour

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
  ]);
  return xmlResponse(xml);
}
