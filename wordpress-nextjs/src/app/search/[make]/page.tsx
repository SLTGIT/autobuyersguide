import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { DealerVehicle } from "@/types/inventory";
import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import {
  mergeInventoryFiltersWithPathAugment,
  parseInventorySearchParams,
} from "@/lib/inventory/query";
import { resolveSearchPathSlug } from "@/lib/inventory/search-path-slugs";
import { mergeSiteUrlMetadata } from "@/lib/site-url";
import {
  cmsSrpMetadataForSlug,
  renderCmsSrpSearchPage,
} from "@/lib/cms-srp/render-cms-srp-search";
import SearchPageView from "../SearchPageView";

interface SearchMakePageProps {
  params: Promise<{ make: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: SearchMakePageProps): Promise<Metadata> {
  const { make } = await params;
  const slug = make.trim().toLowerCase();
  const cmsMeta = await cmsSrpMetadataForSlug(slug);
  if (cmsMeta) {
    return mergeSiteUrlMetadata(cmsMeta, `/search/${slug}`);
  }
  const vehicles: DealerVehicle[] = await fetchDealerInventory().catch(() => []);
  const resolved = resolveSearchPathSlug(slug, vehicles);
  if (!resolved) {
    return { title: "Search | Car Sales Brisbane" };
  }
  const pathname = `/search/${slug}`;
  if (resolved.kind === "make") {
    const label = titleFromSlug(slug);
    const base: Metadata = {
      title: `Used ${label} for Sale in Brisbane | Car Sales Brisbane`,
      description: `Browse used ${label} vehicles, 4x4s, and SUVs with finance-first options from our Ormiston hub.`,
    };
    return mergeSiteUrlMetadata(base, pathname);
  }
  const hero = resolved.heroLabel.trim();
  const base: Metadata = {
    title: `Used ${hero} for Sale in Brisbane | Car Sales Brisbane`,
    description: `Browse used vehicles matching ${hero} with finance-first options from our Ormiston hub.`,
  };
  return mergeSiteUrlMetadata(base, pathname);
}

export default async function SearchByMakePage({
  params,
  searchParams,
}: SearchMakePageProps) {
  const { make } = await params;
  const slug = make.trim().toLowerCase();
  const raw = await searchParams;
  const cmsSrp = await renderCmsSrpSearchPage(slug, raw ?? {});
  if (cmsSrp) return cmsSrp;

  const vehicles: DealerVehicle[] = await fetchDealerInventory().catch(() => []);
  const resolved = resolveSearchPathSlug(slug, vehicles);
  if (!resolved) notFound();

  const fromQuery = parseInventorySearchParams(raw);
  const filters = mergeInventoryFiltersWithPathAugment(
    fromQuery,
    resolved.pathAugment,
  );

  return (
    <SearchPageView
      filters={filters}
      pathAugment={resolved.pathAugment}
      pathHeroLabel={resolved.heroLabel}
    />
  );
}
