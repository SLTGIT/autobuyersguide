import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress";
import { getMetadata, getAcfSeoCopy } from "@/lib/wordpress/seo";
import WpRenderedHtml from "@/components/cms/WpRenderedHtml";
import { getCurrentUrlAndRoute, mergeSiteUrlMetadata } from "@/lib/site-url";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbJsonLd,
  jsonLdGraph,
  organizationJsonLd,
  stripHtml,
  upgradeHttpToHttpsUrl,
  webPageJsonLd,
  webSiteJsonLd,
} from "@/lib/json-ld";
import FinanceEnquiryForm from "./FinanceEnquiryForm";
import "../[slug]/cms-page.scss";
import "../contact/contact.css";
import "./finance-centre.css";

export const revalidate = 3600;

const FINANCE_CENTRE_SLUG = "finance-centre";
const FINANCE_CENTRE_PATH = "/finance-centre";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(FINANCE_CENTRE_SLUG);
  if (!page) {
    return mergeSiteUrlMetadata(
      { title: "Finance centre" },
      FINANCE_CENTRE_PATH,
    );
  }
  return mergeSiteUrlMetadata(getMetadata(page), FINANCE_CENTRE_PATH);
}

export default async function FinanceCentrePage() {
  const page = await getPageBySlug(FINANCE_CENTRE_SLUG);
  if (!page) {
    notFound();
  }

  const { currentUrl } = await getCurrentUrlAndRoute(FINANCE_CENTRE_PATH);
  const pageUrl = upgradeHttpToHttpsUrl(currentUrl);
  const origin = new URL(pageUrl).origin;
  const acfSeo = getAcfSeoCopy(page);
  const headline = stripHtml(page.title.rendered);
  const excerpt = stripHtml(page.excerpt?.rendered || "");
  const seoTitle = acfSeo?.title || headline;
  const seoDescription = acfSeo?.description || excerpt || headline;

  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin),
    webPageJsonLd({
      pageUrl,
      name: seoTitle,
      description: seoDescription,
    }),
    {
      "@type": "FinancialService",
      "@id": `${pageUrl}#financial-service`,
      name: "Vehicle finance — Car Sales Brisbane",
      url: pageUrl,
      provider: { "@id": `${origin}/#organization` },
      areaServed: { "@type": "AdministrativeArea", name: "Queensland" },
    },
    breadcrumbJsonLd(pageUrl, [
      { name: "Home", item: `${origin}/` },
      { name: headline, item: pageUrl },
    ]),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      {page.content?.rendered?.trim() ? (
        <WpRenderedHtml html={page.content.rendered} />
      ) : null}

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
                <div className="d-flex gap-3 align-items-center">
                  <span className="cs-trust-icon">
                    <i className="bi bi-cash-stack" aria-hidden="true"></i>
                  </span>
                  <h3 className="h5 fw-bold">No-Deposit Finance</h3>
                </div>
                <p className="text-secondary mb-0">
                  Finance options for approved applicants from our Ormiston hub.
                </p>
              </article>
            </div>
            <div className="col-md-4">
              <article className="cs-card h-100 p-4">
                <div className="d-flex gap-3 align-items-center">
                  <span className="cs-trust-icon">
                    <i className="bi bi-briefcase" aria-hidden="true"></i>
                  </span>
                  <h3 className="h5 fw-bold">ABN Specialist</h3>
                </div>
                <p className="text-secondary mb-0">
                  Specialist ABN and low-doc support for Brisbane tradies.
                </p>
              </article>
            </div>
            <div className="col-md-4">
              <article className="cs-card h-100 p-4">
                <div className="d-flex gap-3 align-items-center">
                  <span className="cs-trust-icon">
                    <i className="bi bi-truck" aria-hidden="true"></i>
                  </span>
                  <h3 className="h5 fw-bold">QLD Delivery</h3>
                </div>
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
