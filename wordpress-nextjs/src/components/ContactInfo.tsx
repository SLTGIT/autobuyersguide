import Image from "next/image";
import GoogleRatingStars from "@/components/GoogleRatingStars";
import { CAR_SALES_BRISBANE_GOOGLE_MAPS_URL, getGoogleReviews, stripLeadingStarEmojis } from "@/lib/google-reviews";

const FALLBACK_SCORE = 4.8;
const MAX_REVIEWS = 5;

function formatReviewDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });
}

export default async function ContactInfo() {
  const summary = await getGoogleReviews();
  const score = summary?.averageScore ?? FALLBACK_SCORE;
  const reviewCount = summary?.reviewCount;
  const reviews = summary?.reviews.slice(0, MAX_REVIEWS) ?? [];

  return (
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
                      href={CAR_SALES_BRISBANE_GOOGLE_MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Car Sales Brisbane
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
                    <a className="cs-business-link fs-3 d-inline-block" href="tel:0418908870">
                      0418 908 870
                    </a>
                    <p className="mt-2 mb-1">
                      <strong>Working Hours:</strong> Mon-Fri: 8:00am-5:30pm
                    </p>
                    <p className="mt-1 mb-1 ps-4">Sat: 8:00am-3:00pm</p>
                    <p className="mt-1 mb-1 ps-4">Sun: Closed</p>
                  </div>
                </div>
                <hr className="my-0" />
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
                      <GoogleRatingStars score={score} />
                    </div>
                    <div className="fw-bold fs-4">
                      {score.toFixed(1)}/5 Stars
                      {reviewCount != null ? (
                        <span className="fs-6 fw-normal text-secondary ms-2">
                          ({reviewCount} review{reviewCount === 1 ? "" : "s"})
                        </span>
                      ) : null}
                    </div>
                    {/* {reviews.length > 0 ? (
                      <ul className="list-unstyled mt-3 mb-0 small">
                        {reviews.map((r, index) => {
                          const body = r.text ? stripLeadingStarEmojis(r.text) : "";
                          const ratingNum = Number.parseFloat(r.rating);
                          const rowScore = Number.isFinite(ratingNum) ? ratingNum : score;
                          return (
                            <li
                              key={`${r.user}-${r.date}-${index}`}
                              className="border-top border-light-subtle pt-3 mt-3"
                            >
                              <div className="d-flex gap-2 align-items-start">
                                <Image
                                  src={r.user_photo}
                                  alt=""
                                  width={40}
                                  height={40}
                                  className="rounded-circle flex-shrink-0"
                                  unoptimized
                                />
                                <div className="flex-grow-1 min-w-0">
                                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                    <span className="fw-semibold">{r.user}</span>
                                    <span className="text-secondary">{formatReviewDate(r.date)}</span>
                                  </div>
                                  <div className="mb-1">
                                    <GoogleRatingStars score={rowScore} className="d-inline-flex align-items-center gap-1" />
                                    <span className="text-secondary ms-1">{rowScore.toFixed(1)}</span>
                                  </div>
                                  {body ? <p className="mb-0 text-secondary">{body}</p> : null}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null} */}
                    {/* <a
                      className="d-inline-block mt-3 fw-semibold"
                      href={CAR_SALES_BRISBANE_GOOGLE_MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read all reviews on Google
                    </a> */}
                  </div>
                </div>
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
  );
}
