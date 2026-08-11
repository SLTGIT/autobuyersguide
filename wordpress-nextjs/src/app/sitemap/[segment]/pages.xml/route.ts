import {
  buildUrlset,
  getSitemapPathSegment,
  resolveSitemapOrigin,
  xmlResponse,
} from "@/lib/sitemap-xml";
import { NextResponse } from "next/server";

export const revalidate = 3600;

const staticRoutes = [
  "",
  "/about-us",
  "/blog",
  "/contact",
  "/finance-centre",
  "/sell-my-car",
  "/search",
  "/terms-of-service",
  "/privacy-policy",
  "/finance-disclaimer",
] as const;

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
  const now = new Date();
  const xml = buildUrlset(
    staticRoutes.map((route) => ({
      loc: `${origin}${route || "/"}`,
      lastmod: now,
    })),
  );
  return xmlResponse(xml);
}
