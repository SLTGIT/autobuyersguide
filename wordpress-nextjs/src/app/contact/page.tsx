import type { Metadata } from "next";
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
import ContactForm from "./ContactForm";
import "./contact.css";
import ContactInfo from "@/components/ContactInfo";
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

export default async function Contact() {
  const { currentUrl } = await getCurrentUrlAndRoute("/contact");
  const pageUrl = upgradeHttpToHttpsUrl(currentUrl);
  const origin = new URL(pageUrl).origin;
  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin),
    webPageJsonLd({
      pageUrl,
      name: "Contact Car Sales Brisbane and Statewide Auto Group",
      description:
        "Contact Car Sales Brisbane team at Ormiston for used cars, finance pre-approval, sell-my-car enquiries, and Brisbane delivery support.",
      types: ["ContactPage"],
    }),
    breadcrumbJsonLd(pageUrl, [
      { name: "Home", item: `${origin}/` },
      { name: "Contact", item: pageUrl },
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

      <ContactInfo />
    </>
  );
}
