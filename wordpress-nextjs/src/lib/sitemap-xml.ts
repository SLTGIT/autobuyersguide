import { NextResponse } from "next/server";
import { normalizePublicSiteBase, resolvePublicOriginFromRequest } from "@/lib/site-url";

/** Path segment after `/sitemap/` (Carweek-style: `/sitemap/carweek/blog-detail.xml`). */
export function getSitemapPathSegment(): string {
  const s = process.env.NEXT_PUBLIC_SITEMAP_SEGMENT?.trim();
  return s && s.length > 0 ? s : "carsalesbrisbane";
}

export async function resolveSitemapOrigin(): Promise<string> {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (raw) return normalizePublicSiteBase(raw);
  return resolvePublicOriginFromRequest();
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildSitemapIndex(childSitemapLocs: string[]): string {
  const blocks = childSitemapLocs
    .map((loc) => `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>\n  </sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blocks}
</sitemapindex>
`;
}

export function buildUrlset(
  urls: Array<{ loc: string; lastmod?: Date | string }>,
): string {
  const blocks = urls
    .map(({ loc, lastmod }) => {
      let inner = `    <loc>${escapeXml(loc)}</loc>`;
      if (lastmod != null) {
        const iso =
          typeof lastmod === "string"
            ? lastmod
            : lastmod.toISOString().replace(/\.\d{3}Z$/, "Z");
        inner += `\n    <lastmod>${escapeXml(iso)}</lastmod>`;
      }
      return `  <url>\n${inner}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blocks}
</urlset>
`;
}

export function xmlResponse(xml: string): NextResponse {
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
