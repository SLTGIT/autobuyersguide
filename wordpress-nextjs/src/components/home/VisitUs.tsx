import ContactInfo from "../ContactInfo";
import GoogleReviewsSlider from "./GoogleReviewsSlider";
import { CAR_SALES_BRISBANE_GOOGLE_MAPS_URL, getGoogleReviews } from "@/lib/google-reviews";

const FALLBACK_QUOTE =
  "Eden and the Statewide team made buying my new Ute effortless. Highly recommend for any Brisbane buyer.";
const FALLBACK_AUTHOR = "Rylee D.";
const FALLBACK_SCORE = 4.8;

export default async function VisitUs() {
  const summary = await getGoogleReviews();

  return (
    <>
      <ContactInfo />

      <GoogleReviewsSlider
        reviews={summary?.reviews ?? []}
        averageScore={summary?.averageScore ?? FALLBACK_SCORE}
        reviewCount={summary?.reviewCount ?? null}
        mapsUrl={CAR_SALES_BRISBANE_GOOGLE_MAPS_URL}
        fallbackQuote={FALLBACK_QUOTE}
        fallbackAuthor={FALLBACK_AUTHOR}
      />

      <section id="about-us" className="py-5 bg-white">
        <div className="container">
          <div className="row mb-4 align-items-end">
            <div className="col-lg-8">
              <h2 className="display-6 fw-bold cs-title-tight">
                Why Choose the Car Sales Brisbane Network?
              </h2>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-6 col-xl-3">
              <article className="cs-card h-100 p-4">
                <span className="cs-trust-icon">
                  <i className="bi bi-search"></i>
                </span>
                <h3 className="h5 fw-bold">Professional Sourcing</h3>
                <p className="text-secondary mb-0">
                  We aren't limited by yard space. If you don't see it, we find
                  it.
                </p>
              </article>
            </div>
            <div className="col-md-6 col-xl-3">
              <article className="cs-card h-100 p-4">
                <span className="cs-trust-icon">
                  <i className="bi bi-cash-stack"></i>
                </span>
                <h3 className="h5 fw-bold">Finance-First</h3>
                <p className="text-secondary mb-0">
                  Specialist ABN, Low-Doc, and No-Deposit loans for Brisbane
                  tradies.
                </p>
              </article>
            </div>
            <div className="col-md-6 col-xl-3">
              <article className="cs-card h-100 p-4">
                <span className="cs-trust-icon">
                  <i className="bi bi-patch-check"></i>
                </span>
                <h3 className="h5 fw-bold">Statewide Certified</h3>
                <p className="text-secondary mb-0">
                  Every vehicle is mechanically cleared by our Ormiston-based
                  technicians.
                </p>
              </article>
            </div>
            <div className="col-md-6 col-xl-3">
              <article className="cs-card h-100 p-4">
                <span className="cs-trust-icon">
                  <i className="bi bi-truck"></i>
                </span>
                <h3 className="h5 fw-bold">QLD-Wide Delivery</h3>
                <p className="text-secondary mb-0">
                  From our Brisbane hub to Townsville, Cairns, and Mt Isa.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
