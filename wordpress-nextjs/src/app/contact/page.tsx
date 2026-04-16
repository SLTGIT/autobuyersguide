import type { Metadata } from "next";
import { getCurrentUrlAndRoute, siteUrlMetadataFields } from "@/lib/site-url";
import ContactForm from "./ContactForm";
import "./contact.css";

export async function generateMetadata(): Promise<Metadata> {
  const { currentUrl, currentRoute } = await getCurrentUrlAndRoute("/contact");
  return {
    title: "Contact Car Sales Brisbane and Statewide Auto Group",
    description:
      // not more than 152 characters
      "Contact Car Sales Brisbane team at Ormiston for used cars, finance pre-approval, sell-my-car enquiries, and Brisbane delivery support.",
    ...siteUrlMetadataFields(currentUrl, currentRoute),
  };
}

export default function Contact() {
  return (
    <>
      <section className="cs-page-hero py-5 text-white">
        <div className="container py-lg-4">
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              {/* <span className="badge cs-hero-chip cs-pill px-3 py-2 mb-3">
                Contact Us
              </span> */}
              <h1 className="display-5 fw-bold mb-3 cs-title-tight">
                Contact Us
              </h1>
              <p className="lead mb-0">
                Get in touch with us. We'd love to hear from you!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light border-top border-bottom border-light-subtle">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white cs-visit-section">
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
                  className="text-uppercase fw-semibold small mb-2"
                  style={{ color: "var(--cs-primary)", letterSpacing: "0.2em" }}
                >
                  Visit Us
                </p> */}
                {/* <h2 className="display-6 fw-bold cs-title-tight mb-4">
                  Statewide Auto Group
                </h2> */}
                <div className="vstack gap-4">
                  <div className="cs-contact-row">
                    <span className="cs-contact-icon">
                      <i className="bi bi-geo-alt-fill"></i>
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
                        56 Freeth St W<br />
                        Ormiston, QLD 4160
                      </a>
                    </div>
                  </div>
                  <hr className="my-0" />
                  <div className="cs-contact-row">
                    <span className="cs-contact-icon">
                      <i className="bi bi-telephone-fill"></i>
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
                      <i className="bi bi-star-fill"></i>
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
                          <i className="bi bi-star-fill"></i>
                        </span>
                        <span className="cs-rating-star">
                          <i className="bi bi-star-fill"></i>
                        </span>
                        <span className="cs-rating-star">
                          <i className="bi bi-star-fill"></i>
                        </span>
                        <span className="cs-rating-star">
                          <i className="bi bi-star-fill"></i>
                        </span>
                        <span className="cs-rating-star">
                          <i className="bi bi-star-half"></i>
                        </span>
                      </div>
                      <div className="fw-bold fs-4">4.8/5 Stars</div>
                    </div>
                  </div> */}
                  <hr className="my-0" />
                  <div className="cs-contact-row">
                    <span className="cs-contact-icon">
                      <i className="bi bi-share-fill"></i>
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
                          aria-label="Facebook"
                          target="_blank"
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
