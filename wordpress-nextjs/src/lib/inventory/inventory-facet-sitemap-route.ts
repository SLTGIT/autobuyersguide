import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import {
  buildUrlset,
  getSitemapPathSegment,
  resolveSitemapOrigin,
  xmlResponse,
} from "@/lib/sitemap-xml";
import type { InventoryPathFacetSitemapKey } from "@/lib/inventory/search-path-slugs";
import { inventoryPathFacetSitemapUrls } from "@/lib/inventory/search-path-slugs";
import { NextResponse } from "next/server";

type RouteParams = { segment: string };

export function createInventoryFacetSitemapGet(
  facet: InventoryPathFacetSitemapKey,
) {
  return async function GET(
    _req: Request,
    ctx: { params: Promise<RouteParams> },
  ) {
    const { segment } = await ctx.params;
    if (segment !== getSitemapPathSegment()) {
      return new NextResponse(null, { status: 404 });
    }

    const origin = await resolveSitemapOrigin();
    let urls: Array<{ loc: string }> = [];

    try {
      const vehicles = await fetchDealerInventory();
      urls = inventoryPathFacetSitemapUrls(origin, vehicles, facet);
    } catch {
      urls = [];
    }

    return xmlResponse(buildUrlset(urls));
  };
}
