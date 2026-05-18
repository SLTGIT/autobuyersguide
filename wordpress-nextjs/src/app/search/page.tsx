import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress";
import { getMetadata, getYoastSeoCopy } from "@/lib/wordpress/seo";
import { repairWpRenderedHtml } from "@/lib/wordpress/repair-rendered-html";
import { mergeSiteUrlMetadata } from "@/lib/site-url";
import { stripHtml } from "@/lib/json-ld";
import { parseInventorySearchParams } from "@/lib/inventory/query";
import SearchPageView from "./SearchPageView";

export const dynamic = "force-dynamic";

const SEARCH_SLUG = "search";
const SEARCH_PATH = "/search";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(SEARCH_SLUG);
  if (!page) {
    return mergeSiteUrlMetadata({ title: "Search" }, SEARCH_PATH);
  }
  return mergeSiteUrlMetadata(getMetadata(page), SEARCH_PATH);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const page = await getPageBySlug(SEARCH_SLUG);
  if (!page) {
    notFound();
  }

  const yoastSeo = getYoastSeoCopy(page);
  const headline = stripHtml(page.title.rendered);
  const excerpt = stripHtml(page.excerpt?.rendered || "");
  const seoTitle = yoastSeo?.title || headline;
  const seoDescription = yoastSeo?.description || excerpt || headline;

  const raw = await searchParams;
  const filters = parseInventorySearchParams(raw);
  const rendered = page.content?.rendered?.trim();

  return (
    <SearchPageView
      filters={filters}
      pathAugment={null}
      pathHeroLabel={null}
      wpHeroHtml={rendered ? repairWpRenderedHtml(rendered) : null}
      listingSeo={{ title: seoTitle, description: seoDescription }}
    />
  );
}
