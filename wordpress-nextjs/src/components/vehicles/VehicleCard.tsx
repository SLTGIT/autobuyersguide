import type { VehicleListing } from "@/types/inventory";
import Link from "next/link";
import Image from "next/image";

interface VehicleCardProps {
  listing: VehicleListing;
  view?: "grid" | "list";
}

export default function VehicleCard({
  listing,
  view = "grid",
}: VehicleCardProps) {
  const href = `/cars/${listing.slug}`;
  const conditionLabel =
    listing.condition?.trim() || "Used";

  const pills: string[] = [];
  if (listing.body_type) pills.push(listing.body_type);
  if (listing.transmission) pills.push(listing.transmission);
  if (listing.stock_number)
    pills.push(`Stock No: ${listing.stock_number}`);

  return (
    <article
      className={`inventory-vehicle-card ${view === "list" ? "is-list" : "is-grid"}`}
    >
      <Link href={href} className="inventory-card-media-link">
        <div className="inventory-card-image-wrap">
          {listing.featured_image ? (
            <Image
              src={listing.featured_image}
              alt={listing.title}
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
        </div>
      </Link>

      <div className="inventory-card-body">
        <p className="inventory-card-condition">{conditionLabel}</p>
        <div className="inventory-card-title-row">
          <Link href={href} className="inventory-card-title-link">
            <h3 className="inventory-card-title">{listing.title}</h3>
          </Link>
          <button
            type="button"
            className="inventory-card-fav"
            aria-label={`Save ${listing.title}`}
            title="Save to favourites"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {pills.length > 0 && (
          <ul className="inventory-card-pills" aria-label="Quick specs">
            {pills.map((p) => (
              <li key={p}>
                <span className="inventory-pill">{p}</span>
              </li>
            ))}
          </ul>
        )}

        {listing.odometer != null && listing.odometer > 0 && (
          <p className="inventory-card-odometer">
            <span className="inventory-card-odometer-icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
              </svg>
            </span>
            {listing.odometer.toLocaleString("en-AU")} km
          </p>
        )}

        <div className="inventory-card-price-row">
          {listing.formatted_price ? (
            <span className="inventory-card-price">
              {listing.formatted_price}
            </span>
          ) : null}
          {listing.show_drive_away && listing.drive_away_price ? (
            <span className="inventory-card-driveaway">
              <a href={href} className="inventory-driveaway-link">
                Drive away
              </a>
            </span>
          ) : null}
        </div>

        {listing.location_short ? (
          <p className="inventory-card-location">
            <span className="inventory-card-location-icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </span>
            {listing.location_short}
          </p>
        ) : null}
      </div>
    </article>
  );
}
