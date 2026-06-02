import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress";
import { getMetadata, getAcfSeoCopy } from "@/lib/wordpress/seo";
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
import ContactForm from "./ContactForm";
import ContactInfo from "@/components/ContactInfo";
import "../[slug]/cms-page.scss";
import "./contact.css";

export const dynamic = "force-dynamic";

const CONTACT_SLUG = "contact";
const CONTACT_PATH = "/contact";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(CONTACT_SLUG);
  if (!page) {
    return mergeSiteUrlMetadata({ title: "Contact" }, CONTACT_PATH);
  }
  return mergeSiteUrlMetadata(getMetadata(page), CONTACT_PATH);
}

export default async function ContactPage() {
  const page = await getPageBySlug(CONTACT_SLUG);
  if (!page) {
    notFound();
  }

  const { currentUrl } = await getCurrentUrlAndRoute(CONTACT_PATH);
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
      types: ["ContactPage"],
    }),
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
