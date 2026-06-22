import { unstable_cache } from "next/cache";
import type { VehicleVdpSnapshot } from "@/lib/openai/vehicleVdpTypes";

export type VdpMetaTemplates = {
  title: string;
  description: string;
};

export type VehicleVdpSeo = {
  /** Segment before ` | Car Sales Brisbane` in the HTML `<title>`. */
  seoTitle: string;
  metaDescription: string;
};

const VDP_BROWSER_TITLE_SUFFIX = "";

const VDP_META_CACHE_SECONDS = 60;

function wordpressJsonBase(): string | null {
  const raw =
    process.env.WORDPRESS_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "").replace(/\/wp\/v2(\/.*)?$/, "");
}

function wordpressAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const user = process.env.WORDPRESS_AUTH_USERNAME;
  const pass = process.env.WORDPRESS_AUTH_PASSWORD;
  if (user && pass) {
    headers.Authorization = `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
  }
  return headers;
}

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function formatCondition(value: string): string {
  const t = value.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function formatOdometer(km: number | null): string {
  if (km == null || km <= 0) return "";
  return `${km.toLocaleString("en-AU")} km`;
}

/** Maps WordPress VDP meta placeholders to listing snapshot values. */
export function applyVdpMetaTemplate(
  template: string,
  snapshot: VehicleVdpSnapshot,
): string {
  const drive = snapshot.driveType.trim();
  const tags: Record<string, string> = {
    condition: formatCondition(snapshot.condition),
    make: snapshot.make.trim(),
    model: snapshot.model.trim(),
    year: snapshot.year ? String(snapshot.year) : "",
    bodytype: snapshot.bodyType.trim(),
    fueltype: snapshot.fuelType.trim(),
    drivetype: drive,
    drivetrain: drive,
    trim: snapshot.trim.trim(),
    price: snapshot.displayPrice.trim(),
    odometer: formatOdometer(snapshot.odometerKm),
    color: snapshot.bodyColour.trim(),
    vin: snapshot.vin.trim(),
  };

  const replaced = template.replace(/\{([a-z0-9_]+)\}/gi, (_, key: string) => {
    return tags[key.toLowerCase()] ?? "";
  });

  return collapseWhitespace(replaced);
}

export function formatVehicleVdpBrowserTitle(seoTitlePart: string): string {
  const p = seoTitlePart.trim();
  if (!p) return `Cars for sale | Car Sales Brisbane`;
  return `${p}${VDP_BROWSER_TITLE_SUFFIX}`;
}

function buildFallbackSeo(snapshot: VehicleVdpSnapshot): VehicleVdpSeo {
  const seoTitle =
    snapshot.title.trim() ||
    [snapshot.year, snapshot.make, snapshot.model].filter(Boolean).join(" ");
  const base = collapseWhitespace(
    `${formatCondition(snapshot.condition)} ${snapshot.year} ${snapshot.make} ${snapshot.model}`,
  );
  const metaDescription = collapseWhitespace(
    `${base}. View photos, specifications, features, pricing and finance options.`,
  );
  return { seoTitle, metaDescription };
}

function parseVdpMetaResponse(data: unknown): VdpMetaTemplates | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  const payload =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  const title =
    typeof payload.title === "string" ? payload.title.trim() : "";
  const description =
    typeof payload.description === "string" ? payload.description.trim() : "";
  if (!title && !description) return null;
  return { title, description };
}

async function fetchVdpMetaTemplatesUncached(): Promise<VdpMetaTemplates | null> {
  const base = wordpressJsonBase();
  if (!base) return null;

  const url = `${base}/csb/v1/vdp-meta`;
  const res = await fetch(url, {
    headers: wordpressAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[vdp-meta] fetch failed:", res.status, res.statusText);
    return null;
  }

  const data: unknown = await res.json();
  return parseVdpMetaResponse(data);
}

const fetchVdpMetaTemplatesCached = unstable_cache(
  fetchVdpMetaTemplatesUncached,
  ["vdp-meta-templates"],
  {
    revalidate: VDP_META_CACHE_SECONDS,
    tags: ["vdp-meta"],
  },
);

/**
 * Loads VDP title/description templates from WordPress `csb/v1/vdp-meta`.
 * Cached for 60s. Bust via `POST /api/revalidate` with `{ "tag": "vdp-meta", "secret": "..." }`.
 */
export async function fetchVdpMetaTemplates(): Promise<VdpMetaTemplates | null> {
  return fetchVdpMetaTemplatesCached();
}

/** Resolves per-vehicle SEO from WordPress templates + listing snapshot tags. */
export async function resolveVehicleVdpSeo(
  snapshot: VehicleVdpSnapshot,
): Promise<VehicleVdpSeo> {
  const templates = await fetchVdpMetaTemplates();
  if (!templates) {
    return buildFallbackSeo(snapshot);
  }

  const seoTitle = applyVdpMetaTemplate(templates.title, snapshot);
  const metaDescription = applyVdpMetaTemplate(templates.description, snapshot);

  if (!seoTitle && !metaDescription) {
    return buildFallbackSeo(snapshot);
  }

  return {
    seoTitle: seoTitle || buildFallbackSeo(snapshot).seoTitle,
    metaDescription:
      metaDescription || buildFallbackSeo(snapshot).metaDescription,
  };
}
