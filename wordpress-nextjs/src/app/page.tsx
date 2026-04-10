import { Metadata } from "next";
export const dynamic = "force-dynamic";
import { getSiteSettings } from "@/lib/wordpress";
import { getCurrentUrlAndRoute, siteUrlMetadataFields } from "@/lib/site-url";
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
    title: "Quality Used Cars Brisbane | Expert Finance &amp; Sourcing",
    description:
      siteSettings?.description ||
      "Access 60+ premium 4x4s, SUVs, and commercial vehicles. Based in Ormiston, we provide $0 deposit finance and statewide delivery from Brisbane to Cairns.",
    ...siteUrlMetadataFields(currentUrl, currentRoute),
  };
}

export default async function Home() {
  // Note: Previous recentPosts fetch removed as it's not part of the new design.
  // Use getPosts if you need to display blog posts in the future.

  return (
    <>
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
