import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import { allInventoryMakeModelSitemapUrls } from "@/lib/inventory/search-make-model-paths";
import {
  buildUrlset,
  getSitemapPathSegment,
  resolveSitemapOrigin,
  xmlResponse,
} from "@/lib/sitemap-xml";
import { NextResponse } from "next/server";

export const revalidate = 3600;

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
    urls = allInventoryMakeModelSitemapUrls(origin, vehicles);
  } catch {
    urls = [];
  }

  return xmlResponse(buildUrlset(urls));
}
