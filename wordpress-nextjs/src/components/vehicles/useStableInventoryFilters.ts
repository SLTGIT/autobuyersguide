"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { InventoryFilterState } from "@/types/inventory";
import {
  mergeInventoryFiltersWithPathAugment,
  parseInventorySearchParams,
  urlSearchParamsToRecord,
} from "@/lib/inventory/query";
import { useInventorySearchUrl } from "@/components/vehicles/InventorySearchUrlContext";

/**
 * Filter state from the URL, stable across SSR + hydration.
 * Uses server-passed search params until the client has mounted so
 * `useSearchParams()` cannot disagree with the server HTML.
 */
export function useStableInventoryFilters(): InventoryFilterState {
  const { pathAugment, initialSearchParams } = useInventorySearchUrl();
  const liveSearchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return useMemo(() => {
    const record = mounted
      ? urlSearchParamsToRecord(liveSearchParams)
      : (initialSearchParams ?? urlSearchParamsToRecord(liveSearchParams));
    return mergeInventoryFiltersWithPathAugment(
      parseInventorySearchParams(record),
      pathAugment,
    );
  }, [mounted, liveSearchParams, initialSearchParams, pathAugment]);
}
