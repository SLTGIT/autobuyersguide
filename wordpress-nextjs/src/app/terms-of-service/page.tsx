import { Metadata } from "next";
import { getCurrentUrlAndRoute, siteUrlMetadataFields } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const { currentUrl, currentRoute } = await getCurrentUrlAndRoute(
    "/terms-of-service"
  );
  return {
    title: "Terms of Service Car Sales Brisbane and Statewide Auto Group",
    description:
      "Terms of use for the Statewide Auto Group website, including disclaimers, vehicle information, copyright, and acceptable use.",
    ...siteUrlMetadataFields(currentUrl, currentRoute),
  };
}

export default function TermsOfService() {
  return (
    <div className="p-4">
      <article className="max-w-3xl space-y-6">
        <h1>Used Car Sales Brisbane Terms of Service</h1>

        <p>
          This site is provided as an introduction to Statewide Auto Group only,
          based on general information including that provided by third
          parties. Information given may change and some time may pass before
          this website can be updated in respect of all information affected.
          That being so Statewide Auto Group and Total Dealer do not guarantee
          or warrant that information on this website is accurate or complete and
          makes no representations or warranties of any kind, express or
          implied, as to the operation of the site or the information, content
          or details disclosed on this site.
        </p>

        <p>
          Except as expressly provided for in writing or as regarded by law,
          the liability of Statewide Auto Group and Total Dealer arising from
          the use of this site or the goods and services purchased using this
          site is specifically excluded and Statewide Auto Group and Total
          Dealer disclaim all warranties and any liability for damages of any
          kind and any liability whether in contract, tort under statute or
          otherwise for any injury, damage or loss whatsoever. No reliance should
          be placed on information contained or is to be implied or inferred
          from this website without checking the details with an authorised
          officer of Statewide Auto Group. Specifications and descriptions are
          provided by manufacturers.
        </p>

        <section className="space-y-3">
          <h2>Vehicle Information</h2>
          <p>
            The information, pictures, colours, and specifications contained
            within the Statewide Auto Group website are presented as a general
            guide only. Although every effort has been made to ensure that such
            information is correct and up to date, no warrant is provided that
            all such information is reliable, complete, accurate or without
            error. In some cases pictures of overseas models may be shown as a
            guide. Therefore, Statewide Auto Group and Total Dealer do not
            accept liability for damages of any kind resulting from the access
            or use of this site and its contents.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Copyright and Intellectual Property</h2>
          <p>
            All text, images and sounds supplied by the manufacturer, third
            parties or Statewide Auto Group on this site are subject to
            Copyright and other intellectual property rights of the
            manufacturer, suppliers and/or Statewide Auto Group. All production,
            designs and design related works and software, including but not
            limited to website source code, on this site are subject to
            Copyright and intellectual property rights of Total Dealer and are
            licensed for use by Statewide Auto Group. These materials may not be
            copied for commercial use or distribution or otherwise modified or
            reposted to other sites.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Personal &amp; Non Commercial Use Only</h2>
          <p>
            Data on this website are provided for your personal and
            non-commercial use only. You must not, without the written approval
            of Total Dealer:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              Modify, copy, distribute, transmit, display, perform, reproduce,
              publish or license any data from this website;
            </li>
            <li>
              Use or attempt to use any data published on this website to create
              any web site or publication;
            </li>
            <li>
              Mirror or frame any data published within this website;
            </li>
            <li>
              Use any automated process of any sort to query, access or copy any
              data on this website or generate or compile any document or
              database based on the data published on this website;
            </li>
            <li>Transfer or sell any data offered on this website.</li>
          </ul>
        </section>

        <section className="space-y-3 mt-3">
          <h2>Trademark</h2>
          <p>
            All Trademarks displayed on this site are subject to the legal
            rights of Statewide Auto Group or the other Trademark owners and the
            unauthorised use of any Trademark displayed on this site is strictly
            prohibited. 
          </p>
        </section>

        <section className="space-y-3">
          <h2>Contracts</h2>
          <p>
            This site may only be used for lawful purposes and Statewide Auto
            Group reserves the right to deal or refuse to deal with any user. No
            contract will be made or deemed to be entered into unless confirmed
            in writing by Statewide Auto Group.
          </p>
        </section>
      </article>
    </div>
  );
}
