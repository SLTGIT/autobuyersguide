"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import {
  parseInventorySearchParams,
  urlSearchParamsToRecord,
  mergeInventoryFiltersWithPathAugment,
  inventoryListingQueryHref,
} from "@/lib/inventory/query";
import { useInventorySearchUrl } from "@/components/vehicles/InventorySearchUrlContext";

export default function InventorySearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pathAugment } = useInventorySearchUrl();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  const apply = (nextQ: string) => {
    const base = mergeInventoryFiltersWithPathAugment(
      parseInventorySearchParams(urlSearchParamsToRecord(searchParams)),
      pathAugment,
    );
    const next = { ...base, q: nextQ.trim(), page: 1 };
    router.push(inventoryListingQueryHref(next));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    apply(q);
  };

  return (
    <form className="inventory-search-bar" onSubmit={onSubmit} role="search">
      <input
        type="search"
        className="inventory-search-input"
        placeholder="Keyword search eg. Sedan, Toyota"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search inventory"
      />
      <button type="submit" className="inventory-search-submit" aria-label="Search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    </form>
  );
}
