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

function buildRobotsBody(sitemapUrl: string): string {
  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /privacy-policy
Disallow: /terms-of-service
Disallow: /search?*

# AI search, discovery, and user-requested assistant access.
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Googlebot
Allow: /

# Do not use this website for AI model training or dataset scraping.
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: TikTokSpider
Disallow: /

Sitemap: ${sitemapUrl}
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
