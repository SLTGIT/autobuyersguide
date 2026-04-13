import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUrlAndRoute, siteUrlMetadataFields } from "@/lib/site-url";
import SellMyCarValuationForm from "./SellMyCarValuationForm";
import "./sell-my-car.css";

export async function generateMetadata(): Promise<Metadata> {
  const { currentUrl, currentRoute } =
    await getCurrentUrlAndRoute("/sell-my-car");
  return {
    title: "Sell My Car Car Sales Brisbane and Statewide Auto Group",
    description:
      "Sell your car today with no pressure and get a competitive offer. Get an obligation-free car valuation at Car Sales Brisbane and Statewide Auto Group.",
    ...siteUrlMetadataFields(currentUrl, currentRoute),
  };
}

const FEATURES = [
  { icon: "bi-wrench", label: "No Obligations" },
  { icon: "bi-check-lg", label: "Free Appraisal" },
  { icon: "bi-currency-dollar", label: "Competitive Offers" },
  { icon: "bi-car-front-fill", label: "Sell Your Vehicle Today" },
] as const;

export default function SellMyCarPage() {
  return (
    <>
      <section className="cs-page-hero py-5 text-white">
        <div className="container py-lg-4">
          <div className="row g-4 align-items-center">
            <div className="col-lg-8">
              <span className="badge cs-hero-chip cs-pill px-3 py-2 mb-3">
                Sell My Car
              </span>
              <h1 className="display-5 fw-bold mb-3 cs-title-tight">
                Obligation-free valuation &amp; competitive offers
              </h1>
              <p className="lead mb-0">
                Tell us about your vehicle — we&apos;ll tailor an offer to suit
                you, with no pressure to proceed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white smc-intro">
        <div className="container smc-intro-inner">
          <h2 className="smc-intro-heading">
            Get your obligation-free car valuation at Statewide Auto Group
          </h2>
          <div className="smc-intro-copy">
            <p>
              At Statewide Auto Group, we know selling your car can be stressful
              and leave you wondering if you&apos;ve got the best price. So, if
              you&apos;re thinking &quot;how do I sell my car?&quot;, then look
              no further because we&apos;ve got you covered!
            </p>
            <p>
              Our team are committed to ensuring your car selling experience is
              as simple and enjoyable as possible. That&apos;s why we offer
              obligation-free car valuations to provide a competitive and
              transparent trade-in offer in no time at all.
            </p>
            <p>
              Whether you just want to downsize, upgrade, or sell your car,
              we&apos;ll tailor an offer to suit your needs and leave you
              confident you&apos;ve made the right decision. We&apos;re happy to
              offer cash-in-hand, or if you&apos;re looking to trade in your car
              for one of our{" "}
              <Link href="/search" className="smc-link">
                used cars
              </Link>
              , this can significantly reduce the driveaway price.
            </p>
            <p>
              To arrange your obligation-free car valuation at our Ormiston
              dealership, simply complete our enquiry form online or{" "}
              <Link href="/contact" className="smc-link">
                contact
              </Link>{" "}
              our friendly team today.
            </p>
          </div>

          <ul className="smc-features list-unstyled mb-0">
            {FEATURES.map(({ icon, label }) => (
              <li key={label} className="smc-feature">
                <span className="smc-feature-icon" aria-hidden>
                  <i className={`bi ${icon}`} />
                </span>
                <span className="smc-feature-label">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-5 smc-form-section border-top border-light-subtle">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-7">
              <SellMyCarValuationForm />
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white cs-visit-section border-top border-light-subtle">
        <div className="container">
          <article className="cs-business-card p-4 p-lg-5">
            <div className="row g-5 align-items-stretch">
              <div className="col-lg-7">
                <iframe
                  className="cs-map-frame"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3538.2886675510936!2d153.2562743!3d-27.522489600000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b91678932e7fccd%3A0x6a000d7f9589579b!2sCar%20Sales%20Brisbane!5e0!3m2!1sen!2sin!4v1775730243051!5m2!1sen!2sin"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Statewide Auto Group map"
                ></iframe>
              </div>
              <div className="col-lg-5">
                {/* <p
                  className="text-uppercase fw-semibold small mb-2 smc-visit-kicker"
                  style={{ letterSpacing: "0.2em" }}
                >
                  Visit Us
                </p>
                <h2 className="display-6 fw-bold cs-title-tight mb-4">
                  Statewide Auto Group
                </h2> */}
                <div className="vstack gap-4">
                  <div className="cs-contact-row">
                    <span className="cs-contact-icon">
                      <i className="bi bi-geo-alt-fill" />
                    </span>
                    <div>
                      <div
                        className="text-secondary text-uppercase small fw-semibold mb-1"
                        style={{ letterSpacing: "0.18em" }}
                      >
                        Address
                      </div>
                      <a
                        className="cs-business-link fs-3 d-inline-block"
                        href="https://maps.google.com/?q=56+Freeth+St+W,+Ormiston,+QLD+4160"
                      >
                        56 Freeth St W
                        <br />
                        Ormiston, QLD 4160
                      </a>
                    </div>
                  </div>
                  <hr className="my-0" />
                  <div className="cs-contact-row">
                    <span className="cs-contact-icon">
                      <i className="bi bi-telephone-fill" />
                    </span>
                    <div>
                      <div
                        className="text-secondary text-uppercase small fw-semibold mb-1"
                        style={{ letterSpacing: "0.18em" }}
                      >
                        Sales &amp; Service
                      </div>
                      <a
                        className="cs-business-link fs-3 d-inline-block"
                        href="tel:0418908870"
                      >
                        0418 908 870
                      </a>
                    </div>
                  </div>
                  {/* <hr className="my-0" />
                  <div className="cs-contact-row">
                    <span className="cs-contact-icon">
                      <i className="bi bi-star-fill" />
                    </span>
                    <div>
                      <div
                        className="text-secondary text-uppercase small fw-semibold mb-1"
                        style={{ letterSpacing: "0.18em" }}
                      >
                        Google Reviews
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="cs-rating-star">
                          <i className="bi bi-star-fill" />
                        </span>
                        <span className="cs-rating-star">
                          <i className="bi bi-star-fill" />
                        </span>
                        <span className="cs-rating-star">
                          <i className="bi bi-star-fill" />
                        </span>
                        <span className="cs-rating-star">
                          <i className="bi bi-star-fill" />
                        </span>
                        <span className="cs-rating-star">
                          <i className="bi bi-star-half" />
                        </span>
                      </div>
                      <div className="fw-bold fs-4">4.8/5 Stars</div>
                    </div>
                  </div> */}
                  <hr className="my-0" />
                  <div className="cs-contact-row">
                    <span className="cs-contact-icon">
                      <i className="bi bi-share-fill" />
                    </span>
                    <div>
                      <div
                        className="text-secondary text-uppercase small fw-semibold mb-2"
                        style={{ letterSpacing: "0.18em" }}
                      >
                        Social Media
                      </div>
                      <div className="d-flex gap-3">
                        <a
                          className="cs-social-btn cs-social-facebook"
                          href="https://www.facebook.com/share/1DREXJCBhb/?mibextid=wwXIfr"
                          target="_blank"
                          aria-label="Facebook"
                        >
                          <img
                            alt="Facebook"
                            loading="lazy"
                            width="24"
                            height="24"
                            decoding="async"
                            data-nimg="1"
                            style={{ color: "transparent" }}
                            src="/assets/images/facebook.svg"
                          />
                        </a>
                        <a
                          className="cs-social-btn cs-social-instagram"
                          href="https://www.instagram.com/carsalesbrisbaneau?igsh=MTg5bmtic2hjdnNzMg%3D%3D&utm_source=qr"
                          target="_blank"
                          aria-label="Instagram"
                        >
                          <img
                            alt="Instagram"
                            loading="lazy"
                            width="24"
                            height="24"
                            decoding="async"
                            data-nimg="1"
                            style={{ color: "transparent" }}
                            src="/assets/images/instagram.svg"
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
