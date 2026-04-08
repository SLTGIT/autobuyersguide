import { Metadata } from "next";
import { getSiteSettings } from "@/lib/wordpress";

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();
  return {
    // title: siteSettings?.title || 'Home | Statewide Auto Group',
    title: "Terms of Service | Car Sales Brisbane",
    description: "Terms of Service | Car Sales Brisbane",
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
