import type { VehicleListing } from "@/types/inventory";
import {
  vehicleCardHeadline,
  vehicleCardSubtitle,
  vehicleCardOdometerLabel,
} from "@/lib/inventory/card-display";
import Link from "next/link";
import Image from "next/image";

interface VehicleCardProps {
  listing: VehicleListing;
  view?: "grid" | "list";
  /** Hide odometer value in specs (still reserves a column with "—" when false skip). */
  hideOdometer?: boolean;
  className?: string;
}

export default function VehicleCard({
  listing,
  view = "grid",
  hideOdometer = false,
  className,
}: VehicleCardProps) {
  const href = `/cars/${listing.slug}`;
  const headline = vehicleCardHeadline(listing);
  const subtitle = vehicleCardSubtitle(listing);
  const odoLabel =
    hideOdometer ? null : vehicleCardOdometerLabel(listing);
  const odoSpec = hideOdometer ? "—" : odoLabel ?? "—";
  const fuelSpec = listing.fuel_type?.trim() || "—";
  const transSpec = listing.transmission?.trim() || "—";

  const articleClass = [
    "inventory-vehicle-card",
    view === "list" ? "is-list" : "is-grid",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={articleClass}>
      <div className="inventory-card-image-wrap">
        <Link href={href} className="inventory-card-media-link">
          {listing.featured_image ? (
            <Image
              src={listing.featured_image}
              alt={headline}
              width={400}
              height={260}
              className="inventory-card-image"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="inventory-card-image inventory-card-image--placeholder">
              <span>No image</span>
            </div>
          )}
        </Link>
      </div>

      <div className="inventory-card-body">
        <div className="inventory-card-main">
          <div className="inventory-card-title-block">
            <Link href={href} className="inventory-card-headline-link">
              <h3 className="inventory-card-headline">{headline}</h3>
            </Link>
            {/* {subtitle ? (
              <p className="inventory-card-subtitle" title={subtitle}>
                {subtitle}
              </p>
            ) : null} */}
          </div>

          <hr className="inventory-card-rule" />

          <div className="inventory-card-specs" aria-label="Key specifications">
            <div className="inventory-card-spec">
              <i className="bi bi-speedometer2 inventory-card-spec-icon" aria-hidden />
              <span className="inventory-card-spec-text">{odoSpec}</span>
            </div>
            <div className="inventory-card-spec">
              <i className="bi bi-fuel-pump inventory-card-spec-icon" aria-hidden />
              <span className="inventory-card-spec-text">{fuelSpec}</span>
            </div>
            <div className="inventory-card-spec">
              <i className="bi bi-gear-wide-connected inventory-card-spec-icon" aria-hidden />
              <span className="inventory-card-spec-text">{transSpec}</span>
            </div>
          </div>

          <hr className="inventory-card-rule" />
        </div>

        <div className="inventory-card-footer-stack">
          <div className="inventory-card-footer">
            <div className="inventory-card-footer-prices">
              {listing.compare_at_price ? (
                <span className="inventory-card-price-was">
                  {listing.compare_at_price}
                </span>
              ) : null}
              {listing.formatted_price ? (
                <span className="inventory-card-price">{listing.formatted_price}</span>
              ) : (
                <span className="inventory-card-price-muted">Price on request</span>
              )}
              {listing.show_drive_away && listing.drive_away_price ? (
                <span className="inventory-card-driveaway-note">
                  {listing.drive_away_price} drive away
                </span>
              ) : null}
            </div>
            <Link href={href} className="inventory-card-detail-link">
              View Details
              <i className="bi bi-arrow-up-right inventory-card-detail-arrow" aria-hidden />
            </Link>
          </div>

          {listing.location_short ? (
            <p className="inventory-card-location">
              <span className="inventory-card-location-icon" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </span>
              {listing.location_short}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
