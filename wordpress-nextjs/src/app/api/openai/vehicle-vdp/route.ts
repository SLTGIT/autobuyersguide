import { NextRequest, NextResponse } from "next/server";
import { loadVehicleVdpBySlug } from "@/lib/openai/loadVehicleVdpBySlug";

/**
 * POST /api/openai/vehicle-vdp
 * Body: { slug: string, includeSnapshot?: boolean }
 * Returns AI VDP JSON for the canonical vehicle slug (same resolution as /cars/[slug]).
 * 409 when the slug should redirect (legacy id or non-canonical slug) — body includes redirectTo.
 */
export async function POST(req: NextRequest) {
  let body: { slug?: unknown; includeSnapshot?: unknown };
  try {
    body = (await req.json()) as {
      slug?: unknown;
      includeSnapshot?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!slug) {
    return NextResponse.json(
      { error: "Body must include a non-empty slug" },
      { status: 400 }
    );
  }

  const includeSnapshot = body.includeSnapshot === true;

  const res = await loadVehicleVdpBySlug(slug);
  if (res.ok === false && res.error === "not_found") {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }
  if (res.ok === false && res.error === "redirect") {
    return NextResponse.json(
      { error: "redirect", redirectTo: res.redirectTo },
      { status: 409 }
    );
  }
  if (!res.ok) {
    return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
  }

  const { ai, snapshot, listing } = res;
  
  return NextResponse.json({
    ai,
    ...(includeSnapshot
      ? {
          snapshot,
          listing: {
            title: listing.title,
            slug: listing.slug,
            formatted_price: listing.formatted_price,
          },
        }
      : {}),
  });
}
