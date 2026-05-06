import { getAllPosts } from "@/lib/wordpress";
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
  let urls: Array<{ loc: string; lastmod?: Date }> = [];

  try {
    const posts = await getAllPosts();
    urls = posts.map((post) => ({
      loc: `${origin}/blog/${post.slug}`,
      lastmod: post.modified ? new Date(post.modified) : undefined,
    }));
  } catch {
    urls = [];
  }

  const xml = buildUrlset(urls);
  return xmlResponse(xml);
}
