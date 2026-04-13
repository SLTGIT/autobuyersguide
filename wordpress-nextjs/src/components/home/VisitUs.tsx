import React from "react";

const VisitUs = () => {
  return (
    <>
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
                          aria-label="Instagram"
                          target="_blank"
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

      {/* <section className="pb-5 bg-white">
        <div className="container">
          <article className="cs-card p-4 p-lg-5">
            <div className="row g-4 align-items-center">
              <div className="col-lg-8">
                <p
                  className="text-uppercase fw-semibold small mb-2"
                  style={{ color: "var(--cs-primary)" }}
                >
                  Customer Review
                </p>
                <h2 className="display-6 fw-bold cs-title-tight mb-3">
                  What Our Customers Say
                </h2>
                <p className="fs-3 fw-semibold mb-3">
                  "Eden and the Statewide team made buying my new Ute
                  effortless. Highly recommend for any Brisbane buyer."
                </p>
                <p className="text-secondary mb-0">Rylee D.</p>
              </div>
              <div className="col-lg-4">
                <div className="p-4 rounded-4 cs-map-tone h-100">
                  <p className="text-secondary mb-2">Review Source</p>
                  <p className="fw-bold mb-4">
                    Statewide Auto Group Google Business Profile
                  </p>
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
                  <p className="fw-bold mb-0">4.8/5 Stars</p>
                </div>
              </div>
            </div>
            <iframe
              src="https://0b1c8744c75b4a8fa47935e8949db7a8.elf.site"
              style={{ border: "none", width: "100%", height: "45vh" }}
            ></iframe>
          </article>
        </div>
      </section> */}

      <section id="about-us" className="py-5 bg-white">
        <div className="container">
          <div className="row mb-4 align-items-end">
            <div className="col-lg-8">
              {/* <p
                className="text-uppercase fw-semibold small mb-2"
                style={{ color: "var(--cs-primary)" }}
              >
                Trust &amp; Scale
              </p> */}
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
};

export default VisitUs;
