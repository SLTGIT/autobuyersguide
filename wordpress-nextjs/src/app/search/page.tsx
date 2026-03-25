import { Suspense } from "react";
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

export const metadata = {
  title: "Vehicle inventory | Auto Buyers Guide",
  description:
    "Browse new and used vehicles. Filter by make, price, and more.",
};

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
      `/search?${serializeInventoryFilters({ ...filters, page: totalPages })}`
    );
  }

  const pageSlice = sorted.slice(
    (filters.page - 1) * PER_PAGE,
    filters.page * PER_PAGE
  );
  const listings = pageSlice.map(dealerVehicleToListing);

  return (
    <div className="vehicles-page inventory-srp">
      <div className="vehicles-container inventory-srp-inner">
        <nav className="inventory-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="inventory-breadcrumb-sep" aria-hidden>
            /
          </span>
          <span className="inventory-breadcrumb-current">Search</span>
        </nav>

        <header className="inventory-srp-header">
          <h1 className="inventory-srp-title">Vehicles for sale</h1>
          <p className="inventory-srp-lead">
            Search new and used stock. Refine by make, price, and more —
            filters update the page URL so you can share your search.
          </p>
        </header>

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
                  <p>No vehicles match your filters. Try clearing some filters.</p>
                )}
                {all.length > 0 && (
                  <Link
                    className="inventory-empty-link"
                    href="/search"
                  >
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
  );
}
