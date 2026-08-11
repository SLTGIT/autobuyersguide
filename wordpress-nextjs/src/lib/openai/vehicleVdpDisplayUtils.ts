import bootstrapIconsJson from "bootstrap-icons/font/bootstrap-icons.json";

/** Names that exist in the loaded Bootstrap Icons webfont (prevents empty glyph boxes). */
const BOOTSTRAP_ICON_KEYS = new Set(
  Object.keys(bootstrapIconsJson as Record<string, number>)
);

/** Bootstrap Icons name only (no `bi-` prefix), lowercase alphanumeric + hyphen. */
const BI_SAFE = /^[a-z][a-z0-9-]*$/;

export function sanitizeBiSuffix(raw: string | undefined): string | undefined {
  if (raw == null || typeof raw !== "string") return undefined;
  const t = raw.trim().toLowerCase().replace(/^bi-/, "").replace(/[^a-z0-9-]/g, "");
  if (!t || !BI_SAFE.test(t)) return undefined;
  return t;
}

/** True if `suffix` (no `bi-` prefix) is shipped in the Bootstrap Icons font. */
export function isKnownBootstrapIconSuffix(suffix: string): boolean {
  return BOOTSTRAP_ICON_KEYS.has(suffix);
}

/**
 * Returns a suffix that definitely exists in the webfont. LLMs often invent names
 * like `engine` or `wheelbase` — they sanitize but do not render.
 */
export function resolveBootstrapIconSuffix(
  raw: string | undefined,
  fallbackSuffix: string
): string {
  const a = sanitizeBiSuffix(raw);
  if (a && BOOTSTRAP_ICON_KEYS.has(a)) return a;
  const fb = sanitizeBiSuffix(fallbackSuffix) ?? fallbackSuffix.trim().toLowerCase();
  if (BOOTSTRAP_ICON_KEYS.has(fb)) return fb;
  return "circle";
}

/**
 * Picks a sensible default icon from the row label when the model omits `icon`.
 */
export function fallbackIconForSpecLabel(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("condition")) return "check2-circle";
  if (l.includes("year") || l.includes("compliance")) return "calendar3";
  if (l.includes("odometer") || l.includes("km")) return "speedometer2";
  if (l.includes("transmission") || l.includes("gear")) return "gear-fill";
  if (l.includes("body")) return "truck";
  if (l.includes("fuel") && l.includes("use")) return "droplet-half";
  if (l.includes("fuel") || l.includes("economy")) return "fuel-pump-fill";
  if (l.includes("drive") || l.includes("4x4")) return "signpost-split-fill";
  if (l.includes("colour") || l.includes("color")) return "palette-fill";
  if (l.includes("door")) return "door-open-fill";
  if (l.includes("seat")) return "people-fill";
  if (l.includes("engine") || l.includes("displacement")) return "tools";
  if (l.includes("cylinder")) return "circle-square";
  if (l.includes("torque")) return "lightning-charge-fill";
  if (l.includes("braked") || l.includes("towing") || l.includes("tow"))
    return "link-45deg";
  if (l.includes("unbraked")) return "link";
  if (l.includes("dimension") || l.includes("size")) return "rulers";
  if (l.includes("wheelbase")) return "arrows";
  if (l.includes("payload")) return "truck-front-fill";
  if (l.includes("gvm") || l.includes("gross")) return "box-seam-fill";
  if (l.includes("capacity") && l.includes("fuel")) return "fuel-pump";
  if (l.includes("power") || l.includes("kw")) return "lightning";
  if (l.includes("vin")) return "upc-scan";
  if (l.includes("stock")) return "hash";
  return "check2-circle";
}

/** Icon when the model omits `icon` on a feature row. */
export function fallbackIconForFeatureItem(label: string, value: string): string {
  return fallbackIconForFeatureText(`${label} ${value}`);
}

export function fallbackIconForFeatureText(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("air con") || t.includes("climate")) return "snow";
  if (t.includes("bluetooth")) return "bluetooth";
  if (t.includes("usb") || t.includes("aux") || t.includes("ipod")) return "usb-symbol";
  if (t.includes("camera")) return "camera-video";
  if (t.includes("nav") || t.includes("gps")) return "geo-alt";
  if (t.includes("cruise")) return "speedometer2";
  if (t.includes("sunroof")) return "brightness-high";
  if (t.includes("leather")) return "handbag";
  if (t.includes("sensor") || t.includes("parking")) return "radar";
  if (t.includes("alloy")) return "disc";
  return "star-fill";
}

export function biClass(suffix: string): string {
  const s = resolveBootstrapIconSuffix(suffix, "circle");
  return `bi bi-${s}`;
}
