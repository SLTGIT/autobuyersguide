import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress";
import { getMetadata, getYoastSeoCopy } from "@/lib/wordpress/seo";
import { repairWpRenderedHtml } from "@/lib/wordpress/repair-rendered-html";
import { getCurrentUrlAndRoute, mergeSiteUrlMetadata } from "@/lib/site-url";
import JsonLd from "@/components/JsonLd";
import {
  autoDealerJsonLd,
  jsonLdGraph,
  organizationJsonLd,
  stripHtml,
  upgradeHttpToHttpsUrl,
  webPageJsonLd,
  webSiteJsonLd,
} from "@/lib/json-ld";
import HomeBanner from "@/components/home/HomeBanner";
import PopularCarTypes from "@/components/home/PopularCarTypes";
import PopularUsedCars from "@/components/home/PopularUsedCars";
import LatestBlogPosts from "@/components/home/LatestBlogPosts";
import DriveawaySection from "@/components/home/DriveawaySection";
import VisitUs from "@/components/home/VisitUs";
import "./[slug]/cms-page.scss";

export const dynamic = "force-dynamic";

const HOME_SLUG = "home";
const HOME_PATH = "/";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(HOME_SLUG);
  if (!page) {
    return mergeSiteUrlMetadata({ title: "Home" }, HOME_PATH);
  }
  return mergeSiteUrlMetadata(getMetadata(page), HOME_PATH);
}

export default async function Home() {
  const page = await getPageBySlug(HOME_SLUG);
  if (!page) {
    notFound();
  }

  const { currentUrl } = await getCurrentUrlAndRoute(HOME_PATH);
  const pageUrl = upgradeHttpToHttpsUrl(currentUrl);
  const origin = new URL(pageUrl).origin;
  const yoastSeo = getYoastSeoCopy(page);
  const headline = stripHtml(page.title.rendered);
  const excerpt = stripHtml(page.excerpt?.rendered || "");
  const seoTitle = yoastSeo?.title || headline;
  const seoDescription = yoastSeo?.description || excerpt || headline;

  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin, { includeSearchAction: true }),
    autoDealerJsonLd(origin),
    webPageJsonLd({
      pageUrl,
      name: seoTitle,
      description: seoDescription,
    }),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <HomeBanner />
      <PopularCarTypes />
      <PopularUsedCars />
      <LatestBlogPosts />
      {/* <DriveawaySection /> */}
      <VisitUs />
      {page.content?.rendered?.trim() ? (
        <div
          className=""
          dangerouslySetInnerHTML={{
            __html: repairWpRenderedHtml(page.content.rendered),
          }}
        />
      ) : null}
    </>
  );
}
