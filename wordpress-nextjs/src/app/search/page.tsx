import "./search.css";
import type { Metadata } from "next";
import { getCurrentUrlAndRoute, siteUrlMetadataFields } from "@/lib/site-url";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import {
  parseInventorySearchParams,
  filterDealerVehicles,
  sortDealerVehicles,
  priceYearBounds,
  PER_PAGE,
  serializeInventoryFilters,
} from "@/lib/inventory/query";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbJsonLd,
  jsonLdGraph,
  organizationJsonLd,
  upgradeHttpToHttpsUrl,
  vehicleJsonLdFromInventory,
  webPageJsonLd,
  webSiteJsonLd,
} from "@/lib/json-ld";
import { dealerVehicleToListing } from "@/lib/inventory/transform";
import { buildInventoryFacets } from "@/lib/inventory/facets";
import InventoryFiltersSidebar from "@/components/vehicles/InventoryFiltersSidebar";
import InventoryToolbar from "@/components/vehicles/InventoryToolbar";
import InventorySearchBar from "@/components/vehicles/InventorySearchBar";
import InventoryPagination from "@/components/vehicles/InventoryPagination";
import VehicleGrid from "@/components/vehicles/VehicleGrid";

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

function ToolbarFallback() {
  return (
    <div className="inventory-toolbar inventory-toolbar--loading" aria-hidden>
      <p className="inventory-toolbar-count">Loading results…</p>
    </div>
  );
}

function SidebarFallback() {
  return (
    <aside className="inventory-sidebar inventory-sidebar--loading" aria-hidden>
      <p>Loading filters…</p>
    </aside>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const raw = await searchParams;
  const filters = parseInventorySearchParams(raw);

  const all = await fetchDealerInventory();
  const bounds = priceYearBounds(all);
  const facets = buildInventoryFacets(all, filters);

  const filtered = filterDealerVehicles(all, filters);
  const sorted = sortDealerVehicles(filtered, filters.sort);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));

  if (filters.page > totalPages) {
    redirect(
      `/search?${serializeInventoryFilters({ ...filters, page: totalPages })}`,
    );
  }

  const pageSlice = sorted.slice(
    (filters.page - 1) * PER_PAGE,
    filters.page * PER_PAGE,
  );
  const listings = pageSlice.map(dealerVehicleToListing);

  const searchQs = serializeInventoryFilters(filters);
  const searchPath = searchQs ? `/search?${searchQs}` : "/search";
  const { currentUrl } = await getCurrentUrlAndRoute(searchPath);
  const currentUrlHttps = upgradeHttpToHttpsUrl(currentUrl);
  const origin = new URL(currentUrlHttps).origin;

  const listTitle =
    "Used Cars for Sale in Brisbane | Car Sales Brisbane and Statewide Auto Group";
  const listDescription =
    "Explore used cars, 4x4s, SUVs, and work-ready vehicles with finance-first options from our Ormiston hub.";

  const itemListElement =
    pageSlice.length > 0
      ? pageSlice.map((vehicle, index) => ({
          "@type": "ListItem",
          position: (filters.page - 1) * PER_PAGE + index + 1,
          item: vehicleJsonLdFromInventory(
            origin,
            vehicle,
            listings[index],
          ),
        }))
      : [];

  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin),
    webPageJsonLd({
      pageUrl: currentUrlHttps,
      name: listTitle,
      description: listDescription,
    }),
    {
      "@type": "CollectionPage",
      "@id": `${currentUrlHttps}#collection`,
      name: listTitle,
      description: listDescription,
      url: currentUrlHttps,
      inLanguage: "en-AU",
      isPartOf: { "@id": `${origin}/#website` },
      publisher: { "@id": `${origin}/#organization` },
      ...(itemListElement.length > 0
        ? {
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: sorted.length,
              itemListElement,
            },
          }
        : {}),
    },
    breadcrumbJsonLd(currentUrlHttps, [
      { name: "Home", item: `${origin}/` },
      { name: "Search", item: currentUrlHttps },
    ]),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="cs-page-hero search-page-hero py-3 py-md-4 text-white">
        <div className="container py-lg-2">
          <div className="row g-3 g-lg-4 align-items-center">
            <div className="col-lg-7">
              {/* <span className="badge cs-hero-chip cs-pill px-3 py-1 mb-2">
                Used Cars For Sale
              </span> */}
              <h1 className="search-page-hero-title fw-bold mb-2 cs-title-tight">
                Browse Used Cars for Sale in Brisbane
              </h1>
              <p className="search-page-hero-lead mb-0">
                Explore used cars, 4x4s, SUVs, and work-ready vehicles with
                finance-first options from our Ormiston hub.
              </p>
            </div>
            <div className="col-lg-5">
              <article className="search-page-hero-card card border-0 shadow-lg rounded-5 overflow-hidden">
                <div className="search-page-hero-media position-relative">
                  <Image
                    src="https://d2s8i866417m9.cloudfront.net/photo/32428698/photo/thumb-232954f40d5f21bf8a4fa35d6daa7a7a.jpg"
                    alt="White Ford Ranger used ute — browse used cars for sale Brisbane"
                    fill
                    className="search-page-hero-img"
                    sizes="(max-width: 991px) 100vw, 480px"
                    priority
                  />
                </div>
                <div className="card-body search-page-hero-card-body">
                  <h2 className="h5 fw-bold mb-0 text-dark">
                    Used Cars for Sale
                  </h2>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
      <div className="vehicles-page inventory-srp">
        <div className="vehicles-container inventory-srp-inner">
          <nav className="inventory-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="inventory-breadcrumb-sep" aria-hidden>
              /
            </span>
            <span className="inventory-breadcrumb-current">Search</span>
          </nav>

          <div className="inventory-srp-layout">
            <Suspense fallback={<SidebarFallback />}>
              <InventoryFiltersSidebar facets={facets} bounds={bounds} />
            </Suspense>

            <div className="inventory-srp-main">
              <Suspense fallback={<ToolbarFallback />}>
                <InventoryToolbar
                  total={sorted.length}
                  sort={filters.sort}
                  view={filters.view}
                />
              </Suspense>

              <Suspense fallback={null}>
                <InventorySearchBar />
              </Suspense>

              {sorted.length === 0 ? (
                <div className="inventory-empty">
                  {all.length === 0 ? (
                    <>
                      <p>
                        No vehicles loaded. If you are the site owner, set{" "}
                        <code>DEALER_SOLUTIONS_INVENTORY_URL</code>,{" "}
                        <code>DEALER_SOLUTIONS_USER</code>, and{" "}
                        <code>DEALER_SOLUTIONS_PASSWORD</code> in{" "}
                        <code>.env</code>.
                      </p>
                    </>
                  ) : (
                    <p>
                      No vehicles match your filters. Try clearing some filters.
                    </p>
                  )}
                  {all.length > 0 && (
                    <Link className="inventory-empty-link" href="/search">
                      View all vehicles
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <VehicleGrid listings={listings} view={filters.view} />
                  <InventoryPagination
                    filters={filters}
                    totalPages={totalPages}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
