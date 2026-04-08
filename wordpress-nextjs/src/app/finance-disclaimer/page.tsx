import { Metadata } from "next";
import { getSiteSettings } from "@/lib/wordpress";

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();
  return {
    // title: siteSettings?.title || 'Home | Statewide Auto Group',
    title: "Finance Disclaimer | Car Sales Brisbane",
    description: "Finance Disclaimer | Car Sales Brisbane",
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
