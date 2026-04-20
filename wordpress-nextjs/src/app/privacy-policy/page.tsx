import { Metadata } from "next";
import Link from "next/link";
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
  const { currentUrl, currentRoute } =
    await getCurrentUrlAndRoute("/privacy-policy");
  return {
    title: "Privacy Policy Car Sales Brisbane and Statewide Auto Group",
    description:
      "How Car Sales Brisbane and Statewide Auto Group collect, use, disclose, and protect your personal information under the Australian Privacy Principles.",
    ...siteUrlMetadataFields(currentUrl, currentRoute),
  };
}

export default async function PrivacyPolicy() {
  const { currentUrl } = await getCurrentUrlAndRoute("/privacy-policy");
  const pageUrl = upgradeHttpToHttpsUrl(currentUrl);
  const origin = new URL(pageUrl).origin;
  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin),
    webPageJsonLd({
      pageUrl,
      name: "Privacy Policy Car Sales Brisbane and Statewide Auto Group",
      description:
        "How Car Sales Brisbane and Statewide Auto Group collect, use, disclose, and protect your personal information under the Australian Privacy Principles.",
    }),
    breadcrumbJsonLd(pageUrl, [
      { name: "Home", item: `${origin}/` },
      { name: "Privacy policy", item: pageUrl },
    ]),
  );

  return (
    <div className="p-4">
      <JsonLd data={jsonLd} />
      <article className="max-w-3xl space-y-6">
        <h1>Used Car Sales Brisbane Privacy Policy</h1>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">We respect your privacy</h2>
          <p>
            Statewide Auto Group respects your right to privacy and is committed
            to safeguarding the privacy of our customers and website visitors.
            We adhere to the Australian Privacy Principles contained in the
            Privacy Act 1988 (Cth). This policy sets out how we collect and
            treat your personal information when you use Car Sales Brisbane
            (this website) and our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Why do we collect your information?</h2>
          <p>
            We&apos;ll collect your information for a number of reasons,
            including:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              to respond to enquiries regarding the products and services that
              we and/or our authorised retailers offer;
            </li>
            <li>to provide and market our products and services;</li>
            <li>
              to administer customer and warranty claims and service and recall
              campaigns;
            </li>
            <li>
              to inform you of offers and events and to facilitate and process
              your ordering of any special offers, products and services;
            </li>
            <li>to meet our legal obligations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2>
            What kinds of information does Statewide Auto Group collect?
          </h2>
          <p>We may collect and hold the following information from you:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              Your contact and identification information such as your name,
              date of birth, contact number(s), email address(es), residential
              and/or business address(es), demographic information (such as
              postcode, age, gender) and driver&apos;s licence details.
            </li>
            <li>
              Your vehicle and servicing details including vehicle registration,
              vehicle purchase details, service appointment bookings.
            </li>
            <li>
              Your finance details such as financial, insurance or credit
              information, marital status, employment details and history.
            </li>
          </ul>
          <p>
            Additionally, we may also collect any other information you provide
            while interacting with us.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Cookies</h2>
          <p>
            We use cookies on our website. Cookies are small text files that are
            stored by your browser when you visit a website. This identifies
            the browser used and can be recognised by our web server. We use
            cookies to associate you with social media platforms like Facebook
            and, if you so choose, enable interaction between your activities
            on our Platforms and those social media platforms. Our website also
            uses cookies to analyse website traffic and help us provide a better
            website visitor experience. In addition, cookies may be used to
            serve relevant ads to website visitors through third party services
            such as Google Adwords. These ads may appear on this website or
            other websites you visit. You can object to the use of cookies
            through your browser settings. However, this may prevent you from
            taking full advantage of our website.
          </p>
          <p>
            We use Google Analytics to gather statistics about how this website
            is accessed. Google Analytics uses cookies to gather information for
            the purpose of providing statistical reporting.
          </p>
          <p>
            The information generated by the cookie about your use of the
            website will be transmitted to and stored by Google on servers
            located outside of Australia. No personally identifying information
            is recorded or provided to Google.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Do we disclose your personal information to anybody?</h2>
          <p>
            Statewide Auto Group may disclose your personal information in
            certain circumstances. We may disclose your personal information to:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>our related companies;</li>
            <li>the manufacturer of vehicles that we sell;</li>
            <li>insurance companies;</li>
            <li>credit providers;</li>
            <li>
              state government entities responsible for motor vehicle
              registrations and driving infringements;
            </li>
            <li>
              other companies or individuals who assist us in providing
              services or who perform functions on our behalf (such as mailing
              houses or our live chat service provider) who are generally
              contract-bound to protect your privacy;
            </li>
            <li>
              law enforcement bodies such as the police, who seek access to your
              personal information for law enforcement purposes; and
            </li>
            <li>anyone else to whom you have authorised us to disclose it.</li>
          </ul>
          <p>
            For example: Sometimes we are required or authorised by law to
            disclose your personal information. For example we may disclose your
            personal information during the registration or transfer of a
            vehicle, or to an insurance company transacting Compulsory Third
            Party insurance. We may also disclose your personal information to
            the Motor Vehicle Manufacturer or Distributor to ensure the proper
            registration of Warranty details for the protection of the
            customers vehicle.
          </p>
        </section>

        <section className="space-y-3">
          <h2>How we collect your personal information</h2>
          <p>
            Statewide Auto Group collects personal information from you in a
            variety of ways, including when you interact with us electronically
            or in person, when you access our website and when we provide our
            services to you. We may receive personal information from third
            parties. If we do, we will protect it as set out in this Privacy
            Policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Is my personal information secure?</h2>
          <p>
            Statewide Auto Group is committed to ensuring that the information
            you provide to us is secure. In order to prevent unauthorised access
            or disclosure, we have put in place suitable physical, electronic
            and managerial procedures to safeguard and secure information and
            protect it from misuse, interference, loss and unauthorised access,
            modification and disclosure.
          </p>
          <p>
            The transmission and exchange of information is carried out at your
            own risk. We cannot guarantee the security of any information that
            you transmit to us, or receive from us. Although we take measures to
            safeguard against unauthorised disclosures of information, we
            cannot assure you that personal information that we collect will not
            be disclosed in a manner that is inconsistent with this Privacy
            Policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2>
            Can I access the personal information Statewide Auto Group holds
            about me?
          </h2>
          <p>
            In line with the Privacy Act, you can request access to any of the
            personal information we hold about you by contacting Statewide Auto
            Group. If you would like to access the information we hold on you,
            please contact us on{" "}
            <a href="tel:0418908870" className="text-decoration-underline">
              0418 908 870
            </a>{" "}
            or go to our{" "}
            <Link href="/contact" className="text-decoration-underline">
              contact page
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2>Opting out</h2>
          <p>
            We will always provide individuals with an opportunity to opt out of
            receiving direct marketing communications from us. If you have
            received a direct marketing communication from us and do not wish to
            receive these communications from us in the future, just use the
            &quot;unsubscribe&quot; function in the email or SMS, or tick the opt
            out box on postal communications and return the mailed item to us.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Contact details</h2>
          <p>
            If you have questions about our approach to privacy or if you have
            any further questions regarding this policy please contact us using
            the details below.
          </p>
          <ul className="list-none space-y-2 pl-0">
            <li>
              <strong>Phone:</strong>{" "}
              <a href="tel:0418908870" className="text-decoration-underline">
                0418 908 870
              </a>
            </li>
            <li>
              <strong>Mailing address:</strong> Car Sales Brisbane,
              4160
            </li>
            {/* <li>
              <strong>QLD Dealer License:</strong> 4316086
            </li> */}
          </ul>
        </section>

        <section className="space-y-3">
          <h2>Complaints about privacy</h2>
          <p>
            If you have any complaints about our privacy practices, please feel
            free to send in details of your complaints via our{" "}
            <Link href="/contact" className="text-decoration-underline">
              contact page
            </Link>
            . We take complaints very seriously and will respond shortly after
            receiving written notice of your complaint.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Changes to our Privacy Policy</h2>
          <p>
            Please be aware that we may change this Privacy Policy in the
            future. We may modify this Policy at any time, in our sole
            discretion and all modifications will be effective immediately
            upon our posting of the modifications on our website or notice
            board. Please check back from time to time to review our Privacy
            Policy.
          </p>
        </section>
      </article>
    </div>
  );
}
