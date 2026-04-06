import Link from "next/link";
import Image from "next/image";
import type { DealerVehicle, VehicleListing } from "@/types/inventory";
import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import { dealerVehicleToListing } from "@/lib/inventory/transform";
import { priceNum } from "@/lib/inventory/query";
import {
  pickFeaturedArrivalVehicles,
  estimatedWeeklyFinance,
} from "@/lib/inventory/featured-arrivals";

function featuredSpecLine(listing: VehicleListing): string {
  const parts: string[] = [];
  const trans = listing.transmission?.trim();
  if (trans) parts.push(trans);
  if (listing.odometer != null && listing.odometer > 0) {
    parts.push(`${listing.odometer.toLocaleString("en-AU")} km`);
  }
  const tail = [listing.drive_type, listing.body_type]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(" ");
  if (tail) parts.push(tail);
  return parts.length > 0 ? parts.join(" | ") : "—";
}

export default async function PopularCarTypes() {
  let featured: DealerVehicle[] = [];
  try {
    const vehicles = await fetchDealerInventory();
    featured = pickFeaturedArrivalVehicles(vehicles, 4);
  } catch {
    featured = [];
  }

  if (featured.length === 0) {
    return null;
  }

  return (
    <section id="inventory" className="py-5">
      <div className="container">
        <div className="row mb-4 align-items-end">
          <div className="col-lg-8">
            <p
              className="text-uppercase fw-semibold small mb-2"
              style={{ color: "var(--cs-primary)" }}
            >
              Featured Listings
            </p>
            <h2 className="display-6 fw-bold cs-title-tight">
              Today’s Featured Arrivals
            </h2>
          </div>
        </div>
        <div className="row g-4">
          {featured.map((v) => {
            const listing = dealerVehicleToListing(v);
            const weekly = estimatedWeeklyFinance(priceNum(v));
            const href = `/cars/${listing.slug}`;
            return (
              <div key={listing.id} className="col-md-6 col-xl-3">
                <article className="cs-card overflow-hidden h-100">
                  <div className="position-relative w-100 bg-light" style={{ minHeight: 200 }}>
                    {listing.featured_image ? (
                      <Image
                        src={listing.featured_image}
                        alt={listing.title}
                        width={400}
                        height={260}
                        className="w-100"
                        style={{
                          height: "auto",
                          maxHeight: 240,
                          objectFit: "cover",
                        }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center text-muted small"
                        style={{ minHeight: 200 }}
                      >
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="h5 fw-bold">{listing.title}</h3>
                    {listing.formatted_price ? (
                      <p className="fw-bold fs-4 mb-2">{listing.formatted_price}</p>
                    ) : null}
                    <p className="cs-vehicle-meta mb-2">{featuredSpecLine(listing)}</p>
                    {weekly > 0 ? (
                      <p
                        className="small mb-3"
                        style={{ color: "var(--cs-primary)" }}
                      >
                        Finance from ${weekly.toLocaleString("en-AU")}/week
                      </p>
                    ) : null}
                    <div className="d-grid gap-2">
                      <a
                        className="btn text-white w-100 cs-pill"
                        style={{ background: "var(--cs-primary)" }}
                        href="#finance-centre"
                      >
                        View Finance Options
                      </a>
                      <Link
                        href={href}
                        className="btn btn-outline-primary w-100 cs-pill"
                      >
                        Vehicle Details
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
