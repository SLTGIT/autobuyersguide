/**
 * Shared JSON-LD helpers and Car Sales Brisbane / Statewide Auto Group entities.
 */

import type { DealerVehicle, VehicleListing } from "@/types/inventory";
import { priceNumber } from "@/lib/inventory/transform";

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export const ORGANIZATION_DESCRIPTION =
  "Car Sales Brisbane is an online sales channel of Statewide Auto Group. We specialize in vehicle sourcing, onsite finance, and Queensland-wide delivery.";

export const WEBSITE_DESCRIPTION =
  "Car Sales Brisbane is a leading provider of used cars in Australia. We offer a wide range of used cars for sale in Australia.";

export const ORG_SAME_AS = [
  "https://www.facebook.com/share/1DREXJCBhb/?mibextid=wwXIfr",
  "https://www.instagram.com/carsalesbrisbaneau?igsh=MTg5bmtic2hjdnNzMg%3D%3D&utm_source=qr",
  "https://www.tiktok.com/@carsalesbrisbane?_r=1&_t=ZS-95OLtLR1kfQ",
  "https://www.google.com/maps/place/Car+Sales+Brisbane/@-27.5224896,153.2562743,17z/data=!3m1!4b1!4m6!3m5!1s0x6b91678932e7fccd:0x6a000d7f9589579b!8m2!3d-27.5224896!4d153.2562743!16s%2Fg%2F11vqstz67d?entry=ttu",
] as const;

export function organizationJsonLd(origin: string) {
  const logoUrl = `${origin}/assets/images/favicon.png`;
  return {
    "@type": "Organization",
    "@id": `${origin}/#organization`,
    name: "Car Sales Brisbane",
    url: origin,
    logo: { "@type": "ImageObject", url: logoUrl },
    description: ORGANIZATION_DESCRIPTION,
    telephone: "+61418908870",
    email: "sales@statewideautogroup.com.au",
    address: {
      "@type": "PostalAddress",
      streetAddress: "56 Freeth St W",
      addressLocality: "Ormiston",
      addressRegion: "QLD",
      postalCode: "4160",
      addressCountry: "AU",
    },
    sameAs: [...ORG_SAME_AS],
  };
}

export function webSiteJsonLd(
  origin: string,
  options?: { includeSearchAction?: boolean }
) {
  const base: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: "Car Sales Brisbane",
    url: origin,
    publisher: { "@id": `${origin}/#organization` },
    description: WEBSITE_DESCRIPTION,
  };
  if (options?.includeSearchAction) {
    base.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${origin}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    };
  }
  return base;
}

const dealerOpeningHours = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ],
    opens: "08:00",
    closes: "17:30",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Saturday",
    opens: "08:00",
    closes: "15:00",
  },
];

export function autoDealerJsonLd(origin: string) {
  return {
    "@type": "AutoDealer",
    "@id": `${origin}/#dealer`,
    name: "Car Sales Brisbane",
    image: `${origin}/assets/images/favicon.png`,
    url: origin,
    telephone: "+61418908870",
    email: "sales@statewideautogroup.com.au",
    address: {
      "@type": "PostalAddress",
      streetAddress: "56 Freeth St W",
      addressLocality: "Ormiston",
      addressRegion: "QLD",
      postalCode: "4160",
      addressCountry: "AU",
    },
    parentOrganization: {
      "@type": "Organization",
      name: "Statewide Auto Group",
    },
    openingHoursSpecification: dealerOpeningHours,
  };
}

export function webPageJsonLd(input: {
  pageUrl: string;
  name: string;
  description: string;
  types?: string[];
}) {
  const origin = new URL(input.pageUrl).origin;
  const types = input.types?.length
    ? ["WebPage", ...input.types]
    : ["WebPage"];
  return {
    "@type": types.length === 1 ? types[0] : types,
    "@id": `${input.pageUrl}#webpage`,
    url: input.pageUrl,
    name: input.name,
    description: input.description,
    isPartOf: { "@id": `${origin}/#website` },
    publisher: { "@id": `${origin}/#organization` },
  };
}

export function breadcrumbJsonLd(
  pageUrl: string,
  items: { name: string; item: string }[]
) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

export function jsonLdGraph(...nodes: unknown[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}

/** Vehicle + Offer for inventory list and VDP (Google vehicle listing fields). */
export function vehicleJsonLdFromInventory(
  origin: string,
  v: DealerVehicle,
  listing: VehicleListing
): Record<string, unknown> {
  const articleUrl = `${origin}/cars/${listing.slug}`;
  const advertised = v.Pricing?.AdvertisedPrice?.trim();
  const driveAway = v.Pricing?.DriveAwayPrice?.trim();
  const priceStr = advertised || driveAway || "";
  const priceVal = priceNumber(priceStr);
  const images = (v.Photos ?? [])
    .map((p) => p.PhotoUrl)
    .filter(Boolean)
    .slice(0, 12);

  const conditionLower = (listing.condition || "used").toLowerCase();
  const itemCondition =
    conditionLower === "new"
      ? "https://schema.org/NewCondition"
      : "https://schema.org/UsedCondition";

  const node: Record<string, unknown> = {
    "@type": "Vehicle",
    "@id": `${articleUrl}#vehicle`,
    name: listing.title,
    url: articleUrl,
    itemCondition,
    vehicleModelDate: listing.year,
  };

  if (listing.make) {
    node.brand = { "@type": "Brand", name: listing.make };
  }
  if (listing.model) node.model = listing.model;
  const colour = v.BodyColour?.trim();
  if (colour) node.color = colour;
  if (listing.odometer != null && listing.odometer > 0) {
    node.mileageFromOdometer = {
      "@type": "QuantitativeValue",
      value: listing.odometer,
      unitCode: "KMT",
    };
  }
  if (images.length) node.image = images;
  if (priceVal != null) {
    node.offers = {
      "@type": "Offer",
      price: priceVal,
      priceCurrency: "AUD",
      availability: "https://schema.org/InStock",
      url: articleUrl,
      seller: { "@id": `${origin}/#organization` },
    };
  }

  return Object.fromEntries(
    Object.entries(node).filter(([, val]) => val !== undefined)
  ) as Record<string, unknown>;
}
