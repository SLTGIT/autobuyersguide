import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import {
  dealerVehicleToListing,
  splitVehicleDescription,
  typeCodeLabel,
} from "@/lib/inventory/transform";
import { buildVehicleSlug, findVehicleByPublicSlug } from "@/lib/inventory/slug";
import VehicleGallery from "@/components/vehicles/VehicleGallery";
import type { VehicleImage } from "@/types/vehicle";

interface VehicleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: VehicleDetailPageProps) {
  const { slug } = await params;
  const all = await fetchDealerInventory();
  const v = findVehicleByPublicSlug(all, slug);
  if (!v) return { title: "Vehicle not found | Auto Buyers Guide" };
  const listing = dealerVehicleToListing(v);
  const image = v.Photos?.[0]?.PhotoUrl;
  return {
    title: `${listing.title} | Auto Buyers Guide`,
    description: `${listing.condition} ${listing.year} ${listing.title}. ${
      listing.formatted_price ? `From ${listing.formatted_price}. ` : ""
    }View photos and details.`,
    openGraph: image
      ? {
          title: listing.title,
          description: listing.formatted_price || listing.title,
          images: [{ url: image }],
        }
      : undefined,
    alternates: {
      canonical: `/cars/${buildVehicleSlug(v)}`,
    },
  };
}

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { slug } = await params;
  const trimmed = slug.trim();

  const all = await fetchDealerInventory();

  if (/^\d+$/.test(trimmed)) {
    const legacy = all.find((x) => String(x.ItemID) === trimmed);
    if (legacy) permanentRedirect(`/cars/${buildVehicleSlug(legacy)}`);
    notFound();
  }

  const v = findVehicleByPublicSlug(all, trimmed);
  if (!v) notFound();

  const canonicalSlug = buildVehicleSlug(v);
  if (trimmed.toLowerCase() !== canonicalSlug.toLowerCase()) {
    permanentRedirect(`/cars/${canonicalSlug}`);
  }

  const listing = dealerVehicleToListing(v);
  const featured =
    v.Photos?.[0]?.PhotoUrl ?? listing.featured_image ?? "";
  const galleryImages: VehicleImage[] = (v.Photos ?? []).slice(1).map((p, i) => ({
    id: i,
    url: p.PhotoUrl,
    thumbnail: p.PhotoUrl,
    medium: p.PhotoUrl,
    large: p.PhotoUrl,
    alt: listing.title,
  }));

  const advertised = v.Pricing?.AdvertisedPrice?.trim();
  const driveAway = v.Pricing?.DriveAwayPrice?.trim();
  const colour = v.BodyColour?.trim() || "—";
  const statPills = [
    String(listing.year),
    colour !== "—" ? colour : null,
    listing.body_type || null,
    listing.odometer != null && listing.odometer > 0
      ? `${listing.odometer.toLocaleString("en-AU")} km`
      : null,
    listing.transmission || null,
    listing.fuel_type || null,
  ].filter(Boolean) as string[];

  return (
    <div className="vehicles-page vehicle-detail-page inventory-vdp">
      <div className="vehicles-container inventory-vdp-container">
        <nav className="inventory-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="inventory-breadcrumb-sep" aria-hidden>
            /
          </span>
          <Link href="/search">Search</Link>
          <span className="inventory-breadcrumb-sep" aria-hidden>
            /
          </span>
          <span className="inventory-breadcrumb-current">
            {listing.title}
          </span>
        </nav>

        <header className="inventory-vdp-header">
          <p className="inventory-vdp-eyebrow">{listing.condition}</p>
          <h1 className="inventory-vdp-heading">{listing.title}</h1>
          {statPills.length > 0 && (
            <ul className="inventory-vdp-stat-pills" aria-label="Key details">
              {statPills.map((label, i) => (
                <li key={`${i}-${label}`}>
                  <span className="inventory-vdp-stat-pill">{label}</span>
                </li>
              ))}
            </ul>
          )}
        </header>

        <div className="inventory-vdp-grid">
          <div className="inventory-vdp-gallery">
            {featured || galleryImages.length > 0 ? (
              <VehicleGallery
                featuredImage={featured}
                galleryImages={galleryImages}
                title={listing.title}
              />
            ) : (
              <div className="inventory-vdp-no-image">No photos available</div>
            )}
          </div>

          <aside className="inventory-vdp-aside">
            <div className="inventory-vdp-price-card">
              {listing.formatted_price && (
                <p className="inventory-vdp-price-main">
                  {listing.formatted_price}
                  {advertised && driveAway && advertised !== driveAway && (
                    <span className="inventory-vdp-price-note"> advertised</span>
                  )}
                </p>
              )}
              {listing.show_drive_away && listing.drive_away_price && (
                <p className="inventory-vdp-driveaway">
                  Drive away <strong>{listing.drive_away_price}</strong>
                </p>
              )}
              <p className="inventory-vdp-stock-line">
                Stock <span className="inventory-vdp-stock-num">{listing.stock_number || "—"}</span>
              </p>
              <div className="inventory-vdp-cta-row">
                <Link href="/contact" className="inventory-vdp-btn inventory-vdp-btn--primary">
                  Enquire now
                </Link>
                <Link href="/search" className="inventory-vdp-btn inventory-vdp-btn--ghost">
                  More vehicles
                </Link>
              </div>
            </div>

            <div className="inventory-vdp-summary">
              <h2 className="inventory-vdp-section-title">Specifications</h2>
            <dl className="inventory-vdp-specs">
              <div>
                <dt>Stock</dt>
                <dd>{listing.stock_number || "—"}</dd>
              </div>
              <div>
                <dt>Year</dt>
                <dd>{listing.year}</dd>
              </div>
              <div>
                <dt>Colour</dt>
                <dd>{colour}</dd>
              </div>
              <div>
                <dt>Odometer</dt>
                <dd>
                  {listing.odometer != null && listing.odometer > 0
                    ? `${listing.odometer.toLocaleString("en-AU")} km`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>Body</dt>
                <dd>{listing.body_type || "—"}</dd>
              </div>
              <div>
                <dt>Transmission</dt>
                <dd>{listing.transmission || "—"}</dd>
              </div>
              <div>
                <dt>Fuel</dt>
                <dd>{listing.fuel_type || "—"}</dd>
              </div>
              <div>
                <dt>Drive</dt>
                <dd>{listing.drive_type || "—"}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{typeCodeLabel(listing.type_code) || "—"}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{listing.location_short || v.Location?.trim() || "—"}</dd>
              </div>
            </dl>
            </div>
          </aside>
        </div>

        {v.Comments?.trim() ? (
          <section className="inventory-vdp-comments">
            <h2 className="inventory-vdp-section-title">Comments</h2>
            <div className="inventory-vdp-comments-body">
              {splitVehicleDescription(v.Comments).map((para, i) => (
                <p key={i} className="inventory-vdp-comment-para">
                  {para}
                </p>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
