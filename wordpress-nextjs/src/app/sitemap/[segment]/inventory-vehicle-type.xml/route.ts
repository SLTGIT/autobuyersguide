import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import { inventoryPathFacetSitemapUrls } from "@/lib/inventory/search-path-slugs";
import {
  buildUrlset,
  getSitemapPathSegment,
  resolveSitemapOrigin,
  xmlResponse,
} from "@/lib/sitemap-xml";
import { NextResponse } from "next/server";

export const revalidate = 3600;

/** Feed `Type` facet — same `/search/{slug}` pattern as other inventory facet sitemaps. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ segment: string }> },
) {
  const { segment } = await ctx.params;
  if (segment !== getSitemapPathSegment()) {
    return new NextResponse(null, { status: 404 });
  }

  const origin = await resolveSitemapOrigin();
  let urls: Array<{ loc: string }> = [];

  try {
    const vehicles = await fetchDealerInventory();
    urls = inventoryPathFacetSitemapUrls(origin, vehicles, "vehicleType");
  } catch {
    urls = [];
  }

  return xmlResponse(buildUrlset(urls));
}
