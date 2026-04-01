/** Logo path for a known file slug, e.g. `bmw` → `bmw.webp`. */
export function brandLogoPublicPathFromSlug(slug: string): string {
  const s = slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
  return `/assets/images/brand-logo/${s || "car"}.webp`;
}

/**
 * Public path for a brand logo under `/public/assets/images/brand-logo/{slug}.webp`.
 * Falls back visually in the UI if the file is missing.
 */
export function brandLogoPublicPath(makeName: string): string {
  const slug = makeName
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return brandLogoPublicPathFromSlug(slug || "car");
}
