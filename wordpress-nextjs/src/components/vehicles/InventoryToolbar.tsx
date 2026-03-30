"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { InventorySort } from "@/types/inventory";

interface InventoryToolbarProps {
  total: number;
  sort: InventorySort;
  view: "grid" | "list";
}

export default function InventoryToolbar({
  total,
  sort,
  view,
}: InventoryToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === "") params.delete(k);
      else params.set(k, v);
    }
    params.delete("page");
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="inventory-toolbar">
      <p className="inventory-toolbar-count">
        <strong>{total.toLocaleString("en-AU")}</strong>
        <span> new and used vehicles found in Australia</span>
      </p>
      <div className="inventory-toolbar-actions">
        <label className="inventory-sort-wrap">
          <span className="visually-hidden">Sort by</span>
          <select
            className="inventory-sort-select"
            value={sort}
            onChange={(e) =>
              setParam({ sort: e.target.value || undefined })
            }
            aria-label="Sort by"
          >
            <option value="best">— Best match —</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="year-desc">Year: Newest first</option>
            <option value="year-asc">Year: Oldest first</option>
            <option value="odometer-asc">Odometer: Low to High</option>
          </select>
        </label>
        <div className="inventory-view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            className={`inventory-view-btn ${view === "grid" ? "is-active" : ""}`}
            onClick={() => setParam({ view: "grid" })}
            aria-pressed={view === "grid"}
            title="Grid view"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
            </svg>
          </button>
          <button
            type="button"
            className={`inventory-view-btn ${view === "list" ? "is-active" : ""}`}
            onClick={() => setParam({ view: "list" })}
            aria-pressed={view === "list"}
            title="List view"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
