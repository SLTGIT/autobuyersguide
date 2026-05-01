import { NextResponse } from "next/server";
import { getCurrentUrlAndRoute } from "@/lib/site-url";

/**
 * /llms.txt — proposed convention (https://llmstxt.org/) for a concise,
 * LLM-oriented map of this site. Markdown body; served at the well-known path.
 */
function buildLlmsMarkdown(origin: string): string {
  const robots = `${origin}/robots.txt`;
  const sitemap = `${origin}/sitemap.xml`;

  return `# Car Sales Brisbane

> Used-car digital showroom for Brisbane and Queensland buyers, operated in connection with Statewide Auto Group (Ormiston). Visitors can browse inventory, open vehicle detail pages, read buyer guides, request finance information, and submit contact or sell-my-car enquiries.

This property is the marketing and inventory site for **Car Sales Brisbane**. Vehicle listings are surfaced on **Browse used cars**; each stock item has a canonical detail URL under \`/cars/{slug}\` (discover slugs from search or sitemap). Editorial guides live under **Blog**. Forms post to first-party API routes (for example lead capture); those endpoints are not intended as human-readable pages.

Authoritative crawl policy: [robots.txt](${robots}). Full URL list for indexers: [sitemap.xml](${sitemap}).

## Key pages

- [Home](${origin}/): Showroom entry, featured stock, and navigation to main tasks.
- [Browse used cars](${origin}/search): Searchable used (and selected new) inventory with filters.
- [Sell my car](${origin}/sell-my-car): Valuation and sell enquiry flow.
- [Finance centre](${origin}/finance-centre): Finance-first information and enquiry paths.
- [Contact](${origin}/contact): Phone, email, hours, and contact form.
- [About us](${origin}/about-us): Relationship to Statewide Auto Group and how the showroom fits local buyers.

## Buyer guides

- [Blog](${origin}/blog): Used-car guides for Brisbane buyers (finance, SUVs, 4x4s, budgets, first-time buyers).

## Policies

- [Privacy policy](${origin}/privacy-policy): Collection and use of personal information (Australian Privacy Principles context).
- [Terms of service](${origin}/terms-of-service): Site terms, disclaimers, and acceptable use.
- [Finance disclaimer](${origin}/finance-disclaimer): Indicative finance messaging and limitations.

## Optional

- Additional WordPress-managed pages may appear at short root paths; see [sitemap.xml](${sitemap}) for indexable URLs. An internal diagnostics path exists at \`/diagnostics\` for operators only (not a consumer destination).
`;
}

export async function GET() {
  const { currentUrl } = await getCurrentUrlAndRoute("/");
  const origin = new URL(currentUrl).origin;
  const body = buildLlmsMarkdown(origin);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
