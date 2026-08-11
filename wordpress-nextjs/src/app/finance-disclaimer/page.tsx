import { Metadata } from "next";
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

export async function generateMetadata(): Promise<Metadata> {
  const { currentUrl, currentRoute } = await getCurrentUrlAndRoute(
    "/finance-disclaimer"
  );
  return {
    title: "Finance Disclaimer Car Sales Brisbane and Statewide Auto Group",
    description:
      // not more than 152 characters
      "This finance disclaimer explains how we collect, use, and share your personal information when you visit our website or use our services.",
    ...siteUrlMetadataFields(currentUrl, currentRoute),
  };
}

export default async function FinanceDisclaimer() {
  const { currentUrl } = await getCurrentUrlAndRoute("/finance-disclaimer");
  const pageUrl = upgradeHttpToHttpsUrl(currentUrl);
  const origin = new URL(pageUrl).origin;
  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin),
    webPageJsonLd({
      pageUrl,
      name: "Finance Disclaimer Car Sales Brisbane and Statewide Auto Group",
      description:
        "This finance disclaimer explains how we collect, use, and share your personal information when you visit our website or use our services.",
    }),
    breadcrumbJsonLd(pageUrl, [
      { name: "Home", item: `${origin}/` },
      { name: "Finance disclaimer", item: pageUrl },
    ]),
  );

  return (
    <div className="p-4">
      <JsonLd data={jsonLd} />
      <article className="">
        <h1>Used Car Sales Brisbane Finance Disclaimer</h1>
        <p>
          Weekly repayment figures are indicative examples only, generated to
          support UX and SEO intent around finance-first conversion. Actual
          approval outcomes, deposit requirements, and rates depend on lender
          assessment, applicant profile, and vehicle selection.
        </p>
      </article>
    </div>
  );
}
