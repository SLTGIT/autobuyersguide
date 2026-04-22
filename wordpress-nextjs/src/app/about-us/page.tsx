import React from "react";
import { Metadata } from "next";
import { getCurrentUrlAndRoute, siteUrlMetadataFields } from "@/lib/site-url";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbJsonLd,
  jsonLdGraph,
  organizationJsonLd,
  upgradeHttpToHttpsUrl,
  webPageJsonLd,
  webSiteJsonLd,
} from "@/lib/json-ld";
import "./about.css";

export async function generateMetadata(): Promise<Metadata> {
  const { currentUrl, currentRoute } = await getCurrentUrlAndRoute("/about-us");
  return {
    title: "About Car Sales Brisbane and Statewide Auto Group",
    description:
      "Car Sales Brisbane is a digital showroom designed to connect Brisbane buyers with the used vehicle range, finance support, and local team behind Statewide Auto Group.",
    ...siteUrlMetadataFields(currentUrl, currentRoute),
  };
}

const page = async () => {
  const { currentUrl } = await getCurrentUrlAndRoute("/about-us");
  const pageUrl = upgradeHttpToHttpsUrl(currentUrl);
  const origin = new URL(pageUrl).origin;
  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin),
    webPageJsonLd({
      pageUrl,
      name: "About Car Sales Brisbane and Statewide Auto Group",
      description:
        "Car Sales Brisbane is a digital showroom designed to connect Brisbane buyers with the used vehicle range, finance support, and local team behind Statewide Auto Group.",
      types: ["AboutPage"],
    }),
    breadcrumbJsonLd(pageUrl, [
      { name: "Home", item: `${origin}/` },
      { name: "About us", item: pageUrl },
    ]),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="cs-page-hero py-5 text-white">
        <div className="container py-lg-4">
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              {/* <span className="badge cs-hero-chip cs-pill px-3 py-2 mb-3">
                About Car Sales Brisbane
              </span> */}
              <h1 className="display-5 fw-bold mb-3 cs-title-tight">
                About Car Sales Brisbane and Statewide Auto Group
              </h1>
              <p className="lead mb-0">
                Car Sales Brisbane is a digital showroom designed to connect
                Brisbane buyers with the used vehicle range, finance support,
                and local team behind Statewide Auto Group.
              </p>
            </div>
            <div className="col-lg-5">
              <article className="card border-0 shadow-lg rounded-5 overflow-hidden">
                <img
                  src="https://d2s8i866417m9.cloudfront.net/photo/32428698/photo/thumb-232954f40d5f21bf8a4fa35d6daa7a7a.jpg"
                  className="card-img-top"
                  alt="Statewide Auto Group used vehicle showroom image"
                />
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-2 text-dark">
                    A Statewide Auto Group Digital Showroom
                  </h2>
                  <p className="text-secondary mb-0">
                    Serving Brisbane, Ormiston, Capalaba, and regional
                    Queensland buyers.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="cs-card p-4 p-lg-5 h-100">
                {/* <p
                  className="text-uppercase fw-semibold small mb-2"
                  style={{ color: "var(--cs-primary)" }}
                >
                  Our Story
                </p> */}
                <h2 className="display-6 fw-bold cs-title-tight mb-3">
                  Built for Brisbane buyers, backed by Statewide Auto Group
                </h2>
                <p className="text-secondary">
                  Statewide Auto Group says it has been servicing residents of
                  Capalaba and Brisbane for years, with a focus on quality used
                  cars and dependable customer service. Car Sales Brisbane sits
                  alongside that operation as a cleaner digital path for local
                  buyers who want to browse stock and start with finance.
                </p>
                <p className="text-secondary">
                  Behind this showroom is Statewide Auto Group, the parent
                  dealership business that supports the stock, the enquiry
                  process, and the customer handover through its Ormiston team.
                </p>
                <p className="text-secondary mb-0">
                  That means when you browse Car Sales Brisbane, you are not
                  landing on a disconnected lead site. You are entering a
                  Statewide-linked showroom experience built around real used
                  vehicles, local support, and a finance-first buying journey.
                </p>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="cs-card p-4 p-lg-5 h-100">
                <p
                  className="text-uppercase fw-semibold small mb-3"
                  style={{ color: "var(--cs-primary)" }}
                >
                  What This Means for You
                </p>
                <ul className="text-secondary ps-3 cs-accent-list mb-0">
                  <li>
                    Access to used cars, 4x4s, SUVs, and work-ready vehicles
                    connected to Statewide Auto Group stock.
                  </li>
                  <li>
                    A pre-approval pathway for buyers who want finance clarity
                    early.
                  </li>
                  <li>
                    Local support from the team operating out of Car Sales Brisbane,
                    Ormiston.
                  </li>
                  <li>
                    Help for Brisbane, Capalaba, and wider Queensland buyers
                    looking for the right used vehicle.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6 col-xl-3">
              <div className="cs-card p-4 h-100">
                <span className="cs-trust-icon">
                  <i className="bi bi-car-front-fill"></i>
                </span>
                <h3 className="h5 fw-bold">Used Vehicle Focus</h3>
                <p className="text-secondary mb-0">
                  We showcase quality used vehicles for Brisbane buyers, from
                  everyday cars to 4x4s, utes, and SUVs.
                </p>
              </div>
            </div>
            <div className="col-md-6 col-xl-3">
              <div className="cs-card p-4 h-100">
                <span className="cs-trust-icon">
                  <i className="bi bi-cash-coin"></i>
                </span>
                <h3 className="h5 fw-bold">Finance First</h3>
                <p className="text-secondary mb-0">
                  Our buying journey puts finance eligibility early, helping
                  customers move faster on the right car.
                </p>
              </div>
            </div>
            <div className="col-md-6 col-xl-3">
              <div className="cs-card p-4 h-100">
                <span className="cs-trust-icon">
                  <i className="bi bi-geo-alt-fill"></i>
                </span>
                <h3 className="h5 fw-bold">Local Hub</h3>
                <p className="text-secondary mb-0">
                  Statewide Auto Group’s Ormiston location supports enquiries,
                  inspections, and delivery conversations.
                </p>
              </div>
            </div>
            <div className="col-md-6 col-xl-3">
              <div className="cs-card p-4 h-100">
                <span className="cs-trust-icon">
                  <i className="bi bi-shield-check"></i>
                </span>
                <h3 className="h5 fw-bold">Trusted Parent Group</h3>
                <p className="text-secondary mb-0">
                  Car Sales Brisbane is not a disconnected lead site. It is tied
                  to Statewide Auto Group as the parent organization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="cs-card p-4 p-lg-5 h-100">
                {/* <p
                  className="text-uppercase fw-semibold small mb-2"
                  style={{ color: "var(--cs-primary)" }}
                >
                  Statewide Auto Group
                </p> */}
                <h2 className="display-6 fw-bold cs-title-tight mb-3">
                  The operating team behind the showroom
                </h2>
                <p className="text-secondary">
                  Statewide Auto Group presents itself as a Queensland used-car
                  dealership focused on helping customers find the right vehicle
                  for their needs, budget, and driving preferences. Car Sales
                  Brisbane extends that same offer into a dedicated digital
                  showroom that is easier to browse and built to convert
                  finance-led buyers.
                </p>
                <p className="text-secondary mb-0">
                  If you enquire through this site, you are stepping into the
                  Statewide Auto Group process for vehicle information,
                  inspections, finance support, and next-step buying guidance.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="cs-card p-4 p-lg-5 h-100">
                <p
                  className="text-uppercase fw-semibold fs-5 mb-2"
                  style={{ color: "var(--cs-primary)" }}
                >
                  Visit or Contact
                </p>
                <p className="mb-2">
                  <strong>Address:</strong> Car Sales Brisbane
                </p>
                <p className="mb-2">
                  <strong>Phone:</strong>
                  <a href="tel:0418908870" className="text-decoration-none text-primary">
                    0418 908 870
                  </a>
                </p>
                <p className="mb-2">
                  <strong>Email:</strong>
                  <a
                    href="mailto:john@statewideautogroup.com.au"
                    className="text-decoration-none text-primary"
                  >
                    john@statewideautogroup.com.au
                  </a>
                </p>
                <p className="mb-2">
                  <strong>Hours:</strong> Mon-Fri 8:00am-5:30pm
                </p>
                <p className="mb-2 ps-4">Sat 8:00am-3:00pm</p>
                <p className="mb-4 ps-4">Sun Closed</p>
                <div className="d-flex flex-wrap gap-3">
                  <a className="btn btn-primary cs-pill px-4" href="/contact">
                    Contact Us
                  </a>
                  <a
                    style={{ alignContent: "center" }}
                    className="btn btn-outline-primary cs-pill px-4"
                    href="/search"
                  >
                    Browse Vehicles
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default page;
