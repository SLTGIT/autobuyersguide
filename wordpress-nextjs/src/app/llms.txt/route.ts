import { NextResponse } from "next/server";
import { getCurrentUrlAndRoute } from "@/lib/site-url";
import { getSitemapPathSegment } from "@/lib/sitemap-xml";

/**
 * /llms.txt — proposed convention (https://llmstxt.org/) for a concise,
 * LLM-oriented map of this site. Markdown body; served at the well-known path.
 */
function buildLlmsMarkdown(origin: string): string {
  const robots = `${origin}/robots.txt`;
  const sitemap = `${origin}/sitemap.xml`;
  const segment = getSitemapPathSegment();
  const sitemapBase = `${origin}/sitemap/${segment}`;
  const dealerPhone =
    process.env.NEXT_PUBLIC_DEALER_PHONE?.trim() || "0418 908 870";
  const dealerEmail =
    process.env.NEXT_PUBLIC_DEALER_EMAIL?.trim() || "sales@carsalesbrisbane.com.au";

  return `# Car Sales Brisbane

## TL;DR

- Brisbane used-car showroom (Statewide Auto Group, Ormiston QLD): browse stock, open vehicle detail pages, enquire on finance or sell-my-car.
- Every in-stock vehicle has a canonical text page at \`/cars/{slug}\` with price, odometer, specs, and dealer comments in HTML — not only photos.
- Crawl policy: [robots.txt](${robots}) (AI indexers allowed). URL inventory: [sitemap.xml](${sitemap}).

> Used-car digital showroom for Brisbane and Queensland buyers, operated in connection with Statewide Auto Group (Ormiston). Visitors can browse inventory, open vehicle detail pages, read buyer guides, request finance information, and submit contact or sell-my-car enquiries.

## Dealer (structured)

| Field | Value |
| --- | --- |
| Name | Car Sales Brisbane |
| Type | Used-car dealer (AutoDealer) |
| Location | Ormiston, QLD 4160, Australia |
| Phone | ${dealerPhone} |
| Email | ${dealerEmail} |
| Inventory search | [Browse used cars](${origin}/search) |
| Vehicle detail pattern | \`${origin}/cars/{slug}\` |

### Trading hours

| Day | Hours |
| --- | --- |
| Monday–Friday | 08:00–17:30 |
| Saturday | 08:00–15:00 |
| Sunday | Closed |

## How to read vehicle listings

Vehicle detail pages (\`/cars/{slug}\`) expose machine-readable facts in:

1. **HTML** — definition lists under "Car details" (condition, year, odometer, transmission, body, fuel, drive, colour, doors, seats) and a Specifications tab (engine, towing, dimensions).
2. **JSON-LD** — \`Car\` / \`Offer\` schema on each VDP (price, mileage, make, model, VIN when present).
3. **Sitemap** — all canonical VDP URLs in [vehicle-listing.xml](${sitemapBase}/vehicle-listing.xml).

Photos are supplementary; specs and pricing are plain text in the page source.

## Key pages

| Page | URL | Purpose |
| --- | --- | --- |
| Home | [${origin}/](${origin}/) | Showroom entry and featured stock |
| Browse used cars | [${origin}/search](${origin}/search) | Filterable inventory |
| Sell my car | [${origin}/sell-my-car](${origin}/sell-my-car) | Valuation and sell enquiry |
| Finance centre | [${origin}/finance-centre](${origin}/finance-centre) | Finance information and enquiries |
| Contact | [${origin}/contact](${origin}/contact) | Phone, email, hours, contact form |
| About us | [${origin}/about-us](${origin}/about-us) | Dealer background and location |
| Blog | [${origin}/blog](${origin}/blog) | Buyer guides (finance, SUVs, 4x4s, budgets) |

## Sitemaps

| Child sitemap | URL |
| --- | --- |
| Index | [sitemap.xml](${sitemap}) |
| Static pages | [pages.xml](${sitemapBase}/pages.xml) |
| Blog posts | [blog-detail.xml](${sitemapBase}/blog-detail.xml) |
| Vehicle listings | [vehicle-listing.xml](${sitemapBase}/vehicle-listing.xml) |
| Inventory by make | [inventory-make.xml](${sitemapBase}/inventory-make.xml) |
| Inventory by make + model | [inventory-make-model.xml](${sitemapBase}/inventory-make-model.xml) |

Authoritative crawl policy: [robots.txt](${robots}).

## Policies

- [Privacy policy](${origin}/privacy-policy)
- [Terms of service](${origin}/terms-of-service)
- [Finance disclaimer](${origin}/finance-disclaimer)

## Optional

- Forms post to first-party \`/api/\` routes (lead capture); not intended as human-readable pages.
- Internal diagnostics at \`/diagnostics\` — operators only.
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
