import type { Metadata } from "next";
import type { DealerVehicle } from "@/types/inventory";
import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import {
  filterDealerVehicles,
  mergeInventoryFiltersWithPathAugment,
  parseInventorySearchParams,
} from "@/lib/inventory/query";
import { labelFromSearchPathSlug } from "@/lib/inventory/srp-not-found";
import { resolveSearchPathSlug } from "@/lib/inventory/search-path-slugs";
import { mergeSiteUrlMetadata } from "@/lib/site-url";
import {
  cmsSrpMetadataForSlug,
  renderCmsSrpSearchPage,
} from "@/lib/cms-srp/render-cms-srp-search";
import SearchPageView from "../SearchPageView";

export const dynamic = "force-dynamic";

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
  const fromQuery = parseInventorySearchParams(raw);

  if (!resolved) {
    return (
      <SearchPageView
        filters={fromQuery}
        pathAugment={null}
        pathHeroLabel={null}
        srpNotFoundLabel={labelFromSearchPathSlug(slug)}
        listingBasePathname="/search"
        initialSearchParams={raw}
      />
    );
  }

  const filters = mergeInventoryFiltersWithPathAugment(
    fromQuery,
    resolved.pathAugment,
  );

  const filtered = filterDealerVehicles(vehicles, filters);
  if (filtered.length === 0 && vehicles.length > 0) {
    return (
      <SearchPageView
        filters={fromQuery}
        pathAugment={null}
        pathHeroLabel={null}
        srpNotFoundLabel={resolved.heroLabel}
        listingBasePathname="/search"
        initialSearchParams={raw}
      />
    );
  }

  return (
    <SearchPageView
      filters={filters}
      pathAugment={resolved.pathAugment}
      pathHeroLabel={resolved.heroLabel}
      initialSearchParams={raw}
    />
  );
}
