import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import { buildVehicleSlug } from "@/lib/inventory/slug";
import {
  buildUrlset,
  getSitemapPathSegment,
  resolveSitemapOrigin,
  xmlResponse,
} from "@/lib/sitemap-xml";
import { NextResponse } from "next/server";

export const revalidate = 3600;

type RouteParams = { segment: string };

export async function GET(
  _req: Request,
  ctx: { params: Promise<RouteParams> },
) {
  const { segment } = await ctx.params;
  if (segment !== getSitemapPathSegment()) {
    return new NextResponse(null, { status: 404 });
  }

  const origin = await resolveSitemapOrigin();
  const seen = new Set<string>();
  const urls: Array<{ loc: string }> = [];

  try {
    const vehicles = await fetchDealerInventory();
    for (const v of vehicles) {
      const slug = buildVehicleSlug(v);
      const key = slug.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      urls.push({ loc: `${origin}/cars/${slug}` });
    }
  } catch {
    // Empty urlset if feed is down — index still valid.
  }

  return xmlResponse(buildUrlset(urls));
}
