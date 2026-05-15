import type { Metadata } from "next";
import Link from "next/link";
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
import SellMyCarValuationForm from "./SellMyCarValuationForm";
import "./sell-my-car.css";
import ContactInfo from "@/components/ContactInfo";

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

export default async function SellMyCarPage() {
  const { currentUrl } = await getCurrentUrlAndRoute("/sell-my-car");
  const pageUrl = upgradeHttpToHttpsUrl(currentUrl);
  const origin = new URL(pageUrl).origin;
  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin),
    webPageJsonLd({
      pageUrl,
      name: "Sell My Car Car Sales Brisbane Used Car Dealership",
      description:
        "Sell your car today with no pressure and get a competitive offer. Get an obligation-free car valuation at Car Sales Brisbane and Statewide Auto Group.",
    }),
    {
      "@type": "Service",
      "@id": `${pageUrl}#valuation-service`,
      name: "Obligation-free vehicle valuation",
      serviceType: "Used vehicle purchase and trade-in valuation",
      provider: { "@id": `${origin}/#organization` },
      areaServed: { "@type": "AdministrativeArea", name: "Queensland" },
      url: pageUrl,
    },
    breadcrumbJsonLd(pageUrl, [
      { name: "Home", item: `${origin}/` },
      { name: "Sell my car", item: pageUrl },
    ]),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="cs-page-hero py-5">
        <div className="container py-lg-4">
          <div className="row g-4 align-items-center">
            <div className="col-lg-8">
              <h1 className="display-3 fw-bold mb-3 ">
                Obligation-free valuation &amp; competitive offers
              </h1>
              <p className="lead mb-0">
                Tell us about your vehicle — we&apos;ll tailor an offer to suit
                you, with no pressure to proceed.
              </p>
              <a
                href="#sell-my-car-form"
                className="btn btn-primary btn-lg cs-pill fw-semibold cs-cta-strong mt-3 px-4 fs-5"
              >
                Sell My Car
              </a>
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

      <section
        id="sell-my-car-form"
        className="py-5 smc-form-section border-top border-light-subtle"
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-7">
              <SellMyCarValuationForm />
            </div>
          </div>
        </div>
      </section>

      <ContactInfo />
    </>
  );
}
