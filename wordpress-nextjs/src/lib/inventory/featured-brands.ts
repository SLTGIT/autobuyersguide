/**
 * Fixed “hero” brands for the home slider (order + logo file slug under
 * `/public/assets/images/brand-logo/{slug}.webp`).
 * `slug` is also used as the default `make` query param for `/search`.
 */
export type FeaturedBrandDef = {
  label: string;
  slug: string;
};

export const FEATURED_BRANDS: readonly FeaturedBrandDef[] = [
  { label: "BMW", slug: "bmw" },
  { label: "Ford", slug: "ford" },
  { label: "Hyundai", slug: "hyundai" },
  { label: "Kia", slug: "kia" },
  { label: "Mazda", slug: "mazda" },
  { label: "Mitsubishi", slug: "mitsubishi" },
  { label: "Subaru", slug: "subaru" },
  { label: "Tesla", slug: "tesla" },
  { label: "Toyota", slug: "toyota" },
  { label: "Volkswagen", slug: "volkswagen" },
] as const;

/** Extra API `make` keys that should count toward a featured tile (feed spelling). */
const MAKE_ALIASES: Record<string, string[]> = {
  volkswagen: ["volkswagen", "vw"],
};

export function mergeFeaturedBrandsWithApi(
  apiBrands: { name: string; count: number; make: string }[]
): { name: string; count: number; make: string }[] {
  const byMake = new Map<string, number>();
  for (const b of apiBrands) {
    const key = b.make.trim().toLowerCase();
    byMake.set(key, b.count);
  }

  return FEATURED_BRANDS.map((f) => {
    const aliases = [f.slug, ...(MAKE_ALIASES[f.slug] ?? [])];
    let count = 0;
    for (const alias of aliases) {
      count += byMake.get(alias) ?? 0;
    }
    return {
      name: f.label,
      make: f.slug,
      count,
    };
  });
}
