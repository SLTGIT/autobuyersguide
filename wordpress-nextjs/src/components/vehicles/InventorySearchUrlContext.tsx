"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { InventoryFilterState } from "@/types/inventory";

const RESULTS_VIEW_STORAGE_KEY = "cs-inventory-srp-view";

type InventorySearchUrlContextValue = {
  /**
   * Filter fields implied by `/search/{slug}` when those dimensions are absent
   * from the query string (make, a single facet, year, or price bucket).
   */
  pathAugment: Partial<InventoryFilterState> | null;
  /** Grid vs list layout — not reflected in the URL; persisted in sessionStorage. */
  resultsView: "grid" | "list";
  setResultsView: (v: "grid" | "list") => void;
};

const InventorySearchUrlContext =
  createContext<InventorySearchUrlContextValue>({
    pathAugment: null,
    resultsView: "list",
    setResultsView: () => {},
  });

export function InventorySearchUrlProvider({
  pathAugment,
  children,
}: {
  pathAugment: Partial<InventoryFilterState> | null;
  children: ReactNode;
}) {
  const [resultsView, setResultsViewState] = useState<"grid" | "list">("list");

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(RESULTS_VIEW_STORAGE_KEY);
      if (stored === "grid" || stored === "list") {
        setResultsViewState(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setResultsView = useCallback((v: "grid" | "list") => {
    setResultsViewState(v);
    try {
      window.sessionStorage.setItem(RESULTS_VIEW_STORAGE_KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      pathAugment,
      resultsView,
      setResultsView,
    }),
    [pathAugment, resultsView, setResultsView],
  );

  return (
    <InventorySearchUrlContext.Provider value={value}>
      {children}
    </InventorySearchUrlContext.Provider>
  );
}

export function useInventorySearchUrl(): InventorySearchUrlContextValue {
  return useContext(InventorySearchUrlContext);
}
