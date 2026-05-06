import type { Metadata } from "next";
import { getCurrentUrlAndRoute, siteUrlMetadataFields } from "@/lib/site-url";
import { parseInventorySearchParams } from "@/lib/inventory/query";
import SearchPageView from "./SearchPageView";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  const { currentUrl, currentRoute } = await getCurrentUrlAndRoute("/search");
  return {
    title:
      "Used Cars for Sale in Brisbane | Car Sales Brisbane and Statewide Auto Group",
    description:
      "Explore used cars, 4x4s, SUVs, and work-ready vehicles with finance-first options from our Ormiston hub.",
    ...siteUrlMetadataFields(currentUrl, currentRoute),
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const raw = await searchParams;
  const filters = parseInventorySearchParams(raw);
  return (
    <SearchPageView
      filters={filters}
      pathAugment={null}
      pathHeroLabel={null}
    />
  );
}
