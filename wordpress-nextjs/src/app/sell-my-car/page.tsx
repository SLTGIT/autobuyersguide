import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress";
import { getMetadata, getYoastSeoCopy } from "@/lib/wordpress/seo";
import { repairWpRenderedHtml } from "@/lib/wordpress/repair-rendered-html";
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
import SellMyCarValuationForm from "./SellMyCarValuationForm";
import ContactInfo from "@/components/ContactInfo";
import "../[slug]/cms-page.scss";
import "./sell-my-car.css";

export const dynamic = "force-dynamic";

const SELL_MY_CAR_SLUG = "sell-my-car";
const SELL_MY_CAR_PATH = "/sell-my-car";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(SELL_MY_CAR_SLUG);
  if (!page) {
    return mergeSiteUrlMetadata({ title: "Sell my car" }, SELL_MY_CAR_PATH);
  }
  return mergeSiteUrlMetadata(getMetadata(page), SELL_MY_CAR_PATH);
}

export default async function SellMyCarPage() {
  const page = await getPageBySlug(SELL_MY_CAR_SLUG);
  if (!page) {
    notFound();
  }

  const { currentUrl } = await getCurrentUrlAndRoute(SELL_MY_CAR_PATH);
  const pageUrl = upgradeHttpToHttpsUrl(currentUrl);
  const origin = new URL(pageUrl).origin;
  const yoastSeo = getYoastSeoCopy(page);
  const headline = stripHtml(page.title.rendered);
  const excerpt = stripHtml(page.excerpt?.rendered || "");
  const seoTitle = yoastSeo?.title || headline;
  const seoDescription = yoastSeo?.description || excerpt || headline;

  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin),
    webPageJsonLd({
      pageUrl,
      name: seoTitle,
      description: seoDescription,
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
      { name: headline, item: pageUrl },
    ]),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      {page.content?.rendered?.trim() ? (
        <div
          className=""
          dangerouslySetInnerHTML={{
            __html: repairWpRenderedHtml(page.content.rendered),
          }}
        />
      ) : null}

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
