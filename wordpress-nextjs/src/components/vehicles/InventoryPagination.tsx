import Link from "next/link";
import type { InventoryFilterState } from "@/types/inventory";
import { inventoryListingHrefForContext } from "@/lib/inventory/query";

interface InventoryPaginationProps {
  filters: InventoryFilterState;
  totalPages: number;
  /** When set, pagination links use this path + query (CMS SRP). */
  listingBasePathname?: string | null;
}

export default function InventoryPagination({
  filters,
  totalPages,
  listingBasePathname = null,
}: InventoryPaginationProps) {
  if (totalPages <= 1) return null;
  const { page } = filters;
  const prevHref =
    page > 1
      ? inventoryListingHrefForContext(listingBasePathname, {
          ...filters,
          page: page - 1,
        })
      : null;
  const nextHref =
    page < totalPages
      ? inventoryListingHrefForContext(listingBasePathname, {
          ...filters,
          page: page + 1,
        })
      : null;

  return (
    <nav className="inventory-pagination" aria-label="Results pages">
      {page > 1 && prevHref ? (
        <Link className="inventory-pagination-link" href={prevHref}>
          Previous
        </Link>
      ) : (
        <span className="inventory-pagination-link is-disabled">Previous</span>
      )}
      <span className="inventory-pagination-status">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && nextHref ? (
        <Link className="inventory-pagination-link" href={nextHref}>
          Next
        </Link>
      ) : (
        <span className="inventory-pagination-link is-disabled">Next</span>
      )}
    </nav>
  );
}
