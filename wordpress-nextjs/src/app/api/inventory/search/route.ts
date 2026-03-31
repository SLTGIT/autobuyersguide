import { NextRequest, NextResponse } from "next/server";
import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import {
  filterDealerVehicles,
  parseInventorySearchParams,
} from "@/lib/inventory/query";
import { dealerVehicleToListing } from "@/lib/inventory/transform";

const MAX = 15;

type SearchHit = {
  slug: string;
  label: string;
  price: string;
  image: string | null;
};

/**
 * GET /api/inventory/search?q= — lightweight matches for header typeahead.
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ results: [] as SearchHit[] });
  }

  try {
    const vehicles = await fetchDealerInventory();
    const filters = parseInventorySearchParams({ q });
    const filtered = filterDealerVehicles(vehicles, filters);
    const results: SearchHit[] = filtered.slice(0, MAX).map((v) => {
      const listing = dealerVehicleToListing(v);
      return {
        slug: listing.slug,
        label: listing.title,
        price: listing.formatted_price || "—",
        image: listing.featured_image,
      };
    });
    return NextResponse.json({ results });
  } catch (e) {
    console.error("[api/inventory/search]", e);
    return NextResponse.json(
      { results: [] as SearchHit[], error: "Search temporarily unavailable" },
      { status: 503 }
    );
  }
}
