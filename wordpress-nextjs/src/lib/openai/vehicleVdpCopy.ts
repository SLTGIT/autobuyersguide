import OpenAI from "openai";
import { unstable_cache } from "next/cache";
import { splitVehicleDescription } from "@/lib/inventory/transform";
import type {
  VehicleVdpAiBreakdownCard,
  VehicleVdpAiContent,
  VehicleVdpAiFaq,
  VehicleVdpAiFeatureItem,
  VehicleVdpAiQuickBuyer,
  VehicleVdpAiSpecRow,
  VehicleVdpAiSpecSection,
  VehicleVdpSnapshot,
  VdpSpecSourceTag,
} from "./vehicleVdpTypes";
import {
  fallbackIconForFeatureItem,
  fallbackIconForSpecLabel,
  resolveBootstrapIconSuffix,
  sanitizeBiSuffix,
} from "./vehicleVdpDisplayUtils";

const VDP_AI_REVALIDATE_SEC = 21600; // 6 hours

/** Hero pill should summarise year/condition/body/fuel — not warranty marketing. */
function sanitizeHeroBadgeForDisplay(badge: string): string {
  const t = badge.trim();
  if (!t) return "";
  if (/\bwarranty\b/i.test(t)) return "";
  return t;
}

function isPlaceholderHeroBadge(s: string): boolean {
  const t = s.trim().toLowerCase();
  if (!t) return true;
  if (/\bcondition\b/.test(t) && /\b(body\s*type|body)\b/.test(t) && /\bfuel\b/.test(t))
    return true;
  if (/\byear\b/.test(t) && /\bcondition\b/.test(t) && /\b(body|fuel)\b/.test(t))
    return true;
  return false;
}

function formatHeroBadgeFromSnapshot(snapshot: VehicleVdpSnapshot): string {
  const parts = [
    String(snapshot.year),
    snapshot.condition,
    snapshot.bodyType,
    snapshot.fuelType,
  ]
    .map((p) => String(p ?? "").trim())
    .filter(Boolean);
  return parts.join(" · ");
}

const VDP_BROWSER_TITLE_SUFFIX = " | Car Sales Brisbane";

export function formatVehicleVdpBrowserTitle(seoTitlePart: string): string {
  const p = seoTitlePart.trim();
  if (!p) return `Cars for sale${VDP_BROWSER_TITLE_SUFFIX}`;
  return `${p}${VDP_BROWSER_TITLE_SUFFIX}`;
}

function normalizeSeoTitlePart(
  raw: string,
  snapshot: VehicleVdpSnapshot
): string {
  let t = raw.trim();
  const suff = "| car sales brisbane";
  if (t.toLowerCase().endsWith(suff)) {
    t = t
      .slice(0, t.length - suff.length)
      .replace(/\s*\|\s*$/i, "")
      .trim();
  }
  if (!t) {
    t =
      snapshot.title.trim() ||
      [snapshot.year, snapshot.make, snapshot.model].filter(Boolean).join(" ");
  }
  const max = 52;
  if (t.length > max) return `${t.slice(0, max - 1)}…`;
  return t;
}

function buildFallbackMetaDescription(snapshot: VehicleVdpSnapshot): string {
  const priceLine =
    snapshot.showDriveAway && snapshot.driveAwayPrice?.trim()
      ? `${snapshot.driveAwayPrice.trim()} drive away`
      : snapshot.advertisedPrice?.trim()
        ? `From ${snapshot.advertisedPrice.trim()}`
        : "";
  const base = `${snapshot.condition} ${snapshot.year} ${snapshot.make} ${snapshot.model}`
    .replace(/\s+/g, " ")
    .trim();
  const bits = [
    base,
    priceLine,
    "View specs and photos. Confirm details with Car Sales Brisbane.",
  ].filter(Boolean);
  let out = bits.join(" ").replace(/\s+/g, " ").trim();
  if (out.length > 160) out = `${out.slice(0, 157)}…`;
  return out;
}

/** Ensures AI-generated or fallback SEO strings are always present and length-safe. */
export function ensureVehicleVdpSeoFields(
  content: VehicleVdpAiContent,
  snapshot: VehicleVdpSnapshot
): VehicleVdpAiContent {
  const seoTitle = normalizeSeoTitlePart(content.seoTitle || "", snapshot);
  let meta = (content.metaDescription || "").trim();
  if (meta.length < 50) {
    meta = buildFallbackMetaDescription(snapshot);
  }
  if (meta.length > 160) meta = `${meta.slice(0, 157)}…`;
  return { ...content, seoTitle, metaDescription: meta };
}

/** Prefer listing data when the model echoes prompt placeholders or omits the year. */
export function buildListingHeroBadge(
  aiBadge: string,
  snapshot: VehicleVdpSnapshot
): string {
  const cleaned = sanitizeHeroBadgeForDisplay(aiBadge);
  if (isPlaceholderHeroBadge(cleaned) || !cleaned) {
    return formatHeroBadgeFromSnapshot(snapshot);
  }
  const year = String(snapshot.year);
  if (/^\d{4}\b/.test(cleaned)) return cleaned;
  if (cleaned.includes(year)) return cleaned;
  return `${year} · ${cleaned}`;
}

function stripTypicalGenerationPreamble(value: string): string {
  return value
    .replace(
      /^\s*not\s+in\s+listing\s*[—–-]\s*typical\s+for\s+this\s+generation\s*:\s*/i,
      ""
    )
    .trim();
}

/** When the model wrongly uses the word "Inferred" as the value, show a real sentence instead. */
function sanitizeSpecRowDisplayValues(rows: VehicleVdpAiSpecRow[]) {
  for (const r of rows) {
    let t = r.value.trim();
    if (/^inferred\.?$/i.test(t)) {
      r.value =
        "Not listed online — check with the dealer for this vehicle.";
      continue;
    }
    t = stripTypicalGenerationPreamble(t);
    if (t) r.value = t;
  }
}

function ensureSpecRowIcons(rows: VehicleVdpAiSpecRow[]) {
  for (const r of rows) {
    r.icon = resolveBootstrapIconSuffix(
      r.icon,
      fallbackIconForSpecLabel(r.label)
    );
  }
}

function ensureFeatureItemIcons(items: VehicleVdpAiFeatureItem[]) {
  for (const it of items) {
    it.icon = resolveBootstrapIconSuffix(
      it.icon,
      fallbackIconForFeatureItem(it.label, it.value)
    );
  }
}

function isSourceTag(x: unknown): x is VdpSpecSourceTag {
  return x === "listing" || x === "inferred" || x === "mixed";
}

/** Lowercase keys so we accept `Label`, `ICON`, etc. from the model. */
function lowerKeyRecord(o: object): Record<string, unknown> {
  const m: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) {
    m[k.toLowerCase()] = v;
  }
  return m;
}

function strField(
  m: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const k of keys) {
    const v = m[k];
    if (typeof v === "string") {
      const t = v.trim();
      if (t) return t;
    }
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return undefined;
}

function parseSpecRow(o: unknown): VehicleVdpAiSpecRow | null {
  if (typeof o !== "object" || o === null) return null;
  const label = (o as { label?: unknown }).label;
  const value = (o as { value?: unknown }).value;
  const sourceTag = (o as { sourceTag?: unknown }).sourceTag;
  const iconRaw = (o as { icon?: unknown }).icon;
  if (typeof label !== "string" || typeof value !== "string") return null;
  const tag = isSourceTag(sourceTag) ? sourceTag : "mixed";
  const icon =
    typeof iconRaw === "string" ? sanitizeBiSuffix(iconRaw) : undefined;
  return { label, value, sourceTag: tag, ...(icon ? { icon } : {}) };
}

function parseFeatureItem(o: unknown): VehicleVdpAiFeatureItem | null {
  if (typeof o === "string") {
    const t = o.trim();
    if (!t) return null;
    const colon = t.indexOf(":");
    if (colon > 0 && colon < t.length - 1) {
      return {
        label: t.slice(0, colon).trim() || "Equipment",
        value: t.slice(colon + 1).trim(),
        icon: "star-fill",
      };
    }
    return { label: "Equipment", value: t, icon: "star-fill" };
  }
  if (typeof o !== "object" || o === null) return null;
  const m = lowerKeyRecord(o as object);
  const labelRaw = strField(m, [
    "label",
    "name",
    "title",
    "heading",
    "category",
    "type",
    "key",
  ]);
  const valueRaw = strField(m, [
    "value",
    "detail",
    "description",
    "body",
    "spec",
    "info",
    "content",
    "item",
  ]);
  const textRaw = strField(m, ["text", "line", "feature", "summary", "equipment"]);
  const iconRaw = m.icon ?? m.bootstrapicon ?? m.bicon;

  let label = "";
  let value = "";
  if (labelRaw && valueRaw) {
    label = labelRaw;
    value = valueRaw;
  } else if (textRaw) {
    const t = textRaw;
    const colon = t.indexOf(":");
    if (colon > 0 && colon < t.length - 1) {
      label = t.slice(0, colon).trim() || "Equipment";
      value = t.slice(colon + 1).trim();
    } else {
      label = "Equipment";
      value = t;
    }
  } else if (labelRaw && !valueRaw) {
    label = "Equipment";
    value = labelRaw;
  } else if (valueRaw && !labelRaw) {
    label = "Feature";
    value = valueRaw;
  }
  if (!value?.trim()) return null;
  if (!label?.trim()) label = "Feature";
  const icon =
    typeof iconRaw === "string"
      ? sanitizeBiSuffix(String(iconRaw)) ?? "star-fill"
      : "star-fill";
  return { label: label.trim(), value: value.trim(), icon };
}

function parseSpecRowsArray(rowsRaw: unknown): VehicleVdpAiSpecRow[] {
  if (!Array.isArray(rowsRaw)) return [];
  const rows: VehicleVdpAiSpecRow[] = [];
  for (const r of rowsRaw) {
    const row = parseSpecRow(r);
    if (row) rows.push(row);
  }
  return rows;
}

function parseSpecSection(o: unknown): VehicleVdpAiSpecSection | null {
  if (typeof o !== "object" || o === null) return null;
  const title = (o as { title?: unknown }).title;
  const rowsRaw = (o as { rows?: unknown }).rows;
  if (typeof title !== "string" || !Array.isArray(rowsRaw)) return null;
  const rows: VehicleVdpAiSpecRow[] = [];
  for (const r of rowsRaw) {
    const row = parseSpecRow(r);
    if (row) rows.push(row);
  }
  return { title, rows };
}

function parseFaq(o: unknown): VehicleVdpAiFaq | null {
  if (typeof o !== "object" || o === null) return null;
  const q = (o as { question?: unknown }).question;
  const a = (o as { answer?: unknown }).answer;
  if (typeof q !== "string" || typeof a !== "string") return null;
  return { question: q, answer: a };
}

/** Warranty + on-vehicle spec questions belong in spec cards / dealer chat, not this FAQ list. */
function shouldExcludeVdpFaqQuestion(question: string): boolean {
  const s = question.trim();
  const t = s.toLowerCase();
  if (/\bwarranty\b|\bwarranties\b/i.test(t)) return true;
  if (/\btowing\b|\btow\s+rating\b|\btow\s+capacity\b|\bmax(imum)?\s+tow\b/i.test(t))
    return true;
  if (/\bhow much\b[^?.]{0,40}\b(tow|pull|haul)\b/i.test(t)) return true;
  if (
    /\b(fuel economy|fuel consumption|l\/100|litres per 100)\b/i.test(t) &&
    /\b(this|that|the)\s+(vehicle|car|model|truck|ute|van|suv)\b/i.test(t)
  )
    return true;
  if (
    /\b(what|how)\s+(is|are)\s+the\s+(towing|payload|gvm|dimensions?|wheelbase|engine|torque|power|kw|kerb|tare)\b/i.test(
      t
    )
  )
    return true;
  if (
    /\b(payload|gvm|kerb|tare|dimensions?|wheelbase)\b/i.test(t) &&
    /\b(this|that|the)\s+(vehicle|car|model|truck|ute|van|suv)\b/i.test(t)
  )
    return true;
  return false;
}

function filterExcludedVdpFaqs(faqs: VehicleVdpAiFaq[]): VehicleVdpAiFaq[] {
  return faqs.filter((f) => !shouldExcludeVdpFaqQuestion(f.question));
}

function parseBreakdown(o: unknown): VehicleVdpAiBreakdownCard | null {
  if (typeof o !== "object" || o === null) return null;
  const title = (o as { title?: unknown }).title;
  const body = (o as { body?: unknown }).body;
  if (typeof title !== "string" || typeof body !== "string") return null;
  return { title, body };
}

function parseQuickBuyer(o: unknown): VehicleVdpAiQuickBuyer | null {
  if (typeof o !== "object" || o === null) return null;
  const title = (o as { title?: unknown }).title;
  const body = (o as { body?: unknown }).body;
  const bestFor = (o as { bestFor?: unknown }).bestFor;
  const checkFirst = (o as { checkFirst?: unknown }).checkFirst;
  const searchIntent = (o as { searchIntent?: unknown }).searchIntent;
  if (
    typeof title !== "string" ||
    typeof body !== "string" ||
    typeof bestFor !== "string" ||
    typeof checkFirst !== "string" ||
    typeof searchIntent !== "string"
  ) {
    return null;
  }
  return { title, body, bestFor, checkFirst, searchIntent };
}

export function parseVehicleVdpAiContent(raw: unknown): VehicleVdpAiContent | null {
  if (typeof raw !== "object" || raw === null) return null;
  const heroBadge = (raw as { heroBadge?: unknown }).heroBadge;
  const heroLead = (raw as { heroLead?: unknown }).heroLead;
  if (typeof heroBadge !== "string" || typeof heroLead !== "string") return null;

  const overviewParagraphs = (raw as { overviewParagraphs?: unknown })
    .overviewParagraphs;
  const paras: string[] = Array.isArray(overviewParagraphs)
    ? overviewParagraphs.filter((p): p is string => typeof p === "string")
    : [];

  const specSectionsRaw = (raw as { specSections?: unknown }).specSections;
  const specSections: VehicleVdpAiSpecSection[] = [];
  if (Array.isArray(specSectionsRaw)) {
    for (const s of specSectionsRaw) {
      const sec = parseSpecSection(s);
      if (sec) specSections.push(sec);
    }
  }

  let carDetailsRows = parseSpecRowsArray(
    (raw as { carDetailsRows?: unknown }).carDetailsRows
  );
  let engineTowingRows = parseSpecRowsArray(
    (raw as { engineTowingRows?: unknown }).engineTowingRows
  );
  const featureItemsRaw = (raw as { featureItems?: unknown }).featureItems;
  const featureItems: VehicleVdpAiFeatureItem[] = [];
  if (Array.isArray(featureItemsRaw)) {
    for (const it of featureItemsRaw) {
      const fi = parseFeatureItem(it);
      if (fi) featureItems.push(fi);
    }
  }

  const altFeatureArrays = [
    (raw as { features?: unknown }).features,
    (raw as { featuresListed?: unknown }).featuresListed,
    (raw as { equipmentItems?: unknown }).equipmentItems,
    (raw as { equipment?: unknown }).equipment,
  ];
  if (featureItems.length === 0) {
    for (const arr of altFeatureArrays) {
      if (!Array.isArray(arr)) continue;
      for (const it of arr) {
        const fi = parseFeatureItem(it);
        if (fi) featureItems.push(fi);
      }
      if (featureItems.length) break;
    }
  }

  const featureLinesRaw = (raw as { featureLines?: unknown }).featureLines;
  const featureLines: string[] = Array.isArray(featureLinesRaw)
    ? featureLinesRaw.filter((x): x is string => typeof x === "string")
    : [];

  if (carDetailsRows.length === 0 && specSections.length > 0) {
    const carSec =
      specSections.find((s) => /car\s*details/i.test(s.title)) ??
      specSections[0];
    carDetailsRows = carSec.rows;
  }
  if (engineTowingRows.length === 0) {
    const eng = specSections.find((s) =>
      /engine|towing|payload|dimension|gvm|compliance/i.test(s.title)
    );
    if (eng) engineTowingRows = eng.rows;
  }
  if (featureItems.length === 0 && featureLines.length > 0) {
    for (const line of featureLines) {
      const t = line.trim();
      if (t) {
        const colon = t.indexOf(":");
        if (colon > 0 && colon < t.length - 1) {
          featureItems.push({
            label: t.slice(0, colon).trim(),
            value: t.slice(colon + 1).trim(),
            icon: "star-fill",
          });
        } else {
          featureItems.push({
            label: "Equipment",
            value: t,
            icon: "star-fill",
          });
        }
      }
    }
  }

  const quickBuyer = parseQuickBuyer((raw as { quickBuyer?: unknown }).quickBuyer);
  if (!quickBuyer) return null;

  const dealerRaw = (raw as { dealerBreakdownCards?: unknown })
    .dealerBreakdownCards;
  const dealerBreakdownCards: VehicleVdpAiBreakdownCard[] = [];
  if (Array.isArray(dealerRaw)) {
    for (const c of dealerRaw) {
      const card = parseBreakdown(c);
      if (card) dealerBreakdownCards.push(card);
    }
  }

  const faqsRaw = (raw as { faqs?: unknown }).faqs;
  const faqs: VehicleVdpAiFaq[] = [];
  if (Array.isArray(faqsRaw)) {
    for (const f of faqsRaw) {
      const faq = parseFaq(f);
      if (faq) faqs.push(faq);
    }
  }

  const goodNextStep = (raw as { goodNextStep?: unknown }).goodNextStep;
  if (typeof goodNextStep !== "string") return null;

  const metaDescriptionRaw = (raw as { metaDescription?: unknown })
    .metaDescription;
  const metaStr =
    typeof metaDescriptionRaw === "string" ? metaDescriptionRaw.trim() : "";

  const seoTitleRaw =
    (raw as { seoTitle?: unknown }).seoTitle ??
    (raw as { pageTitle?: unknown }).pageTitle ??
    (raw as { metaTitle?: unknown }).metaTitle;
  const seoTitleParsed =
    typeof seoTitleRaw === "string" ? seoTitleRaw.trim() : "";

  sanitizeSpecRowDisplayValues(carDetailsRows);
  sanitizeSpecRowDisplayValues(engineTowingRows);
  ensureSpecRowIcons(carDetailsRows);
  ensureSpecRowIcons(engineTowingRows);
  ensureFeatureItemIcons(featureItems);

  return applyRuntimeVehicleVdpCoercion({
    heroBadge,
    heroLead,
    overviewParagraphs: paras.length ? paras : [heroLead],
    carDetailsRows,
    engineTowingRows,
    featureItems,
    quickBuyer,
    dealerBreakdownCards,
    faqs,
    goodNextStep,
    metaDescription: metaStr,
    seoTitle: seoTitleParsed,
  });
}

/**
 * Cached OpenAI payloads may predate the `{ label, value, icon }` feature shape
 * (e.g. `{ icon, text }`). Re-parse feature rows so the UI always gets strings.
 */
function applyRuntimeVehicleVdpCoercion(
  content: VehicleVdpAiContent
): VehicleVdpAiContent {
  const featureItems: VehicleVdpAiFeatureItem[] = [];
  for (const row of content.featureItems) {
    const fi = parseFeatureItem(row as unknown);
    if (fi) featureItems.push(fi);
  }
  ensureFeatureItemIcons(featureItems);

  const carDetailsRows = content.carDetailsRows.map((r) => ({ ...r }));
  const engineTowingRows = content.engineTowingRows.map((r) => ({ ...r }));
  sanitizeSpecRowDisplayValues(carDetailsRows);
  sanitizeSpecRowDisplayValues(engineTowingRows);
  ensureSpecRowIcons(carDetailsRows);
  ensureSpecRowIcons(engineTowingRows);

  const faqs = filterExcludedVdpFaqs(content.faqs);
  const heroBadge = sanitizeHeroBadgeForDisplay(content.heroBadge);

  return {
    ...content,
    heroBadge,
    seoTitle: content.seoTitle ?? "",
    metaDescription: content.metaDescription ?? "",
    featureItems,
    carDetailsRows,
    engineTowingRows,
    faqs,
  };
}

export function fallbackVehicleVdpAiContent(
  snapshot: VehicleVdpSnapshot
): VehicleVdpAiContent {
  const headline = [snapshot.year, snapshot.make, snapshot.model]
    .filter(Boolean)
    .join(" ");
  const heroBadge = formatHeroBadgeFromSnapshot(snapshot);
  const fromComments = splitVehicleDescription(snapshot.comments);
  const fromDesc = splitVehicleDescription(snapshot.description);
  const overviewParagraphs =
    fromComments.length > 0
      ? fromComments.slice(0, 3)
      : fromDesc.length > 0
        ? fromDesc.slice(0, 2)
        : [
            `${snapshot.condition} ${headline}. View photos and confirm specifications with the dealer before purchase.`,
          ];

  const odo =
    snapshot.odometerKm != null && snapshot.odometerKm > 0
      ? `${snapshot.odometerKm.toLocaleString("en-AU")} km`
      : "—";

  const carDetailsRows: VehicleVdpAiSpecRow[] = [
    {
      label: "Condition",
      value: `${snapshot.condition} vehicle`,
      sourceTag: "listing",
      icon: "check2-circle",
    },
    {
      label: "Year",
      value: String(snapshot.year),
      sourceTag: "listing",
      icon: "calendar3",
    },
    { label: "Odometer", value: odo, sourceTag: "listing", icon: "speedometer2" },
    {
      label: "Transmission",
      value: snapshot.transmission || "—",
      sourceTag: "listing",
      icon: "gear-fill",
    },
    { label: "Body", value: snapshot.bodyType || "—", sourceTag: "listing", icon: "truck" },
    {
      label: "Fuel",
      value: snapshot.fuelType || "—",
      sourceTag: "listing",
      icon: "fuel-pump-fill",
    },
    {
      label: "Drive",
      value: snapshot.driveType || "—",
      sourceTag: "listing",
      icon: "signpost-split-fill",
    },
    {
      label: "Colour",
      value: snapshot.bodyColour || "—",
      sourceTag: "listing",
      icon: "palette-fill",
    },
  ];

  const engineTowingRows: VehicleVdpAiSpecRow[] = [
    {
      label: "Engine & performance",
      value:
        "Full engine specs are not always in the feed — check the listing description or confirm with the dealer.",
      sourceTag: "mixed",
      icon: "tools",
    },
    {
      label: "Towing",
      value:
        "Braked and unbraked towing limits vary by variant — confirm with the dealer before towing.",
      sourceTag: "inferred",
      icon: "link-45deg",
    },
    {
      label: "Weights & dimensions",
      value:
        "Payload, GVM, and dimensions are not always supplied online — ask the dealer for the build sheet.",
      sourceTag: "inferred",
      icon: "rulers",
    },
  ];

  const cards: VehicleVdpAiBreakdownCard[] = [];
  if (overviewParagraphs[0]) {
    cards.push({ title: "Listing summary", body: overviewParagraphs[0] });
  }
  if (overviewParagraphs[1]) {
    cards.push({ title: "More detail", body: overviewParagraphs[1] });
  } else {
    cards.push({
      title: "Next steps",
      body: "Contact the dealer to confirm availability, pricing, and specifications.",
    });
  }
  while (cards.length < 3) {
    cards.push({
      title: "Dealer contact",
      body: `Stock ${snapshot.stockNumber}. Ask about finance and trade-in options.`,
    });
  }

  return {
    heroBadge,
    heroLead: `${snapshot.condition} ${snapshot.make} ${snapshot.model} — confirm all details with the dealer.`,
    overviewParagraphs,
    carDetailsRows,
    engineTowingRows,
    featureItems: [] as VehicleVdpAiFeatureItem[],
    quickBuyer: {
      title: `Is this ${snapshot.make} ${snapshot.model} a good fit?`,
      body: `This is a ${snapshot.condition.toLowerCase()} vehicle listed at this dealership. Compare specifications and pricing with similar listings, then arrange an inspection.`,
      bestFor: "Buyers comparing similar makes and models in this price range.",
      checkFirst:
        "Service history, warranty, rego, finance approval, and physical inspection.",
      searchIntent: `${snapshot.condition} ${snapshot.make}, ${snapshot.bodyType || "car"} Brisbane.`,
    },
    dealerBreakdownCards: cards.slice(0, 3),
    faqs: [
      {
        question: `What should I check before buying this ${snapshot.make}?`,
        answer:
          "Review service records, inspect tyres and brakes, confirm there is no finance owing, verify the spare keys and owner’s manuals, and take a test drive on roads you normally use. A pre-purchase inspection by an independent mechanic is strongly recommended.",
      },
      {
        question: "Can I get finance on this vehicle?",
        answer:
          "Finance is subject to lender approval, your credit profile, and the vehicle’s age and mileage. Contact the dealer for a tailored quote and to understand fees, balloon options, and early payout terms.",
      },
      {
        question: "Is the advertised price negotiable?",
        answer:
          "Pricing policies vary by dealer and market conditions. Ask whether the price includes dealer delivery or optional extras, and request a drive-away figure in writing before you visit.",
      },
    ],
    goodNextStep:
      "Contact the dealer to confirm price and book a viewing when you are ready.",
    seoTitle: "",
    metaDescription: "",
  };
}

const JSON_INSTRUCTION = `Return a single JSON object only (no markdown). Required keys:
- heroBadge (string): short pill from REAL listing fields only, e.g. "2019 · Used · SUV · Diesel" (year · condition · body · fuel as available). Never output template words like "condition", "body type", "fuel", or "year" as literals. Do NOT mention warranty. heroLead (string): one-line hook under the title.
- overviewParagraphs (array of 2 strings)
- carDetailsRows: array of { label, value, sourceTag ("listing"|"inferred"|"mixed"), icon? }. Cover Condition, Year, Odometer, Transmission, Body, Fuel, Drive, Colour, Doors, Seats when the listing supports it; omit unknowns. Optional icon = Bootstrap Icons suffix only (e.g. speedometer2).
- engineTowingRows: same row shape as carDetailsRows; every row MUST include non-empty "label", non-empty "value", "sourceTag", and "icon" (Bootstrap Icons suffix). Output 6–12 rows (Engine, Transmission, Cylinders, Torque, fuel economy, tank size, Payload, Braked/unbraked towing, Dimensions, Wheelbase, GVM, Compliance, etc.). Use the listing snapshot first. When the snapshot is silent on numbers, you MUST still fill these rows using your knowledge of that generation for the Australian market (match year, make, model, body type, fuel, transmission, drive from the snapshot). Mark those rows sourceTag "inferred" or "mixed". Write compact "value" text: lead with the figure or fact, then optional "— confirm with dealer" (e.g. "~9.0 L/100 km — confirm with dealer", "~3200 kg braked — confirm with dealer"). Never use the phrase "Not in listing — typical for this generation:" or "Typical for this generation:" as a prefix. Never leave value empty.
- featureItems: array of { "label", "value", "icon" } — 10–24 rows. BOTH "label" and "value" MUST be non-empty strings on every object. Derive from listing description/comments when present; when the feed only implies equipment, add common factory features for that model generation from your knowledge (source implied in wording, e.g. "Usually fitted: … — confirm with dealer"). "label" = short category (e.g. "Climate", "Audio", "Safety"); "value" = specific spec. "icon" = distinct Bootstrap Icons suffix (volume-up, snow, bluetooth, usb-symbol, shield-check, camera-video, etc.). Do not output objects with only "icon". Do not use { "text" } without splitting into label+value unless "text" contains a colon (then split on first colon).
- quickBuyer: { title, body, bestFor, checkFirst, searchIntent }
- dealerBreakdownCards: exactly 3 { title, body }
- faqs: 4–7 { question, answer } for Australian buyers: finance eligibility, inspection / pre-purchase checklist, price negotiation, delivery or trade-in, service history, rego transfer, common risks. Do NOT include FAQs about warranty, towing capacity, payload/GVM, dimensions, fuel figures, engine specs, or any other on-vehicle specification (those belong in the spec sections above). Answers 2–5 sentences; ground in listing text when possible; include one answer with a concise "top 5 things to check before you buy" list. Tell readers to confirm with the dealer when unsure.
- goodNextStep (string)
- seoTitle (string): unique segment for the HTML <title> BEFORE the site suffix (we append " | Car Sales Brisbane" server-side). Max ~52 characters in that segment only. Include year + make + model or a tight variant hook; do not include the suffix text. Aliases accepted: pageTitle, metaTitle.
- metaDescription (string): required, 140–160 characters for <meta name="description">. Summarise condition, year, model, location or price cue from the listing, and a CTA to view photos / confirm with the dealer. Australian English.

Rules: Australian English. Never change price, VIN, stock number, or odometer from the listing. Icons: lowercase letters, digits, hyphen only; no bi- prefix.

Critical for carDetailsRows and engineTowingRows: every "value" must be readable data (e.g. "380 Nm", "3,200 kg braked", "2970 mm") or a short factual sentence — never the single word "Inferred" or an empty placeholder. The field sourceTag is where you mark listing vs inferred; do not put the word "Inferred" inside value. If unknown, use "—" or "Not in listing — confirm with dealer."`;

async function fetchVehicleVdpAiFromOpenAI(
  snapshot: VehicleVdpSnapshot
): Promise<VehicleVdpAiContent> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallbackVehicleVdpAiContent(snapshot);
  }

  const model =
    process.env.OPENAI_VDP_MODEL?.trim() || "gpt-4o-mini";

  const client = new OpenAI({ apiKey });
  const userPayload = JSON.stringify(
    { task: "vehicle_vdp_copy", listing: snapshot },
    null,
    2
  );

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    temperature: 0.45,
    max_tokens: 5000,
    messages: [
      {
        role: "system",
        content: `You are a copywriter for an Australian used-car dealership (Car Sales Brisbane / Statewide Auto Group).\n${JSON_INSTRUCTION}`,
      },
      {
        role: "user",
        content: `Generate VDP copy from this inventory snapshot:\n${userPayload}`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    return fallbackVehicleVdpAiContent(snapshot);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    return fallbackVehicleVdpAiContent(snapshot);
  }

  const content = parseVehicleVdpAiContent(parsed);
  if (!content) {
    return fallbackVehicleVdpAiContent(snapshot);
  }

  if (content.dealerBreakdownCards.length < 3) {
    const fb = fallbackVehicleVdpAiContent(snapshot);
    while (content.dealerBreakdownCards.length < 3) {
      const idx = content.dealerBreakdownCards.length;
      content.dealerBreakdownCards.push(
        fb.dealerBreakdownCards[idx] ?? fb.dealerBreakdownCards[0]
      );
    }
  }

  if (content.carDetailsRows.length === 0) {
    content.carDetailsRows = fallbackVehicleVdpAiContent(snapshot).carDetailsRows;
  }

  if (content.engineTowingRows.length === 0) {
    content.engineTowingRows =
      fallbackVehicleVdpAiContent(snapshot).engineTowingRows;
  }

  return content;
}

const runCachedOpenAi = unstable_cache(
  async (snapshotJson: string) => {
    const snapshot = JSON.parse(snapshotJson) as VehicleVdpSnapshot;
    return fetchVehicleVdpAiFromOpenAI(snapshot);
  },
  // Bump when prompt/schema changes so listings are not stuck on stale AI JSON.
  ["vehicle-vdp-ai-openai", "v8-seo-title-desc"],
  { revalidate: VDP_AI_REVALIDATE_SEC }
);

/**
 * Returns AI-generated VDP marketing/spec presentation; falls back to inventory-only copy on error.
 */
export async function getVehicleVdpAiContent(
  snapshot: VehicleVdpSnapshot
): Promise<VehicleVdpAiContent> {
  try {
    const snapshotJson = JSON.stringify(snapshot);
    const content = await runCachedOpenAi(snapshotJson);
    const coerced = applyRuntimeVehicleVdpCoercion(content);
    const withHero = {
      ...coerced,
      heroBadge: buildListingHeroBadge(coerced.heroBadge, snapshot),
    };
    return ensureVehicleVdpSeoFields(withHero, snapshot);
  } catch (e) {
    console.error("[vehicleVdpCopy]", e);
    const coerced = applyRuntimeVehicleVdpCoercion(
      fallbackVehicleVdpAiContent(snapshot)
    );
    const withHero = {
      ...coerced,
      heroBadge: buildListingHeroBadge(coerced.heroBadge, snapshot),
    };
    return ensureVehicleVdpSeoFields(withHero, snapshot);
  }
}
