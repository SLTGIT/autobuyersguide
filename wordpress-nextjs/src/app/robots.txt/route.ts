import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { normalizePublicSiteBase } from "@/lib/site-url";

function originFromEnv(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!raw) return null;
  return normalizePublicSiteBase(raw);
}

async function resolveSiteOrigin(): Promise<string> {
  const fromEnv = originFromEnv();
  if (fromEnv) return fromEnv;
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "localhost:3000";
  const proto =
    hdrs.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase() ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto === "http" || proto === "https" ? proto : "https"}://${host}`;
}

/**
 * Plain-text robots.txt for Car Sales Brisbane (Next.js app routes).
 * Structure follows the Carweek-style reference: default crawl + selective
 * disallows for this site, then AI search vs training bot blocks.
 */
function buildRobotsBody(sitemapUrl: string): string {
  return `Sitemap: ${sitemapUrl}

User-agent: *
Allow: /
# App internals & non-public surfaces
Disallow: /api/
Disallow: /diagnostics
# Faceted inventory SRP (canonical is typically /search without filters)
Disallow: /search?*

# ------------------------------------------
# AI SEARCH / TRAFFIC BOTS (Allowed)
# ------------------------------------------

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

# ------------------------------------------
# AI TRAINING BOTS (Blocked)
# ------------------------------------------

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Amazonbot
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /

User-agent: Meta-ExternalFetcher
Disallow: /

User-agent: Bytespider
Disallow: /
`;
}

export async function GET() {
  const origin = await resolveSiteOrigin();
  const sitemapUrl =
    process.env.NEXT_PUBLIC_ROBOTS_SITEMAP_URL?.trim() || `${origin}/sitemap.xml`;
  const body = buildRobotsBody(sitemapUrl);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
