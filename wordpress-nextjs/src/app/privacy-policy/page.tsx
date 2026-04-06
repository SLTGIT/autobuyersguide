import { Metadata } from "next";
import { getSiteSettings } from "@/lib/wordpress";

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();
  return {
    // title: siteSettings?.title || 'Home | Statewide Auto Group',
    title: "Privacy Policy | Statewide Auto Group",
    description: "Privacy Policy | Statewide Auto Group",
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
