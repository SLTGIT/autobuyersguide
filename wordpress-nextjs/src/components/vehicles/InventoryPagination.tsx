import Link from "next/link";
import type { InventoryFilterState } from "@/types/inventory";
import { serializeInventoryFilters } from "@/lib/inventory/query";

interface InventoryPaginationProps {
  filters: InventoryFilterState;
  totalPages: number;
}

export default function InventoryPagination({
  filters,
  totalPages,
}: InventoryPaginationProps) {
  if (totalPages <= 1) return null;
  const { page } = filters;
  const prevQs = serializeInventoryFilters({ ...filters, page: page - 1 });
  const nextQs = serializeInventoryFilters({ ...filters, page: page + 1 });

  return (
    <nav className="inventory-pagination" aria-label="Results pages">
      {page > 1 ? (
        <Link
          className="inventory-pagination-link"
          href={prevQs ? `/search?${prevQs}` : "/search"}
        >
          Previous
        </Link>
      ) : (
        <span className="inventory-pagination-link is-disabled">Previous</span>
      )}
      <span className="inventory-pagination-status">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          className="inventory-pagination-link"
          href={`/search?${nextQs}`}
        >
          Next
        </Link>
      ) : (
        <span className="inventory-pagination-link is-disabled">Next</span>
      )}
    </nav>
  );
}
