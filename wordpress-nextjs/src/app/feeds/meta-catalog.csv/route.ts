import { buildCatalogFeedItems } from "@/lib/catalog-feed/build-items";
import { buildMetaCatalogCsv } from "@/lib/catalog-feed/meta-catalog-csv";
import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const { items } = await buildCatalogFeedItems();
    const csv = buildMetaCatalogCsv(items);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    console.error("[feeds/meta-catalog.csv]", err);
    return new NextResponse("id,title,description\n", {
      status: 503,
      headers: { "Content-Type": "text/csv; charset=utf-8" },
    });
  }
}
