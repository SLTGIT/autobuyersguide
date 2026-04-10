import { Metadata } from "next";
import { getCurrentUrlAndRoute, siteUrlMetadataFields } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const { currentUrl, currentRoute } = await getCurrentUrlAndRoute(
    "/privacy-policy"
  );
  return {
    title: "Privacy Policy Car Sales Brisbane and Statewide Auto Group",
    description:
      "This demonstration build treats customer enquiries as part of the Statewide Auto Group operating environment. Contact, finance, and sourcing submissions should be managed under Statewide Auto Group privacy practices, with MDL 4316086 and the Ormiston address visible throughout the user journey.",
    ...siteUrlMetadataFields(currentUrl, currentRoute),
  };
}

export default function PrivacyPolicy() {
  return (
    <div className="p-4">
      <article className="">
        <h1>Used Car Sales Brisbane Finance Privacy Policy</h1>
        <p>
          This demonstration build treats customer enquiries as part of the
          Statewide Auto Group operating environment. Contact, finance, and
          sourcing submissions should be managed under Statewide Auto Group
          privacy practices, with MDL 4316086 and the Ormiston address visible
          throughout the user journey.
        </p>
      </article>
    </div>
  );
}
