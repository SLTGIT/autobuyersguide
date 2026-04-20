import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import {
  dealerVehicleToListing,
  inventoryPriceField,
  typeCodeLabel,
} from "@/lib/inventory/transform";
import {
  buildVehicleSlug,
  findVehicleByPublicSlug,
} from "@/lib/inventory/slug";
import { getSimilarVehicles } from "@/lib/inventory/similar";
import VehicleGallery from "@/components/vehicles/VehicleGallery";
import VehicleVdpDetailGrid from "@/components/vehicles/VehicleVdpDetailGrid";
import VehicleVdpSidebarActions from "@/components/vehicles/VehicleVdpSidebarActions";
import VehicleEnquiryModal from "@/components/vehicles/VehicleEnquiryModal";
import VehicleSimilarCarousel, {
  type SimilarCarItem,
} from "@/components/vehicles/VehicleSimilarCarousel";
import VehicleVdpFaq from "@/components/vehicles/VehicleVdpFaq";
import VehicleDealerComments from "@/components/vehicles/VehicleDealerComments";
import type { VehicleImage } from "@/types/vehicle";
import type { DealerVehicle } from "@/types/inventory";
import {
  getCurrentUrlAndRoute,
  normalizePublicSiteBase,
  resolvePublicOriginFromRequest,
  siteUrlMetadataFields,
} from "@/lib/site-url";
import JsonLd from "@/components/JsonLd";
import {
  jsonLdGraph,
  organizationJsonLd,
  upgradeHttpToHttpsUrl,
  vehicleJsonLdFromInventory,
  vehicleVdpBreadcrumbJsonLd,
  webPageJsonLd,
  webSiteJsonLd,
} from "@/lib/json-ld";

interface VehicleDetailPageProps {
  params: Promise<{ slug: string }>;
}

function absoluteShareUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (base) return `${normalizePublicSiteBase(base)}${path}`;
  return path;
}

function absoluteAssetUrl(url: string, pageUrl: string): string {
  const u = url.trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  let base = "";
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (raw) base = normalizePublicSiteBase(raw);
  if (!base) {
    try {
      base = new URL(pageUrl).origin;
    } catch {
      return u;
    }
  }
  if (u.startsWith("/")) return `${base}${u}`;
  return `${base}/${u}`;
}

export async function generateMetadata({ params }: VehicleDetailPageProps) {
  const { slug } = await params;
  const all = await fetchDealerInventory();
  const v = findVehicleByPublicSlug(all, slug);
  if (!v) return { title: "Vehicle not found | Car Sales Brisbane" };
  const listing = dealerVehicleToListing(v);
  const image = v.Photos?.[0]?.PhotoUrl;
  const canonicalPath = `/cars/${buildVehicleSlug(v)}`;
  const { currentUrl, currentRoute } =
    await getCurrentUrlAndRoute(canonicalPath);
  return {
    title: `${listing.title} | Car Sales Brisbane`,
    description: `${listing.condition} ${listing.title}. ${
      listing.formatted_price ? `From ${listing.formatted_price}. ` : ""
    }View photos and details.`,
    ...siteUrlMetadataFields(currentUrl, currentRoute),
    openGraph: image
      ? {
          title: listing.title,
          description: listing.formatted_price || listing.title,
          images: [{ url: image }],
          url: currentUrl,
        }
      : { url: currentUrl },
  };
}

function toSimilarItem(v: DealerVehicle): SimilarCarItem {
  const l = dealerVehicleToListing(v);
  const tags = [l.body_type, l.transmission, l.fuel_type].filter(
    Boolean,
  ) as string[];
  return {
    slug: l.slug,
    title: l.title.length > 72 ? `${l.title.slice(0, 69)}…` : l.title,
    year: l.year,
    make: l.make,
    model: l.model,
    image: l.featured_image,
    condition: l.condition,
    price: l.formatted_price || "—",
    odometer:
      l.odometer != null && l.odometer > 0
        ? `${l.odometer.toLocaleString("en-AU")} km`
        : null,
    location: l.location_short,
    tags,
  };
}

export default async function VehicleDetailPage({
  params,
}: VehicleDetailPageProps) {
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
  const featured = v.Photos?.[0]?.PhotoUrl ?? listing.featured_image ?? "";
  const galleryImages: VehicleImage[] = (v.Photos ?? [])
    .slice(1)
    .map((p, i) => ({
      id: i,
      url: p.PhotoUrl,
      thumbnail: p.PhotoUrl,
      medium: p.PhotoUrl,
      large: p.PhotoUrl,
      alt: listing.title,
    }));

  const advertised = inventoryPriceField(v.Pricing?.AdvertisedPrice);
  const driveAway = inventoryPriceField(v.Pricing?.DriveAwayPrice);
  const colour = v.BodyColour?.trim() || "—";

  const headline =
    [v.Make, v.Model].filter(Boolean).join(" ").trim() || listing.title;

  const tagPills = [
    String(listing.year),
    listing.drive_type || null,
    listing.fuel_type || null,
    listing.body_type || null,
  ].filter(Boolean) as string[];

  const dealerPhone = process.env.NEXT_PUBLIC_DEALER_PHONE || "0418 908 870";
  const telHref = `tel:${dealerPhone.replace(/\s/g, "")}`;
  const sharePath = `/cars/${canonicalSlug}`;
  let shareUrl = absoluteShareUrl(sharePath);
  if (!shareUrl.startsWith("http")) {
    shareUrl = `${await resolvePublicOriginFromRequest()}${sharePath}`;
  }

  const enquiryItemImage = absoluteAssetUrl(featured, shareUrl);
  const enquiryItem = {
    image: enquiryItemImage,
    make: v.Make?.trim() || "",
    model: v.Model?.trim() || "",
    year: String(listing.year),
    stock: listing.stock_number || String(v.ItemID),
    rego: "",
    status: "In stock",
    tag: "Car Sales Brisbane",
    url: shareUrl,
  };
  // const getFianceHref = `/contact?subject=${encodeURIComponent(
  //   `Test drive: ${headline} (Stock ${listing.stock_number || "—"})`
  // )}`;
  const getFianceHref = `/finance-centre`;
  const mailto = listing.stock_number
    ? `mailto:${process.env.NEXT_PUBLIC_DEALER_EMAIL || "sales@statewideautogroup.com.au"}?subject=${encodeURIComponent(
        `Vehicle enquiry — Stock ${listing.stock_number}`,
      )}`
    : undefined;

  const detailRows = [
    { label: "Condition", value: `${listing.condition || "Used"} car` },
    { label: "Transmission", value: listing.transmission || "—" },
    { label: "Body type", value: listing.body_type || "—" },
    {
      label: "Odometer",
      value:
        listing.odometer != null && listing.odometer > 0
          ? `${listing.odometer.toLocaleString("en-AU")} km`
          : "—",
    },
    { label: "Fuel type", value: listing.fuel_type || "—" },
    { label: "Engine size", value: "—" },
    { label: "Stock no.", value: listing.stock_number || "—" },
    { label: "Build year", value: String(listing.year) },
    {
      label: "Location",
      value: listing.location_short || v.Location?.trim() || "—",
    },
    { label: "Colour", value: colour },
    { label: "Drive type", value: listing.drive_type || "—" },
    { label: "Seats", value: "—" },
    { label: "Doors", value: "—" },
    { label: "Power", value: "—" },
    { label: "Views", value: "—" },
    { label: "VIN", value: "—" },
    { label: "Type", value: typeCodeLabel(listing.type_code) || "—" },
  ];

  const similar = getSimilarVehicles(all, v, 6).map(toSimilarItem);

  const usedCount = all.filter((x) =>
    (x.Condition || "").toLowerCase().includes("used"),
  ).length;
  const suvCount = all.filter((x) =>
    (x.BodyType || "").toLowerCase().includes("suv"),
  ).length;
  const dieselCount = all.filter((x) =>
    (x.FuelType || "").toLowerCase().includes("diesel"),
  ).length;

  const moreCars = [
    { label: "Used cars", count: usedCount, href: "/search?condition=Used" },
    { label: "SUVs", count: suvCount, href: "/search?q=SUV" },
    { label: "Diesel", count: dieselCount, href: "/search?q=Diesel" },
    { label: "Search all", count: all.length, href: "/search" },
    {
      label: `${v.Make || "Make"}`,
      count: all.filter(
        (x) => x.Make.trim().toLowerCase() === v.Make.trim().toLowerCase(),
      ).length,
      href: `/search?make=${encodeURIComponent(v.Make.trim().toLowerCase())}`,
    },
  ];

  const condLower = (listing.condition || "used").toLowerCase();
  const isNew = condLower === "new";

  const { currentUrl: pageUrl } = await getCurrentUrlAndRoute(sharePath);
  const pageUrlHttps = upgradeHttpToHttpsUrl(pageUrl);
  const origin = new URL(pageUrlHttps).origin;
  // JSON-LD vehicle node uses the same `v` (DealerVehicle) + `listing` (VehicleListing)
  // as this page; Offer.price prefers `listingDisplayNumericPriceAud(listing)` (same
  // strings as the price card: formatted_price / drive_away_price).
  const vehicleNode = vehicleJsonLdFromInventory(origin, v, listing, {
    canonicalPageUrl: pageUrlHttps,
  });
  const vdpDescription = `${listing.condition} ${listing.title}. ${
    listing.formatted_price ? `From ${listing.formatted_price}. ` : ""
  }View photos and details.`;
  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin),
    webPageJsonLd({
      pageUrl: pageUrlHttps,
      name: `${listing.title} | Car Sales Brisbane`,
      description: vdpDescription,
      mainEntity: { "@id": `${pageUrlHttps}#vehicle` },
    }),
    vehicleNode,
    vehicleVdpBreadcrumbJsonLd(pageUrlHttps, origin, listing, v),
  );

  const catalogHref =
    condLower === "new" ? "/search?condition=New" : "/search?condition=Used";
  const catalogLabel = condLower === "new" ? "New Cars" : "Used Cars";
  const breadcrumbMake = (v.Make?.trim() || listing.make || "").trim();
  const breadcrumbModel = (v.Model?.trim() || listing.model || "").trim();
  const breadcrumbMakeHref = breadcrumbMake
    ? `/search?make=${encodeURIComponent(breadcrumbMake.toLowerCase())}`
    : "/search";
  const breadcrumbCurrent =
    breadcrumbModel ||
    (headline.length > 70 ? `${headline.slice(0, 67)}…` : headline);

  return (
    <div className="vehicles-page vehicle-detail-page inventory-vdp inventory-vdp--design">
      <JsonLd data={jsonLd} />
      <div className="vehicles-container inventory-vdp-container">
        <nav
          className="inventory-breadcrumb vdp-breadcrumb"
          aria-label="Breadcrumb"
        >
          <Link href="/">Home</Link>
          <span className="inventory-breadcrumb-sep" aria-hidden>
            /
          </span>
          <Link href={catalogHref}>{catalogLabel}</Link>
          <span className="inventory-breadcrumb-sep" aria-hidden>
            /
          </span>
          <Link href={breadcrumbMakeHref}>{breadcrumbMake || "Vehicles"}</Link>
          <span className="inventory-breadcrumb-sep" aria-hidden>
            /
          </span>
          <span className="inventory-breadcrumb-current">
            {breadcrumbCurrent}
          </span>
        </nav>

        <div className="inventory-vdp-grid vdp-main-grid">
          <div className="inventory-vdp-main-col">
            <div className="inventory-vdp-gallery">
              {featured || galleryImages.length > 0 ? (
                <VehicleGallery
                  featuredImage={featured}
                  galleryImages={galleryImages}
                  title={listing.title}
                />
              ) : (
                <div className="inventory-vdp-no-image">
                  No photos available
                </div>
              )}
            </div>

            <VehicleVdpDetailGrid rows={detailRows} />

            {v.Comments?.trim() ? (
              <VehicleDealerComments text={v.Comments} />
            ) : null}

            <section className="vdp-disclaimer" aria-label="Disclaimer">
              <p>
                Information on this page is supplied by the seller and may
                include third-party data. We do not warrant the accuracy of
                descriptions, pricing, or images — please confirm details with
                the dealer before purchase.
              </p>
            </section>

            <section className="vdp-disclaimer" aria-label="Disclaimer">
              <h4 style={{fontSize: "1.15rem", color: "#111"}} className="vdp-disclaimer-title fw-bold mb-2">Disclaimer</h4>
              <p>
                Please confirm price, specifications and features with Car Sales
                Brisbane. The vehicles actual pricing may vary from the price
                published. We do not warrant the accuracy or completeness of
                this data. Use of this website indicates your acceptance of our
                <a style={{textDecoration: "underline"}} className="text-primary" href="/terms-of-service">Terms and services</a>.
              </p>
            </section>

            <VehicleSimilarCarousel items={similar} />

            {/* <section className="vdp-more-cars" aria-labelledby="vdp-more-heading">
              <h2 id="vdp-more-heading" className="vdp-section-heading">
                More cars for you
              </h2>
              <div className="vdp-more-grid">
                {moreCars.map((item) => (
                  <Link key={item.href} href={item.href} className="vdp-more-card">
                    <span className="vdp-more-count">{item.count} cars</span>
                    <span className="vdp-more-label">{item.label}</span>
                  </Link>
                ))}
              </div>
            </section> */}

            {/* <VehicleVdpFaq /> */}
          </div>

          <aside className="inventory-vdp-aside vdp-sidebar">
            <div className="inventory-vdp-price-card vdp-sidebar-card">
              <div className="vdp-badge-row">
                <span
                  className={`vdp-badge vdp-badge--${isNew ? "new" : "used"}`}
                >
                  {isNew ? "New" : "Used"}
                </span>
                <span className="vdp-badge vdp-badge--stock">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  In stock
                </span>
              </div>

              <h1 className="vdp-sidebar-title">{headline}</h1>

              {tagPills.length > 0 && (
                <ul className="vdp-sidebar-tags" aria-label="Highlights">
                  {tagPills.map((t) => (
                    <li key={t}>
                      <span className="vdp-sidebar-tag">{t}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="vdp-price-block">
                {listing.show_drive_away && listing.drive_away_price ? (
                  <>
                    <p className="inventory-vdp-price-main vdp-price-figure">
                      {listing.drive_away_price}
                    </p>
                    <p className="vdp-price-caption">Drive away price</p>
                  </>
                ) : (
                  <>
                    <p className="inventory-vdp-price-main vdp-price-figure">
                      {listing.formatted_price || "—"}
                    </p>
                    <p className="vdp-price-caption">Excl. Govt. Charges</p>
                  </>
                )}
                {advertised && driveAway && advertised !== driveAway && (
                  <p className="vdp-price-alt">
                    Also advertised at {listing.formatted_price}
                  </p>
                )}
              </div>

              <div className="vdp-sidebar-actions-row">
                <VehicleVdpSidebarActions
                  title={headline}
                  shareUrl={shareUrl}
                  mailto={mailto}
                />
              </div>

              <div className="vdp-sidebar-meta">
                {listing.location_short || v.Location?.trim() ? (
                  <p className="vdp-meta-line">
                    <span className="vdp-meta-icon" aria-hidden>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                    </span>
                    {listing.location_short || v.Location?.trim()}
                  </p>
                ) : null}
                {listing.odometer != null && listing.odometer > 0 ? (
                  <p className="vdp-meta-line">
                    <span className="vdp-meta-icon" aria-hidden>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
                      </svg>
                    </span>
                    {listing.odometer.toLocaleString("en-AU")} km
                  </p>
                ) : null}
              </div>

              <div className="vdp-cta-stack">
                <a className="vdp-cta vdp-cta--call" href={telHref}>
                  <span className="vdp-cta-icon" aria-hidden>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                    </svg>
                  </span>
                  Call {dealerPhone}
                </a>
                <Link className="vdp-cta vdp-cta--outline" href={getFianceHref}>
                  <span className="vdp-cta-icon" aria-hidden>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 17h14v-5l-2-4H7l-2 4v5zM7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
                    </svg>
                  </span>
                  Get Finance
                </Link>
                <VehicleEnquiryModal item={enquiryItem} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
