import { Metadata } from "next";
import { getCurrentUrlAndRoute, siteUrlMetadataFields } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const { currentUrl, currentRoute } = await getCurrentUrlAndRoute(
    "/terms-of-service"
  );
  return {
    title: "Terms of Service Car Sales Brisbane and Statewide Auto Group",
    description:
      "Vehicle price, specification, imagery, and finance information on this showroom is referenced from Car Sales Brisbane inventory and should be confirmed before purchase. Finance examples are indicative only and are not guaranteed offers.",
    ...siteUrlMetadataFields(currentUrl, currentRoute),
  };
}

export default function TermsOfService() {
  return (
    <div className="p-4">
      <article className="">
        <h1>Used Car Sales Brisbane Terms of Service</h1>
        <p>
          Vehicle price, specification, imagery, and finance information on this
          showroom is referenced from Car Sales Brisbane inventory and should
          be confirmed before purchase. Finance examples are indicative only and
          are not guaranteed offers.
        </p>
      </article>
    </div>
  );
}
