import "./search.css";
import { after } from "next/server";
import { getCurrentUrlAndRoute } from "@/lib/site-url";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchDealerInventory } from "@/lib/dealer-solutions/fetch-inventory";
import {
  filterDealerVehicles,
  sortDealerVehicles,
  priceYearBounds,
  PER_PAGE,
  inventoryListingQueryHref,
} from "@/lib/inventory/query";
import type { InventoryFilterState } from "@/types/inventory";
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
import InventorySrpVehicleGrid from "@/components/vehicles/InventorySrpVehicleGrid";
import { warmVehicleVdpCachesForVehicles } from "@/lib/openai/warmVehicleVdpCache";
import { InventorySearchUrlProvider } from "@/components/vehicles/InventorySearchUrlContext";
import type { MakeModelPathResolution } from "@/lib/inventory/search-make-model-paths";

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

export type SearchPageViewProps = {
  filters: InventoryFilterState;
  /** Path-derived filter fields when URL is `/search/{slug}` without those params. */
  pathAugment: Partial<InventoryFilterState> | null;
  /** Hero / breadcrumb label for path-only search (make or facet). */
  pathHeroLabel?: string | null;
  /** When URL is `/search/{make}/{model}`, extra breadcrumb before the current page title. */
  pathBreadcrumb?: MakeModelPathResolution["breadcrumb"] | null;
};

export default async function SearchPageView({
  filters,
  pathAugment,
  pathHeroLabel,
  pathBreadcrumb,
}: SearchPageViewProps) {
  const all = await fetchDealerInventory();
  const bounds = priceYearBounds(all);
  const facets = buildInventoryFacets(all, filters);

  const filtered = filterDealerVehicles(all, filters);
  const sorted = sortDealerVehicles(filtered, filters.sort);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));

  if (filters.page > totalPages) {
    redirect(inventoryListingQueryHref({ ...filters, page: totalPages }));
  }

  const pageSlice = sorted.slice(
    (filters.page - 1) * PER_PAGE,
    filters.page * PER_PAGE,
  );
  const listings = pageSlice.map(dealerVehicleToListing);

  if (pageSlice.length > 0) {
    after(() => {
      void warmVehicleVdpCachesForVehicles(pageSlice, {
        max: pageSlice.length,
      });
    });
  }

  const searchPath = inventoryListingQueryHref(filters);
  const { currentUrl } = await getCurrentUrlAndRoute(searchPath);
  const currentUrlHttps = upgradeHttpToHttpsUrl(currentUrl);
  const origin = new URL(currentUrlHttps).origin;

  const hero = pathHeroLabel?.trim() ?? "";
  const listTitle = hero
    ? `Used ${hero} for Sale in Brisbane | Car Sales Brisbane and Statewide Auto Group`
    : "Used Cars for Sale in Brisbane | Car Sales Brisbane and Statewide Auto Group";
  const listDescription = hero
    ? `Browse used ${hero} vehicles, 4x4s, and SUVs with finance-first options from our Ormiston hub.`
    : "Explore used cars, 4x4s, SUVs, and work-ready vehicles with finance-first options from our Ormiston hub.";

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

  const breadcrumbItems = pathBreadcrumb
    ? [
        { name: "Home", item: `${origin}/` },
        { name: "Search", item: `${origin}/search` },
        {
          name: pathBreadcrumb.parent.name,
          item: `${origin}${pathBreadcrumb.parent.href}`,
        },
        { name: pathBreadcrumb.current, item: currentUrlHttps },
      ]
    : hero
      ? [
          { name: "Home", item: `${origin}/` },
          { name: "Search", item: `${origin}/search` },
          { name: hero, item: currentUrlHttps },
        ]
      : [
          { name: "Home", item: `${origin}/` },
          { name: "Search", item: currentUrlHttps },
        ];

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
    breadcrumbJsonLd(currentUrlHttps, breadcrumbItems),
  );

  const heroTitle = hero
    ? `Browse used ${hero} for sale in Brisbane`
    : "Browse Used Cars for Sale in Brisbane";

  return (
    <InventorySearchUrlProvider pathAugment={pathAugment}>
      <JsonLd data={jsonLd} />
      <section className="cs-page-hero search-page-hero py-3 py-md-2">
        <div className="container py-lg-2">
          <div className="row g-3 g-lg-4 align-items-center">
            <div className="col-lg-7 py-5">
              <h1 className="search-page-hero-title fw-bold mb-2 cs-title-tight">
                {heroTitle}
              </h1>
              <p className="search-page-hero-lead mb-0">{listDescription}</p>
            </div>
            <div className="col-lg-5" />
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
            {pathBreadcrumb ? (
              <>
                <Link href="/search">Search</Link>
                <span className="inventory-breadcrumb-sep" aria-hidden>
                  /
                </span>
                <Link href={pathBreadcrumb.parent.href}>
                  {pathBreadcrumb.parent.name}
                </Link>
                <span className="inventory-breadcrumb-sep" aria-hidden>
                  /
                </span>
                <span className="inventory-breadcrumb-current">
                  {pathBreadcrumb.current}
                </span>
              </>
            ) : hero ? (
              <>
                <Link href="/search">Search</Link>
                <span className="inventory-breadcrumb-sep" aria-hidden>
                  /
                </span>
                <span className="inventory-breadcrumb-current">{hero}</span>
              </>
            ) : (
              <span className="inventory-breadcrumb-current">Search</span>
            )}
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
                />
              </Suspense>

              <Suspense fallback={null}>
                <InventorySearchBar />
              </Suspense>

              {sorted.length === 0 ? (
                <div className="inventory-empty">
                  {all.length === 0 ? (
                    <p>
                      No vehicles loaded. If you are the site owner, set{" "}
                      <code>DEALER_SOLUTIONS_INVENTORY_URL</code>,{" "}
                      <code>DEALER_SOLUTIONS_USER</code>, and{" "}
                      <code>DEALER_SOLUTIONS_PASSWORD</code> in{" "}
                      <code>.env</code>.
                    </p>
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
                  <InventorySrpVehicleGrid listings={listings} />
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
    </InventorySearchUrlProvider>
  );
}
