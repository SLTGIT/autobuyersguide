import { Metadata } from "next";
import { getCurrentUrlAndRoute, siteUrlMetadataFields } from "@/lib/site-url";

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

export default function FinanceDisclaimer() {
  return (
    <div className="p-4">
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
