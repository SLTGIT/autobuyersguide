import { stripHtml } from "@/lib/json-ld";
import {
  mergeInventoryFiltersWithPathAugment,
  parseInventorySearchParams,
} from "@/lib/inventory/query";
import SearchPageView from "@/app/search/SearchPageView";
import {
  cmsSrpPathAugmentFromFilters,
  fetchCmsSrpPageBySlug,
  inventoryFiltersFromCmsSrpApi,
  resolveCmsSrpSeoCopy,
} from "./cms-srp-page";

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Renders CMS SRP at `/search/{slug}` when the WordPress API has config for this slug.
 */
export async function renderCmsSrpSearchPage(
  slug: string,
  rawSearchParams: SearchParams,
) {
  const srp = await fetchCmsSrpPageBySlug(slug);
  if (!srp) return null;

  const baseFilters = inventoryFiltersFromCmsSrpApi(srp.filters);
  const pathAugment = cmsSrpPathAugmentFromFilters(baseFilters);
  const fromQuery = parseInventorySearchParams(rawSearchParams ?? {});
  const filters = mergeInventoryFiltersWithPathAugment(fromQuery, pathAugment);
  const makeForCrumb = srp.filters.make?.trim();
  const { listingJsonLd } = resolveCmsSrpSeoCopy(srp);
  const pathname = `/search/${slug.trim()}`;

  return (
    <SearchPageView
      filters={filters}
      pathAugment={pathAugment}
      pathHeroLabel={null}
      customHero={{
        heading: stripHtml(srp.hero_heading),
        description: stripHtml(srp.hero_description),
        breadcrumbCurrent: makeForCrumb || undefined,
      }}
      listingSeo={listingJsonLd}
      canonicalPathname={pathname}
    />
  );
}

export async function cmsSrpMetadataForSlug(
  slug: string,
): Promise<{ title: string; description: string } | null> {
  const srp = await fetchCmsSrpPageBySlug(slug);
  if (!srp) return null;
  const { documentTitle, documentDescription } = resolveCmsSrpSeoCopy(srp);
  return { title: documentTitle, description: documentDescription };
}
