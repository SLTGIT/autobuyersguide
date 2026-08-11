import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { DealerVehicle } from "@/types/inventory";
import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import {
  mergeInventoryFiltersWithPathAugment,
  parseInventorySearchParams,
} from "@/lib/inventory/query";
import { resolveMakeModelFromPathSlugs } from "@/lib/inventory/search-make-model-paths";
import { mergeSiteUrlMetadata } from "@/lib/site-url";
import { resolveSrpSearchMeta } from "@/lib/wordpress/srp-search-meta";
import SearchPageView from "../../SearchPageView";

export const dynamic = "force-dynamic";

interface SearchMakeModelPageProps {
  params: Promise<{ make: string; model: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: SearchMakeModelPageProps): Promise<Metadata> {
  const { make, model } = await params;
  const makeSlug = make.trim().toLowerCase();
  const modelSlug = model.trim().toLowerCase();
  const vehicles: DealerVehicle[] = await fetchDealerInventory().catch(() => []);
  const resolved = resolveMakeModelFromPathSlugs(makeSlug, modelSlug, vehicles);
  if (!resolved) {
    return { title: "Search | Car Sales Brisbane" };
  }
  const pathname = `/search/${makeSlug}/${modelSlug}`;
  const filters = mergeInventoryFiltersWithPathAugment(
    parseInventorySearchParams({}),
    resolved.pathAugment,
  );
  const meta = await resolveSrpSearchMeta(filters, {
    pathHeroLabel: resolved.heroLabel,
  });
  return mergeSiteUrlMetadata(
    { title: meta.title, description: meta.description },
    pathname,
  );
}

export default async function SearchByMakeModelPage({
  params,
  searchParams,
}: SearchMakeModelPageProps) {
  const { make, model } = await params;
  const makeSlug = make.trim().toLowerCase();
  const modelSlug = model.trim().toLowerCase();

  const vehicles: DealerVehicle[] = await fetchDealerInventory().catch(() => []);
  const resolved = resolveMakeModelFromPathSlugs(makeSlug, modelSlug, vehicles);
  if (!resolved) notFound();

  const raw = await searchParams;
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
      pathBreadcrumb={resolved.breadcrumb}
      initialSearchParams={raw}
    />
  );
}
