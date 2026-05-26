import { buildCatalogFeedItems } from "@/lib/catalog-feed/build-items";
import { buildGoogleMerchantXml } from "@/lib/catalog-feed/google-merchant-xml";
import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const { origin, items } = await buildCatalogFeedItems();
    const xml = buildGoogleMerchantXml(origin, items);
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    console.error("[feeds/google-merchant.xml]", err);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title></channel></rss>`,
      {
        status: 503,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      },
    );
  }
}
