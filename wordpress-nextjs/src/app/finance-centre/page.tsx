import { Metadata } from "next";
import Link from "next/link";
import { getCurrentUrlAndRoute, siteUrlMetadataFields } from "@/lib/site-url";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbJsonLd,
  jsonLdGraph,
  organizationJsonLd,
  webPageJsonLd,
  webSiteJsonLd,
} from "@/lib/json-ld";
import FinanceEnquiryForm from "./FinanceEnquiryForm";
import "../contact/contact.css";
import "./finance-centre.css";

export async function generateMetadata(): Promise<Metadata> {
  const { currentUrl, currentRoute } =
    await getCurrentUrlAndRoute("/finance-centre");
  return {
    title: "Finance Centre Car Sales Brisbane and Statewide Auto Group",
    description:
      // not more than 152 characters
      "Check finance eligibility, get pre-approval, and get delivery support from Car Sales Brisbane and Statewide Auto Group.",
    ...siteUrlMetadataFields(currentUrl, currentRoute),
  };
}

export default async function FinanceCentre() {
  const { currentUrl } = await getCurrentUrlAndRoute("/finance-centre");
  const origin = new URL(currentUrl).origin;
  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin),
    webPageJsonLd({
      pageUrl: currentUrl,
      name: "Finance Centre Car Sales Brisbane and Statewide Auto Group",
      description:
        "Check finance eligibility, get pre-approval, and get delivery support from Car Sales Brisbane and Statewide Auto Group.",
    }),
    {
      "@type": "FinancialService",
      "@id": `${currentUrl}#financial-service`,
      name: "Vehicle finance — Car Sales Brisbane",
      url: currentUrl,
      provider: { "@id": `${origin}/#organization` },
      areaServed: { "@type": "AdministrativeArea", name: "Queensland" },
    },
    breadcrumbJsonLd(currentUrl, [
      { name: "Home", item: `${origin}/` },
      { name: "Finance centre", item: currentUrl },
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
                Finance Pre-Approval
              </span> */}
              <h1 className="display-5 fw-bold mb-3 cs-title-tight">
                Check Finance Eligibility
              </h1>
              <p className="lead mb-0">
                Finance-first support for Brisbane buyers, ABN holders, and
                low-doc applicants.
              </p>
            </div>
            <div className="col-lg-5">
              <article className="card border-0 shadow-lg rounded-5">
                <div className="card-body p-4 p-lg-5">
                  <div className="d-grid gap-3">
                    <a
                      className="btn text-white cs-pill"
                      style={{ background: "var(--cs-primary)" }}
                      href="mailto:sales@statewideautogroup.com.au"
                    >
                      Check Finance Eligibility
                    </a>
                    <a
                      className="btn btn-outline-primary cs-pill"
                      href="mailto:sales@statewideautogroup.com.au"
                    >
                      Finance Pre-Approval
                    </a>
                    <a
                      className="btn btn-outline-primary cs-pill"
                      href="tel:0418908870"
                    >
                      Call 0418908870
                    </a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-5 bg-white border-bottom border-light-subtle"
        aria-labelledby="fc-apply-heading"
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-9">
              <h2
                id="fc-apply-heading"
                className="display-6 fw-bold mb-3 cs-title-tight text-dark"
              >
                Apply for Finance
              </h2>
              <p className="fc-apply-subtitle text-secondary fs-5 mb-4 mb-lg-5">
                Provider of car finance in Brisbane QLD
              </p>
              <ul className="list-unstyled row g-4 fc-apply-checklist mb-4 mb-lg-5">
                <li className="col-md-6">
                  <div className="d-flex gap-3 align-items-start">
                    <span className="fc-apply-check-icon" aria-hidden>
                      <i className="bi bi-check-lg" />
                    </span>
                    <span className="fc-apply-check-label">
                      Simple, quick, and easy.
                    </span>
                  </div>
                </li>
                <li className="col-md-6">
                  <div className="d-flex gap-3 align-items-start">
                    <span className="fc-apply-check-icon" aria-hidden>
                      <i className="bi bi-check-lg" />
                    </span>
                    <span className="fc-apply-check-label">
                      Fast approvals and settlements.
                    </span>
                  </div>
                </li>
              </ul>
              <div className="fc-apply-body text-secondary">
                <p>
                  You&apos;ve found your perfect vehicle — drive it home sooner
                  with our range of tailored finance solutions.
                </p>
                <p>
                  Statewide Auto Group are here to help you find the right
                  vehicle finance solution for your next car. Our team are
                  experts when it comes to helping our customers find the best
                  finance solution for their budget. Try our used car loans
                  calculator to compare loans and calculate monthly repayments
                  depending on interest rates.
                </p>
                <p className="mb-0">
                  At Statewide Auto Group, our car loans Brisbane department are
                  passionate about getting you behind the wheel sooner. For more
                  information about any of our finance solutions,{" "}
                  <Link href="/contact" className="fc-apply-inline-link">
                    Contact
                  </Link>{" "}
                  a friendly member of our team for an obligation-free chat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 border-bottom border-light-subtle fc-finance-form-section">
        <div className="container">
          <FinanceEnquiryForm />
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <article className="cs-card h-100 p-4">
                <span className="cs-trust-icon">
                  <i className="bi bi-cash-stack"></i>
                </span>
                <h3 className="h5 fw-bold">No-Deposit Finance</h3>
                <p className="text-secondary mb-0">
                  Finance options for approved applicants from our Ormiston hub.
                </p>
              </article>
            </div>
            <div className="col-md-4">
              <article className="cs-card h-100 p-4">
                <span className="cs-trust-icon">
                  <i className="bi bi-briefcase"></i>
                </span>
                <h3 className="h5 fw-bold">ABN Specialist</h3>
                <p className="text-secondary mb-0">
                  Specialist ABN and low-doc support for Brisbane tradies.
                </p>
              </article>
            </div>
            <div className="col-md-4">
              <article className="cs-card h-100 p-4">
                <span className="cs-trust-icon">
                  <i className="bi bi-truck"></i>
                </span>
                <h3 className="h5 fw-bold">QLD Delivery</h3>
                <p className="text-secondary mb-0">
                  Delivery support from Brisbane to regional Queensland.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
