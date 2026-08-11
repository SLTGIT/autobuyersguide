"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "abg-inventory-saved-ids";

function readIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is number => typeof x === "number");
  } catch {
    return [];
  }
}

function writeIds(ids: number[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota / private mode */
  }
}

export default function VehicleCardSave({ listingId }: { listingId: number }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readIds().includes(listingId));
  }, [listingId]);

  const toggle = useCallback(() => {
    const ids = readIds();
    const currently = ids.includes(listingId);
    const next = currently
      ? ids.filter((id) => id !== listingId)
      : [...ids, listingId];
    writeIds(next);
    setSaved(!currently);
  }, [listingId]);

  return (
    <div className="inventory-card-save">
      <span className="inventory-card-save-label">save</span>
      <button
        type="button"
        className="inventory-card-save-btn"
        onClick={toggle}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save vehicle"}
      >
        <i
          className={
            saved ? "bi bi-bookmark-fill" : "bi bi-bookmark"
          }
          aria-hidden
        />
      </button>
    </div>
  );
}
