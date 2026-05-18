import type { VehicleListing } from "@/types/inventory";
import {
  vehicleCardHeadlineYearMakeModelTrim,
  vehicleCardListPrimaryHeadline,
  vehicleCardListSubtitleLine,
  vehicleCardFeatureTags,
  vehicleCardOdometerLabel,
} from "@/lib/inventory/card-display";
import Link from "next/link";
import Image from "next/image";
import VehicleCardSave from "./VehicleCardSave";

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
  const imageAlt = vehicleCardHeadlineYearMakeModelTrim(listing);
  const isUsed = listing.condition.trim().toLowerCase() === "used";
  const odoLabel = hideOdometer ? null : vehicleCardOdometerLabel(listing);
  const odoSpec = hideOdometer ? "—" : (odoLabel ?? "—");
  const fuelSpec = listing.fuel_type?.trim() || "—";
  const transSpec = listing.transmission?.trim() || "—";
  const featureTags = vehicleCardFeatureTags(listing);

  const articleClass = [
    "inventory-vehicle-card",
    view === "list" ? "is-list" : "is-grid",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const usedBadge = isUsed ? (
    <span className="inventory-card-used-badge">Used</span>
  ) : null;

  const imageWrap = (
    <div className="inventory-card-image-wrap">
      <Link href={href} className="inventory-card-media-link">
        {listing.featured_image ? (
          <Image
            src={listing.featured_image}
            alt={imageAlt}
            width={400}
            height={260}
            className="inventory-card-image"
            sizes={
              view === "list"
                ? "(max-width: 600px) 100vw, 320px"
                : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            }
          />
        ) : (
          <div className="inventory-card-image inventory-card-image--placeholder">
            <span>No image</span>
          </div>
        )}
      </Link>
    </div>
  );

  if (view === "list") {
    const primary = vehicleCardListPrimaryHeadline(listing);
    const subtitle = vehicleCardListSubtitleLine(listing);

    return (
      <article className={articleClass}>
        {imageWrap}
        <div className="inventory-card-list-main">
          <div className="inventory-card-title-block inventory-card-title-block--list">
            {usedBadge}
            <Link
              href={href}
              className="inventory-card-headline-link inventory-card-headline-link--list"
            >
              <h3 className="inventory-card-headline inventory-card-headline--list">
                {primary}
              </h3>
              {/* {subtitle ? (
                <p className="inventory-card-subtitle inventory-card-subtitle--list">
                  {subtitle}
                </p>
              ) : null} */}
            </Link>
          </div>

          <div
            className="inventory-card-specs inventory-card-specs--list"
            aria-label="Key specifications"
          >
            <div className="inventory-card-spec inventory-card-spec--list">
              <div className="d-flex align-items-center gap-2">
                <i
                  className="bi bi-speedometer2 inventory-card-spec-icon inventory-card-spec-icon--list"
                  aria-hidden
                />
                <span className="inventory-card-spec-label">Mileage</span>
              </div>
              <span className="inventory-card-spec-value">{odoSpec}</span>
            </div>
            <div className="inventory-card-spec inventory-card-spec--list">
              <div className="d-flex align-items-center gap-2">
              <i
                className="bi bi-fuel-pump inventory-card-spec-icon inventory-card-spec-icon--list"
                aria-hidden
              />
              <span className="inventory-card-spec-label">Fuel type</span>
              </div>
              <span className="inventory-card-spec-value">{fuelSpec}</span>
            </div>
            <div className="inventory-card-spec inventory-card-spec--list">
              <div className="d-flex align-items-center gap-2">
              <i
                className="bi bi-gear-wide-connected inventory-card-spec-icon inventory-card-spec-icon--list"
                aria-hidden
              />
              <span className="inventory-card-spec-label">Transmission</span>
              </div>
              <span className="inventory-card-spec-value">{transSpec}</span>
            </div>
          </div>

          {featureTags.length > 0 ? (
            <ul className="inventory-card-tags" aria-label="Highlights">
              {featureTags.map((tag) => (
                <li key={tag} className="inventory-card-tag fs-6 px-3 py-1">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <aside
          className="inventory-card-list-aside"
          aria-label="Price and actions"
        >
          {/* <VehicleCardSave listingId={listing.id} /> */}
          <div className="inventory-card-aside-prices">
            <div className="inventory-card-price-display inventory-card-price-display--list">
              {listing.compare_at_price ? (
                <span className="inventory-card-price-was inventory-card-price-was--aside">
                  {listing.compare_at_price}
                </span>
              ) : null}
              {listing.formatted_price ? (
                <span className="inventory-card-price inventory-card-price--aside">
                  {listing.formatted_price}
                </span>
              ) : (
                <span className="inventory-card-price-muted inventory-card-price-muted--aside">
                  Price on request
                </span>
              )}
              {listing.show_drive_away && listing.drive_away_price ? (
                <span className="inventory-card-driveaway-note inventory-card-driveaway-note--aside">
                  {listing.drive_away_price} drive away
                </span>
              ) : null}
            </div>
          </div>
          <Link href="/finance-centre" className="inventory-card-finance-link">
            Calculate financing
          </Link>
          <Link
            href={href}
            className="inventory-card-detail-btn inventory-card-detail-btn--outline"
          >
            View details
            <i
              className="bi bi-arrow-up-right inventory-card-detail-arrow"
              aria-hidden
            />
          </Link>
        </aside>
      </article>
    );
  }

  const headline = imageAlt;

  return (
    <article className={articleClass}>
      {imageWrap}
      <div className="inventory-card-body">
        <div className="inventory-card-main">
          <div className="inventory-card-title-block">
            {usedBadge}
            <Link href={href} className="inventory-card-headline-link">
              <h3 className="inventory-card-headline">{headline}</h3>
            </Link>
          </div>

          <hr className="inventory-card-rule" />

          <div className="inventory-card-specs" aria-label="Key specifications">
            <div className="inventory-card-spec">
              <i
                className="bi bi-speedometer2 inventory-card-spec-icon"
                aria-hidden
              />
              <span className="inventory-card-spec-text">{odoSpec}</span>
            </div>
            <div className="inventory-card-spec">
              <i
                className="bi bi-fuel-pump inventory-card-spec-icon"
                aria-hidden
              />
              <span className="inventory-card-spec-text">{fuelSpec}</span>
            </div>
            <div className="inventory-card-spec">
              <i
                className="bi bi-gear-wide-connected inventory-card-spec-icon"
                aria-hidden
              />
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
                <span className="inventory-card-price">
                  {listing.formatted_price}
                </span>
              ) : (
                <span className="inventory-card-price-muted">
                  Price on request
                </span>
              )}
              {listing.show_drive_away && listing.drive_away_price ? (
                <span className="inventory-card-driveaway-note">
                  {listing.drive_away_price} drive away
                </span>
              ) : null}
            </div>
            <Link href={href} className="inventory-card-detail-btn">
              View details
              <i
                className="bi bi-arrow-up-right inventory-card-detail-arrow"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
