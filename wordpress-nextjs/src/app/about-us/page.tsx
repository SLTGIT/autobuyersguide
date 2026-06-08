import { Metadata } from "next";
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
import "../[slug]/cms-page.scss";
import "./about.css";

export const dynamic = "force-dynamic";

const ABOUT_SLUG = "about-us";
const ABOUT_PATH = "/about-us";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(ABOUT_SLUG);
  if (!page) {
    return mergeSiteUrlMetadata({ title: "About us" }, ABOUT_PATH);
  }
  return mergeSiteUrlMetadata(getMetadata(page), ABOUT_PATH);
}

export default async function AboutUsPage() {
  const page = await getPageBySlug(ABOUT_SLUG);
  if (!page) {
    notFound();
  }

  const { currentUrl } = await getCurrentUrlAndRoute(ABOUT_PATH);
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
      types: ["AboutPage"],
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
        <WpRenderedHtml html={page.content.rendered} />
      ) : null}
    </>
  );
}
