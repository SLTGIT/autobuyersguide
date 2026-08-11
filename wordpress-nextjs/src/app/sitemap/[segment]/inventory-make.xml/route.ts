import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import { allResearchMakeSlugs } from "@/lib/research/research-make-slugs";
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
  let slugs: string[] = [];

  try {
    const vehicles = await fetchDealerInventory();
    slugs = allResearchMakeSlugs(vehicles);
  } catch {
    slugs = [];
  }

  const urls = slugs.map((slug) => ({ loc: `${origin}/search/${slug}` }));
  return xmlResponse(buildUrlset(urls));
}
