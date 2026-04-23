import Link from "next/link";
import type {
  VehicleVdpAiContent,
  VehicleVdpAiFeatureItem,
  VehicleVdpAiSpecRow,
  VehicleVdpSnapshot,
} from "@/lib/openai/vehicleVdpTypes";
import {
  biClass,
  fallbackIconForFeatureItem,
  fallbackIconForSpecLabel,
} from "@/lib/openai/vehicleVdpDisplayUtils";
import type { VehicleImage } from "@/types/vehicle";
import type { VehicleEnquiryItemPayload } from "./VehicleEnquiryForm";
import VehicleGallery from "./VehicleGallery";
import VehicleSimilarCarousel, {
  type SimilarCarItem,
} from "./VehicleSimilarCarousel";
import VehicleVdpRefInlineEnquiry from "./VehicleVdpRefInlineEnquiry";
import { ORG_GOOGLE_MAPS_PLACE_URL, ORG_POSTAL_ADDRESS } from "@/lib/json-ld";

const DEALER_HOURS = (
  <>
    <p className="cs-muted mb-2">Mon–Fri: 8:00am–5:30pm</p>
    <p className="cs-muted mb-2">Sat: 8:00am–3:00pm</p>
    <p className="cs-muted mb-0">Sun: Closed</p>
  </>
);

function formatDealerAddress(): string {
  const a = ORG_POSTAL_ADDRESS;
  return `${a.streetAddress}, ${a.addressLocality}, ${a.addressRegion} ${a.postalCode}`;
}

function VdpSpecCard({
  title,
  rows,
}: {
  title: string;
  rows: VehicleVdpAiSpecRow[];
}) {
  if (!rows.length) return null;
  return (
    <article className="cs-card p-4 p-lg-5 mb-4">
      <h2 className="h3 fw-bold mb-4">{title}</h2>
      <div className="row g-4">
        {rows.map((row) => {
          const iconSuf = row.icon || fallbackIconForSpecLabel(row.label);
          return (
            <div key={`${title}-${row.label}`} className="col-md-6">
              <div className="cs-spec">
                <span className="cs-icon">
                  <i className={biClass(iconSuf)} aria-hidden />
                </span>
                <div>
                  <strong>{row.label}</strong>
                  <div className="cs-muted">{row.value}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function VdpFeaturesCard({ items }: { items: VehicleVdpAiFeatureItem[] }) {
  if (!items.length) return null;
  return (
    <article className="cs-card p-4 p-lg-5 mb-4">
      <h2 className="h3 fw-bold mb-4">Features listed</h2>
      <div className="row g-4">
        {items.map((it, i) => {
          const iconSuf = it.icon || fallbackIconForFeatureItem(it.label, it.value);
          return (
            <div
              key={`${it.label}-${i}`}
              className="col-md-6"
            >
              <div className="cs-spec">
                <span className="cs-icon">
                  <i className={biClass(iconSuf)} aria-hidden />
                </span>
                <div>
                  <strong>{it.label}</strong>
                  <div className="cs-muted">{it.value}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export interface VehicleVdpRefPageProps {
  snapshot: VehicleVdpSnapshot;
  ai: VehicleVdpAiContent;
  headline: string;
  featuredImage: string;
  galleryImages: VehicleImage[];
  listingTitle: string;
  showDriveAway: boolean;
  priceMain: string;
  priceCaption: string;
  catalogHref: string;
  catalogLabel: string;
  breadcrumbMake: string;
  breadcrumbMakeHref: string;
  breadcrumbCurrent: string;
  telHref: string;
  dealerPhone: string;
  enquiryItem: VehicleEnquiryItemPayload;
  financeHref: string;
  similarItems: SimilarCarItem[];
}

export default function VehicleVdpRefPage({
  snapshot,
  ai,
  headline,
  featuredImage,
  galleryImages,
  listingTitle,
  showDriveAway,
  priceMain,
  priceCaption,
  catalogHref,
  catalogLabel,
  breadcrumbMake,
  breadcrumbMakeHref,
  breadcrumbCurrent,
  telHref,
  dealerPhone,
  enquiryItem,
  financeHref,
  similarItems,
}: VehicleVdpRefPageProps) {
  const glanceLines = (
    [
      [snapshot.transmission, snapshot.driveType].filter(Boolean).join(" | ") ||
        null,
      snapshot.bodyType || null,
      snapshot.odometerKm != null && snapshot.odometerKm > 0
        ? `${snapshot.odometerKm.toLocaleString("en-AU")} km`
        : null,
      snapshot.fuelType || null,
      snapshot.locationShort
        ? `In stock: ${snapshot.locationShort}`
        : null,
    ] as (string | null)[]
  ).filter(Boolean) as string[];

  return (
    <div className="vdp-ref">
      <section className="cs-hero py-4 py-lg-5">
        <div className="container">
          <nav className="small mb-3" aria-label="Breadcrumb">
            <Link className="text-secondary" href="/">
              Home
            </Link>
            <span className="text-secondary"> / </span>
            <Link className="text-secondary" href={catalogHref}>
              {catalogLabel}
            </Link>
            <span className="text-secondary"> / </span>
            <Link className="text-secondary" href={breadcrumbMakeHref}>
              {breadcrumbMake || "Vehicles"}
            </Link>
            <span className="text-secondary"> / </span>
            <span className="text-secondary">{breadcrumbCurrent}</span>
          </nav>
          <div className="row g-4 align-items-end">
            <div className="col-lg-8">
              {ai.heroBadge.trim() ? (
                <span className="badge rounded-pill text-bg-light text-primary mb-3">
                  {ai.heroBadge}
                </span>
              ) : null}
              <h1 className="display-5 fw-bold cs-title-tight mb-3">{headline}</h1>
              <p className="lead mb-0">{ai.heroLead}</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className="cs-price">{priceMain || "—"}</div>
              <p className="mb-0 text-secondary">{priceCaption}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="vdp-ref-gallery-wrap">
                {featuredImage || galleryImages.length > 0 ? (
                  <VehicleGallery
                    featuredImage={featuredImage}
                    galleryImages={galleryImages}
                    title={listingTitle}
                  />
                ) : (
                  <div className="cs-card p-5 text-center cs-muted">
                    No photos available
                  </div>
                )}
              </div>

              <article className="cs-card p-4 p-lg-5 mb-4">
                <h2 className="h3 fw-bold mb-3">Vehicle overview</h2>
                {ai.overviewParagraphs.map((p, i) => (
                  <p className={`cs-muted ${i < ai.overviewParagraphs.length - 1 ? "mb-3" : "mb-0"}`} key={i}>
                    {p}
                  </p>
                ))}
              </article>

              <VdpSpecCard title="Car details" rows={ai.carDetailsRows} />
              <VdpSpecCard
                title="Engine, towing and size"
                rows={ai.engineTowingRows}
              />
              <VdpFeaturesCard items={ai.featureItems} />

              <section className="cs-card p-4 p-lg-5 mb-4" id="ai-overview">
                <p className="cs-mini-label mb-2">Quick buyer answer</p>
                <div className="cs-answer rounded-4 p-4 mb-4">
                  <h2 className="h4 fw-bold mb-2">{ai.quickBuyer.title}</h2>
                  <p className="cs-muted mb-0">{ai.quickBuyer.body}</p>
                </div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <strong>Best for</strong>
                    <p className="cs-muted mb-0">{ai.quickBuyer.bestFor}</p>
                  </div>
                  <div className="col-md-4">
                    <strong>Check first</strong>
                    <p className="cs-muted mb-0">{ai.quickBuyer.checkFirst}</p>
                  </div>
                  <div className="col-md-4">
                    <strong>Search intent</strong>
                    <p className="cs-muted mb-0">{ai.quickBuyer.searchIntent}</p>
                  </div>
                </div>
              </section>

              <section
                className="cs-card p-4 p-lg-5 mb-4"
                id="dealer-comment-breakdown"
              >
                <p className="cs-mini-label mb-2">Dealer comment breakdown</p>
                <h2 className="h3 fw-bold mb-3">
                  Original details, grouped for buyers
                </h2>
                <p className="cs-muted mb-3">
                  Grouped summary from the listing. Always confirm with the
                  dealer before relying on inferred or general model information.
                </p>
                <div className="row g-3">
                  {ai.dealerBreakdownCards.map((c) => (
                    <div key={c.title} className="col-md-4">
                      <div className="cs-card p-3 h-100">
                        <strong>{c.title}</strong>
                        <p className="cs-muted mb-0">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="cs-card p-4 p-lg-5 mb-4 cs-faq vdp-ref-faq"
                id="vehicle-faq"
              >
                <p className="cs-mini-label mb-2">Vehicle Q&amp;A</p>
                <h2 className="h3 fw-bold mb-3">Questions buyers ask</h2>
                {ai.faqs.length === 0 ? (
                  <p className="cs-muted mb-0">
                    No generated FAQs for this listing. Contact the dealer with
                    your questions.
                  </p>
                ) : (
                  <div className="vdp-ref-faq-list">
                    {ai.faqs.map((faq, i) => (
                      <details
                        key={i}
                        className="vdp-ref-faq-item"
                        open={i === 0}
                      >
                        <summary className="vdp-ref-faq-summary">
                          {faq.question}
                        </summary>
                        <div className="vdp-ref-faq-body cs-muted">
                          {(faq.answer.includes("\n\n")
                            ? faq.answer.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
                            : [faq.answer]
                          ).map((block, j) => (
                            <p
                              key={j}
                              className={
                                j === 0 ? "mb-0 mt-2" : "mb-0 mt-3 small"
                              }
                            >
                              {block}
                            </p>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </section>

              <article className="cs-card p-4 p-lg-5 mb-4">
                <h2 className="h3 fw-bold mb-3">Good next step</h2>
                <p className="cs-muted">{ai.goodNextStep}</p>
                <div className="d-flex flex-wrap gap-2">
                  <Link
                    className="btn btn-primary cs-pill px-4"
                    href={financeHref}
                  >
                    Check Finance Eligibility
                  </Link>
                  <Link className="btn btn-outline-primary cs-pill px-4" href="/search">
                    Search all vehicles
                  </Link>
                </div>
              </article>

              {/* <VehicleSimilarCarousel items={similarItems} /> */}

              <section className="cs-card p-4 p-lg-5 mt-2" id="vehicle-enquiry">
                <p className="cs-mini-label mb-2">Vehicle enquiry</p>
                <h2 className="h3 fw-bold mb-3">
                  Ask about this {snapshot.make} {snapshot.model}
                </h2>
                <VehicleVdpRefInlineEnquiry item={enquiryItem} />
              </section>

              <section className="cs-card p-4 p-lg-5 mt-4" id="schedule-test-drive">
                <p className="cs-mini-label mb-2">Test drive</p>
                <h2 className="h3 fw-bold mb-3">Schedule a test drive</h2>
                <p className="cs-muted mb-3">
                  Call us or use the enquiry form above — we will confirm a time
                  that suits you.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <a className="btn btn-primary cs-pill px-4" href={telHref}>
                    Call {dealerPhone}
                  </a>
                  <Link
                    className="btn btn-outline-primary cs-pill px-4"
                    href="/contact"
                  >
                    Contact page
                  </Link>
                </div>
              </section>
            </div>

            <aside className="col-lg-4">
              <div className="cs-sticky">
                <div className="cs-card p-4 mb-4 shadow-sm">
                  <p className="text-uppercase small fw-bold text-primary mb-2">
                    Finance-first enquiry
                  </p>
                  <h2 className="h4 fw-bold mb-2">{headline}</h2>
                  <div className="cs-price mb-1">{priceMain || "—"}</div>
                  <p className="cs-muted mb-3">
                    {showDriveAway
                      ? "Drive away price shown where applicable. "
                      : "Excl. Govt. Charges. "}
                    Finance available subject to approval, term, deposit, and
                    lender criteria.
                  </p>
                  <div className="d-grid gap-2">
                    <Link
                      className="btn btn-primary btn-lg cs-pill"
                      href={financeHref}
                    >
                      Apply for Finance
                    </Link>
                    <a
                      className="btn btn-outline-primary btn-lg cs-pill"
                      href="#vehicle-enquiry"
                    >
                      Enquire Now
                    </a>
                    <a
                      className="btn btn-outline-primary btn-lg cs-pill"
                      href="#schedule-test-drive"
                    >
                      Schedule Test Drive
                    </a>
                    <a
                      className="btn btn-outline-primary btn-lg cs-pill"
                      href={telHref}
                    >
                      Call {dealerPhone}
                    </a>
                  </div>
                </div>

                <div className="cs-card p-4 mb-4">
                  <h3 className="h5 fw-bold">At a glance</h3>
                  <ul className="list-unstyled cs-muted mb-0">
                    {glanceLines.map((line) => (
                      <li key={line} className="py-2 border-bottom">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="cs-card p-4 mb-4">
                  <h3 className="h5 fw-bold">Location and hours</h3>
                  <p className="cs-muted mb-2">
                    <a
                      href={ORG_GOOGLE_MAPS_PLACE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cs-muted link-offset-2 link-underline link-underline-opacity-25 vdp-ref-maps-link"
                    >
                      {formatDealerAddress()}
                    </a>
                  </p>
                  {DEALER_HOURS}
                </div>

                <div className="cs-card p-4">
                  <h3 className="h5 fw-bold">Disclaimer</h3>
                  <p className="cs-muted mb-0">
                    Please confirm price, specifications, rego details, features,
                    and availability with the dealer before purchase. AI-assisted
                    text may contain errors.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
