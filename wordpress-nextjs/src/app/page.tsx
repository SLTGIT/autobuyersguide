import { Metadata } from "next";
export const dynamic = "force-dynamic";
import { getSiteSettings } from "@/lib/wordpress";
import { getCurrentUrlAndRoute, siteUrlMetadataFields } from "@/lib/site-url";
import JsonLd from "@/components/JsonLd";
import {
  autoDealerJsonLd,
  jsonLdGraph,
  organizationJsonLd,
  upgradeHttpToHttpsUrl,
  webPageJsonLd,
  webSiteJsonLd,
} from "@/lib/json-ld";
import HomeBanner from "@/components/home/HomeBanner";
import PopularCarTypes from "@/components/home/PopularCarTypes";
import PopularBrandsSlider from "@/components/home/PopularBrandsSlider";
import InfoBlocks from "@/components/home/InfoBlocks";
import LatestBlogPosts from "@/components/home/LatestBlogPosts";
import PopularUsedCars from "@/components/home/PopularUsedCars";
import VisitUs from "@/components/home/VisitUs";

const HOME_PATH = "/";

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();
  const { currentUrl, currentRoute } = await getCurrentUrlAndRoute(HOME_PATH);
  return {
    // title: siteSettings?.title || 'Home | Statewide Auto Group',
    title: "Quality Used Cars Brisbane | Expert Finance & Sourcing",
    description:
      siteSettings?.description ||
      "Access premium used 4x4s, SUVs, and commercial vehicles. Based in Ormiston, we provide $0 deposit finance and statewide delivery from Brisbane to Cairns.",
    // ...siteUrlMetadataFields(currentUrl, currentRoute),
  };
}

export default async function Home() {
  const { currentUrl } = await getCurrentUrlAndRoute(HOME_PATH);
  const pageUrl = upgradeHttpToHttpsUrl(currentUrl);
  const origin = new URL(pageUrl).origin;
  const homeDescription =
    "Access premium used 4x4s, SUVs, and commercial vehicles. Based in Ormiston, we provide $0 deposit finance and statewide delivery from Brisbane to Cairns.";
  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin, { includeSearchAction: true }),
    autoDealerJsonLd(origin),
    webPageJsonLd({
      pageUrl,
      name: "Quality Used Cars Brisbane | Expert Finance & Sourcing",
      description: homeDescription,
    }),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <HomeBanner />
      {/* <SearchForm /> */}
      {/* <CitySearchSlider /> */}
      <PopularCarTypes />
      {/* <PopularBrandsSlider /> */}
      <PopularUsedCars />
      <LatestBlogPosts />
      {/* <InfoBlocks /> */}
      <VisitUs />
    </>
  );
}
