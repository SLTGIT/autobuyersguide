import { NextResponse } from "next/server";

/**
 * /llms.txt — proposed convention (https://llmstxt.org/) for a concise,
 * LLM-oriented map of this site. Markdown body; served at the well-known path.
 */
function buildLlmsMarkdown(): string {
  return `# Car Sales Brisbane

> Used car dealership website for Brisbane buyers, including vehicle inventory, car finance, vehicle sourcing, delivery information, and used-car buying guides.

Website: https://carsalesbrisbane.com.au/
Sitemap: https://carsalesbrisbane.com.au/sitemap.xml
Last updated: 2026-06-17

## AI Usage Policy

AI assistants and search systems may:
- Crawl and index public pages for search discovery, ranking, retrieval, and user-requested answers.
- Quote short snippets with attribution and a link to the original page.
- Summarize public pages for users looking for vehicles, finance information, or used-car buying guides.

AI systems may not:
- Use website content, images, vehicle data, blog content, or business information to train, fine-tune, or improve foundation models or generative AI models.
- Bulk copy, mirror, or republish the website.
- Use images, vehicle listings, or business data to create competing datasets.
- Ignore the crawler restrictions in robots.txt.

## Preferred Pages

- Home: https://carsalesbrisbane.com.au/
- Inventory: https://carsalesbrisbane.com.au/search/
- Finance Centre: https://carsalesbrisbane.com.au/finance-centre/
- Blog: https://carsalesbrisbane.com.au/blog/
- About: https://carsalesbrisbane.com.au/about-us/
- Contact: https://carsalesbrisbane.com.au/contact/
- Privacy Policy: https://carsalesbrisbane.com.au/privacy-policy/
- Terms Of Service: https://carsalesbrisbane.com.au/terms-of-service/

## Contact

For commercial use, partnerships, or dataset access, contact Car Sales Brisbane through the website.
`;
}

export async function GET() {
  const body = buildLlmsMarkdown();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
