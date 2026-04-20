/**
 * Shared JSON-LD helpers and Car Sales Brisbane / Statewide Auto Group entities.
 */

import type { DealerVehicle, VehicleListing } from "@/types/inventory";
import {
  listingDisplayNumericPriceAud,
  parseInventoryOdometerKm,
  priceNumber,
} from "@/lib/inventory/transform";

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export const ORGANIZATION_DESCRIPTION =
  "Car Sales Brisbane is an online sales channel of Statewide Auto Group. We specialize in vehicle sourcing, onsite finance, and Queensland-wide delivery.";

export const WEBSITE_DESCRIPTION =
  "Car Sales Brisbane is a leading provider of used cars in Australia. We offer a wide range of used cars for sale in Australia.";

/**
 * Clean profile URLs for sameAs (no /share/, no tracking query strings).
 * Facebook share links are replaced with the public page slug aligned to Instagram @carsalesbrisbaneau.
 */
export const ORG_SAME_AS = [
  "https://www.facebook.com/share/1DREXJCBhb/?mibextid=wwXIfr",
  "https://www.instagram.com/carsalesbrisbaneau?igsh=MTg5bmtic2hjdnNzMg%3D%3D&utm_source=qr",
  "https://www.tiktok.com/@carsalesbrisbane?_r=1&_t=ZS-95OLtLR1kfQ",
  "https://www.google.com/maps/place/Car+Sales+Brisbane/@-27.5224896,153.2562743,17z/data=!3m1!4b1!4m6!3m5!1s0x6b91678932e7fccd:0x6a000d7f9589579b!8m2!3d-27.5224896!4d153.2562743!16s%2Fg%2F11vqstz67d?entry=ttu&g_ep=EgoyMDI2MDQwNi4wIKXMDSoASAFQAw%3D%3D",
] as const;

/** Strip query/hash from outbound profile URLs (tracking params) for JSON-LD sameAs. */
export function urlWithoutQueryForSchema(url: string): string {
  try {
    const u = new URL(url);
    u.search = "";
    u.hash = "";
    let href = u.href;
    // Drop Facebook /share/ paths — prefer canonical profile when possible
    if (
      u.hostname.replace(/^www\./, "") === "facebook.com" &&
      u.pathname.includes("/share/")
    ) {
      href = "https://www.facebook.com/share/1DREXJCBhb/?mibextid=wwXIfr";
    }
    return href;
  } catch {
    return url.split("?")[0]?.split("#")[0] ?? url;
  }
}

/** Normalize asset URLs for JSON-LD (http → https; skip localhost). */
export function upgradeHttpToHttpsUrl(url: string): string {
  const t = (url || "").trim();
  if (!t) return t;
  if (t.startsWith("//")) return `https:${t}`;
  if (/^http:\/\//i.test(t)) {
    try {
      const u = new URL(t);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
        return t;
      }
    } catch {
      /* keep upgrading unknown hosts */
    }
    return `https://${t.slice(7)}`;
  }
  return t;
}

/** Physical dealership address (Ormiston showroom). */
export const ORG_POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "56 Freeth St W",
  addressLocality: "Ormiston",
  addressRegion: "QLD",
  postalCode: "4160",
  addressCountry: "AU",
} as const;

export function organizationJsonLd(origin: string) {
  const siteOrigin = upgradeHttpToHttpsUrl(origin);
  const logoUrl = upgradeHttpToHttpsUrl(
    `${siteOrigin}/assets/images/favicon.png`,
  );
  return {
    "@type": "Organization",
    "@id": `${siteOrigin}/#organization`,
    name: "Car Sales Brisbane",
    url: siteOrigin,
    logo: { "@type": "ImageObject", url: logoUrl },
    description: ORGANIZATION_DESCRIPTION,
    telephone: "+61418908870",
    // email: "sales@statewideautogroup.com.au",
    address: { ...ORG_POSTAL_ADDRESS },
    sameAs: ORG_SAME_AS.map((u) => urlWithoutQueryForSchema(u)),
  };
}

export function webSiteJsonLd(
  origin: string,
  options?: { includeSearchAction?: boolean },
) {
  const siteOrigin = upgradeHttpToHttpsUrl(origin);
  const base: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": `${siteOrigin}/#website`,
    name: "Car Sales Brisbane",
    url: siteOrigin,
    inLanguage: "en-AU",
    publisher: { "@id": `${siteOrigin}/#organization` },
    description: WEBSITE_DESCRIPTION,
  };
  if (options?.includeSearchAction) {
    base.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteOrigin}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    };
  }
  return base;
}

const dealerOpeningHours = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
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
  const siteOrigin = upgradeHttpToHttpsUrl(origin);
  return {
    "@type": "AutoDealer",
    "@id": `${siteOrigin}/#dealer`,
    name: "Car Sales Brisbane",
    image: upgradeHttpToHttpsUrl(`${siteOrigin}/assets/images/favicon.png`),
    url: siteOrigin,
    telephone: "+61418908870",
    // email: "sales@statewideautogroup.com.au",
    address: { ...ORG_POSTAL_ADDRESS },
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
  /** Primary entity on this page (e.g. Product #vehicle on a VDP). */
  mainEntity?: { "@id": string };
}) {
  const pageUrl = upgradeHttpToHttpsUrl(input.pageUrl);
  const origin = new URL(pageUrl).origin;
  const types = input.types?.length ? ["WebPage", ...input.types] : ["WebPage"];
  const node: Record<string, unknown> = {
    "@type": types.length === 1 ? types[0] : types,
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: input.name,
    description: input.description,
    inLanguage: "en-AU",
    isPartOf: { "@id": `${origin}/#website` },
    publisher: { "@id": `${origin}/#organization` },
  };
  if (input.mainEntity) node.mainEntity = input.mainEntity;
  return node;
}

export function breadcrumbJsonLd(
  pageUrl: string,
  items: { name: string; item: string }[],
) {
  const canonicalPage = upgradeHttpToHttpsUrl(pageUrl);
  return {
    "@type": "BreadcrumbList",
    "@id": `${canonicalPage}#breadcrumb`,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: upgradeHttpToHttpsUrl(it.item),
    })),
  };
}

export function jsonLdGraph(...nodes: unknown[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}

const GOOGLE_VEHICLE_BODY_TYPES = new Set([
  "convertible",
  "coupe",
  "crossover",
  "full size van",
  "hatchback",
  "minivan",
  "sedan",
  "suv",
  "truck",
]);

/**
 * Maps feed body/type strings to Google vehicle listing bodyType vocabulary
 * (lowercase English: sedan, suv, truck, …).
 * @see https://developers.google.com/search/docs/appearance/structured-data/vehicle-listing
 */
export function normalizeBodyTypeForGoogleVehicle(
  bodyTypeRaw: string,
  typeCode: string,
): string | undefined {
  const raw = bodyTypeRaw.trim();
  const t = raw.toLowerCase();
  if (GOOGLE_VEHICLE_BODY_TYPES.has(t)) return t;
  if (t.includes("full") && t.includes("van")) return "full size van";

  if (/suv|s\.u\.v|sport utility/i.test(raw)) return "suv";
  if (
    /ute|utility|pick.?up|pickup|cab.?chassis|dual.?cab|tray|chassis/i.test(t)
  )
    return "truck";
  if (/hatch/i.test(t)) return "hatchback";
  if (/sedan|saloon/i.test(t)) return "sedan";
  if (/wagon|estate|touring|sw/i.test(t)) return "crossover";
  if (/coupe|koup/i.test(t)) return "coupe";
  if (/convertible|cabrio|roadster/i.test(t)) return "convertible";
  if (/mpv|people mover|passenger van/i.test(t)) return "minivan";
  if (/panel van|cargo van|full.?size van|commercial van/i.test(t))
    return "full size van";

  const c = (typeCode || "").trim().toUpperCase();
  if (c === "TRU") return "truck";

  for (const w of t.split(/[\s/-]+/).filter(Boolean)) {
    if (GOOGLE_VEHICLE_BODY_TYPES.has(w)) return w;
  }
  return undefined;
}

function driveWheelConfigurationFromFeed(drive: string): string | undefined {
  const t = drive.trim().toLowerCase();
  if (!t || t === "—") return undefined;
  if (/awd|all[-\s]?wheel/i.test(t))
    return "https://schema.org/AllWheelDriveConfiguration";
  if (/4wd|4x4|four[-\s]?wheel/i.test(t))
    return "https://schema.org/FourWheelDriveConfiguration";
  if (/fwd|front[-\s]?wheel/i.test(t))
    return "https://schema.org/FrontWheelDriveConfiguration";
  if (/rwd|rear[-\s]?wheel/i.test(t))
    return "https://schema.org/RearWheelDriveConfiguration";
  return undefined;
}

/** SEO Product.category: "Used SUVs", "New Sedans", "Used Cars", … */
function productCategoryLabel(
  conditionLower: string,
  bodyTypeNorm: string | undefined,
): string {
  const isNew = conditionLower === "new";
  const prefix = isNew ? "New" : "Used";
  if (!bodyTypeNorm) return `${prefix} Cars`;
  const map: Record<string, string> = {
    suv: `${prefix} SUVs`,
    truck: `${prefix} Trucks`,
    sedan: `${prefix} Sedans`,
    hatchback: `${prefix} Hatchbacks`,
    coupe: `${prefix} Coupes`,
    convertible: `${prefix} Convertibles`,
    crossover: `${prefix} Crossovers`,
    minivan: `${prefix} Minivans`,
    "full size van": `${prefix} Full Size Vans`,
  };
  return (
    map[bodyTypeNorm] ??
    `${prefix} ${bodyTypeNorm.charAt(0).toUpperCase()}${bodyTypeNorm.slice(1)}s`
  );
}

/**
 * VDP breadcrumb JSON-LD: Home > Used cars / New cars > Make > Model (no “Search”).
 */
export function vehicleVdpBreadcrumbJsonLd(
  pageUrl: string,
  origin: string,
  listing: VehicleListing,
  v: DealerVehicle,
) {
  const siteOrigin = upgradeHttpToHttpsUrl(origin);
  const canonicalPage = upgradeHttpToHttpsUrl(pageUrl);
  const conditionLower = (listing.condition || "used").toLowerCase();
  const catalogHref =
    conditionLower === "new"
      ? `${siteOrigin}/search?condition=New`
      : `${siteOrigin}/search?condition=Used`;
  const catalogLabel = conditionLower === "new" ? "New Cars" : "Used Cars";

  const make = (v.Make?.trim() || listing.make || "").trim();
  const model = (v.Model?.trim() || listing.model || "").trim();
  const makeHref = make
    ? `${siteOrigin}/search?make=${encodeURIComponent(make.toLowerCase())}`
    : `${siteOrigin}/search`;

  const modelCrumbName =
    model ||
    (listing.title.length > 80
      ? `${listing.title.slice(0, 77)}…`
      : listing.title);

  return breadcrumbJsonLd(canonicalPage, [
    { name: "Home", item: `${siteOrigin}/` },
    { name: catalogLabel, item: catalogHref },
    { name: make || "Vehicles", item: makeHref },
    { name: modelCrumbName, item: canonicalPage },
  ]);
}

export type VehicleJsonLdOptions = {
  /** Canonical VDP URL (must match WebPage url); defaults to `${origin}/cars/${slug}` */
  canonicalPageUrl?: string;
};

function inferMakeFromTitle(title: string, year: number): string {
  const parts = title.replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && /^\d{4}$/.test(parts[0])) return parts[1];
  return parts[0] ?? "";
}

function inferModelFromTitle(
  title: string,
  year: number,
  make: string,
): string {
  const parts = title.replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean);
  let i = 0;
  if (parts[0] && /^\d{4}$/.test(parts[0])) i = 1;
  if (make && parts[i]?.toLowerCase() === make.toLowerCase()) i += 1;
  const rest = parts
    .slice(i, i + 8)
    .join(" ")
    .trim();
  return rest || "Base";
}

/** Title-case bodyType for schema display (e.g. Truck, SUV, Full Size Van). */
function bodyTypeForSchemaDisplay(normalizedLower: string): string {
  const map: Record<string, string> = {
    suv: "SUV",
    truck: "Truck",
    sedan: "Sedan",
    hatchback: "Hatchback",
    coupe: "Coupe",
    convertible: "Convertible",
    crossover: "Crossover",
    minivan: "Minivan",
    "full size van": "Full Size Van",
  };
  if (map[normalizedLower]) return map[normalizedLower];
  return normalizedLower
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function feedPricingField(raw: unknown): string {
  if (raw === undefined || raw === null) return "";
  if (typeof raw === "boolean") return "";
  if (typeof raw === "number" && Number.isFinite(raw))
    return String(Math.round(raw));
  return String(raw).trim();
}

/** First dollar amount in free text (title / description / comments). */
function extractAudPriceFromText(
  text: string | undefined | null,
): number | null {
  if (!text?.trim()) return null;
  const normalized = text.replace(/\u202f|\u00a0/g, " ");
  const m = normalized.match(/\$\s*[\d][\d,\s]*(?:\.\d{2})?\b/);
  if (!m) return null;
  return priceNumber(m[0]);
}

/** Best numeric AUD price for Offer (multiple feed fallbacks). */
function resolveVehicleOfferPriceAud(
  v: DealerVehicle,
  listing: VehicleListing,
): number | null {
  const fromVisibleListing = listingDisplayNumericPriceAud(listing);
  if (fromVisibleListing != null) return fromVisibleListing;

  const advertised = feedPricingField(v.Pricing?.AdvertisedPrice);
  const driveAway = feedPricingField(v.Pricing?.DriveAwayPrice);
  const egc = feedPricingField(v.Pricing?.EGCPrice);
  const primary =
    listing.show_drive_away && driveAway
      ? driveAway
      : advertised || driveAway || "";

  const candidates: Array<string | number | undefined | null> = [
    primary,
    advertised,
    driveAway,
    listing.formatted_price,
    listing.drive_away_price ?? undefined,
    egc,
  ];

  if (v.Pricing && typeof v.Pricing === "object") {
    for (const val of Object.values(v.Pricing)) {
      if (typeof val === "boolean") continue;
      if (typeof val === "number" || typeof val === "string") {
        candidates.push(val);
      }
    }
  }

  for (const raw of candidates) {
    const n = priceNumber(raw);
    if (n != null && n > 0 && Number.isFinite(n)) return n;
  }

  for (const txt of [listing.title, v.Description, v.Comments]) {
    const n = extractAudPriceFromText(txt);
    if (n != null && n > 0 && Number.isFinite(n)) return n;
  }

  return null;
}

/**
 * Product + Vehicle JSON-LD for inventory / VDP (Rich Results–friendly).
 */
export function vehicleJsonLdFromInventory(
  origin: string,
  v: DealerVehicle,
  listing: VehicleListing,
  options?: VehicleJsonLdOptions,
): Record<string, unknown> {
  const siteOrigin = upgradeHttpToHttpsUrl(origin);
  const rawProductUrl =
    options?.canonicalPageUrl ?? `${siteOrigin}/cars/${listing.slug}`;
  const productUrl = upgradeHttpToHttpsUrl(rawProductUrl);

  const priceVal = resolveVehicleOfferPriceAud(v, listing);

  const images = (v.Photos ?? [])
    .map((p) => upgradeHttpToHttpsUrl(p.PhotoUrl))
    .filter(Boolean)
    .slice(0, 12);

  const conditionLower = (listing.condition || "used").toLowerCase();
  const itemCondition =
    conditionLower === "new"
      ? "https://schema.org/NewCondition"
      : "https://schema.org/UsedCondition";

  const bodyTypeNorm = normalizeBodyTypeForGoogleVehicle(
    listing.body_type || v.BodyType?.trim() || "",
    listing.type_code,
  );
  const driveWheel = driveWheelConfigurationFromFeed(
    listing.drive_type || v.DriveType?.trim() || "",
  );
  const transmission = listing.transmission?.trim();
  const fuel = listing.fuel_type?.trim();

  const categoryLabel = productCategoryLabel(conditionLower, bodyTypeNorm);

  const makeName = (
    listing.make?.trim() ||
    v.Make?.trim() ||
    inferMakeFromTitle(listing.title, listing.year)
  ).trim();
  const modelName = (
    listing.model?.trim() ||
    v.Model?.trim() ||
    inferModelFromTitle(listing.title, listing.year, makeName)
  ).trim();

  const modelYear = v.ManufactureYear ?? listing.year;
  const yearStr =
    modelYear != null && Number.isFinite(Number(modelYear))
      ? String(modelYear)
      : undefined;

  const node: Record<string, unknown> = {
    "@type": ["Product", "Vehicle"],
    "@id": `${productUrl}#vehicle`,
    name: listing.title,
    url: productUrl,
    category: categoryLabel,
    itemCondition,
    brand: { "@type": "Brand", name: makeName || "Vehicle" },
    model: modelName,
    vehicleModelDate: yearStr,
    productID: String(v.ItemID),
    mainEntityOfPage: { "@id": `${productUrl}#webpage` },
    inLanguage: "en-AU",
  };

  if (bodyTypeNorm) node.bodyType = bodyTypeForSchemaDisplay(bodyTypeNorm);
  if (listing.stock_number) node.sku = listing.stock_number;

  const colour = v.BodyColour?.trim();
  if (colour) node.color = colour;

  const odoKm =
    listing.odometer != null &&
    Number.isFinite(listing.odometer) &&
    listing.odometer >= 0
      ? Math.round(Number(listing.odometer))
      : parseInventoryOdometerKm(v.Odometer);
  if (odoKm != null && Number.isFinite(odoKm) && odoKm >= 0) {
    node.Odometer = {
      "@type": "Value",
      value: String(Math.round(odoKm)),
      unitCode: "km",
    };
  }

  if (images.length) node.image = images;

  if (fuel) {
    node.fuelType = fuel;
    node.vehicleEngine = {
      "@type": "EngineSpecification",
    };
  }
  if (transmission) node.vehicleTransmission = transmission;
  if (driveWheel) node.driveWheelConfiguration = driveWheel;

  if (priceVal != null && Number.isFinite(priceVal) && priceVal > 0) {
    node.offers = {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      url: productUrl,
      price: String(priceVal),
      priceCurrency: "AUD",
      availability: "https://schema.org/InStock",
      seller: { "@id": `${siteOrigin}/#organization` },
    };
  }

  return Object.fromEntries(
    Object.entries(node).filter(([, val]) => val !== undefined),
  ) as Record<string, unknown>;
}
