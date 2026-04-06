import type { DealerVehicle } from "@/types/inventory";
import type { InventoryFilterState, InventorySort } from "@/types/inventory";

function toStr(v: string | string[] | undefined): string {
  if (v === undefined) return "";
  return Array.isArray(v) ? (v[0] ?? "") : v;
}

function toStrArray(v: string | string[] | undefined): string[] {
  if (v === undefined) return [];
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (!v) return [];
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

function parseIntOrNull(s: string | undefined): number | null {
  if (s === undefined || s === "") return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

const SORTS: InventorySort[] = [
  "best",
  "price-asc",
  "price-desc",
  "year-desc",
  "year-asc",
  "odometer-asc",
];

export function parseInventorySearchParams(
  raw: Record<string, string | string[] | undefined>
): InventoryFilterState {
  const sortRaw = toStr(raw.sort).toLowerCase();
  const sort = SORTS.includes(sortRaw as InventorySort)
    ? (sortRaw as InventorySort)
    : "best";

  const view = toStr(raw.view) === "list" ? "list" : "grid";

  const makeRaw = toStr(raw.make).trim();
  return {
    q: toStr(raw.q),
    condition: toStr(raw.condition),
    make: makeRaw ? makeRaw.toLowerCase() : "",
    bodyType: toStrArray(raw.bodyType),
    fuelType: toStrArray(raw.fuelType),
    bodyColour: toStrArray(raw.bodyColour),
    driveType: toStrArray(raw.driveType),
    transmission: toStrArray(raw.transmission),
    type: toStrArray(raw.type),
    minPrice: parseIntOrNull(toStr(raw.minPrice)),
    maxPrice: parseIntOrNull(toStr(raw.maxPrice)),
    minYear: parseIntOrNull(toStr(raw.minYear)),
    maxYear: parseIntOrNull(toStr(raw.maxYear)),
    sort,
    view,
    page: Math.max(1, parseIntOrNull(toStr(raw.page)) ?? 1),
  };
}

function norm(s: string | undefined | null): string {
  return (s ?? "").trim();
}

export function priceNum(v: DealerVehicle): number {
  const p =
    v.Pricing?.AdvertisedPrice?.trim() || v.Pricing?.DriveAwayPrice?.trim();
  if (!p) return 0;
  const n = Number(String(p).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function filterDealerVehicles(
  vehicles: DealerVehicle[],
  f: InventoryFilterState
): DealerVehicle[] {
  const q = f.q.trim().toLowerCase();

  return vehicles.filter((v) => {
    if (f.condition && norm(v.Condition) !== f.condition) return false;
    if (
      f.make &&
      norm(v.Make).toLowerCase() !== f.make.toLowerCase()
    )
      return false;
    if (f.bodyType.length > 0) {
      const b = norm(v.BodyType);
      if (!b || !f.bodyType.includes(b)) return false;
    }
    if (f.fuelType.length > 0) {
      const x = norm(v.FuelType);
      if (!x || !f.fuelType.includes(x)) return false;
    }
    if (f.bodyColour.length > 0) {
      const x = norm(v.BodyColour);
      if (!x || !f.bodyColour.includes(x)) return false;
    }
    if (f.driveType.length > 0) {
      const x = norm(v.DriveType);
      if (!x || !f.driveType.includes(x)) return false;
    }
    if (f.transmission.length > 0) {
      const x = norm(v.TransmissionType);
      if (!x || !f.transmission.includes(x)) return false;
    }
    if (f.type.length > 0) {
      const x = norm(v.Type);
      if (!x || !f.type.includes(x)) return false;
    }

    const p = priceNum(v);
    if (f.minPrice !== null && p > 0 && p < f.minPrice) return false;
    if (f.maxPrice !== null && p > 0 && p > f.maxPrice) return false;

    const y = v.ManufactureYear;
    if (f.minYear !== null && y < f.minYear) return false;
    if (f.maxYear !== null && y > f.maxYear) return false;

    if (q) {
      const hay = [
        v.Description,
        v.Make,
        v.Model,
        v.BodyType,
        v.FuelType,
        v.SKU,
        v.Comments,
        v.Location,
      ]
        .join(" ")
        .toLowerCase();
      const tokens = q.split(/\s+/).filter(Boolean);
      if (!tokens.every((t) => hay.includes(t))) return false;
    }

    return true;
  });
}

export function sortDealerVehicles(
  vehicles: DealerVehicle[],
  sort: InventorySort
): DealerVehicle[] {
  const copy = [...vehicles];
  switch (sort) {
    case "price-asc":
      copy.sort((a, b) => priceNum(a) - priceNum(b));
      break;
    case "price-desc":
      copy.sort((a, b) => priceNum(b) - priceNum(a));
      break;
    case "year-desc":
      copy.sort((a, b) => b.ManufactureYear - a.ManufactureYear);
      break;
    case "year-asc":
      copy.sort((a, b) => a.ManufactureYear - b.ManufactureYear);
      break;
    case "odometer-asc":
      copy.sort((a, b) => {
        const ao = a.Odometer ?? 999999999;
        const bo = b.Odometer ?? 999999999;
        return ao - bo;
      });
      break;
    default:
      break;
  }
  return copy;
}

export function countByField(
  vehicles: DealerVehicle[],
  field: keyof DealerVehicle
): Map<string, number> {
  const map = new Map<string, number>();
  for (const v of vehicles) {
    const raw = v[field];
    const key =
      typeof raw === "string" ? raw.trim() : raw != null ? String(raw) : "";
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

export function mapToOptions(
  map: Map<string, number>,
  labelFn?: (v: string) => string
): { value: string; label: string; count: number }[] {
  return [...map.entries()]
    .map(([value, count]) => ({
      value,
      label: labelFn ? labelFn(value) : value,
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function priceYearBounds(vehicles: DealerVehicle[]): {
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
} {
  let minP = Infinity;
  let maxP = 0;
  let minY = Infinity;
  let maxY = 0;
  for (const v of vehicles) {
    const p = priceNum(v);
    if (p > 0) {
      minP = Math.min(minP, p);
      maxP = Math.max(maxP, p);
    }
    const y = v.ManufactureYear;
    if (Number.isFinite(y)) {
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  if (!Number.isFinite(minP)) minP = 0;
  if (!Number.isFinite(minY)) minY = new Date().getFullYear() - 30;
  if (!Number.isFinite(maxY)) maxY = new Date().getFullYear();
  return {
    minPrice: Math.floor(minP / 1000) * 1000,
    maxPrice: Math.ceil(maxP / 1000) * 1000 || 200000,
    minYear: minY,
    maxYear: maxY,
  };
}

export const PER_PAGE = 12;

/** Build a record suitable for parseInventorySearchParams from URLSearchParams */
export function urlSearchParamsToRecord(
  sp: URLSearchParams
): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {};
  const keys = new Set(sp.keys());
  for (const key of keys) {
    const all = sp.getAll(key);
    out[key] = all.length > 1 ? all : all[0];
  }
  return out;
}

export type InventoryFacetOmit =
  | "condition"
  | "make"
  | "bodyType"
  | "fuelType"
  | "bodyColour"
  | "driveType"
  | "transmission"
  | "type"
  | "price"
  | "year"
  | "q";

/** Clone filter state with some dimensions cleared (for facet counts). */
export function omitInventoryFilters(
  f: InventoryFilterState,
  omit: InventoryFacetOmit[]
): InventoryFilterState {
  const n = { ...f };
  if (omit.includes("condition")) n.condition = "";
  if (omit.includes("make")) n.make = "";
  if (omit.includes("bodyType")) n.bodyType = [];
  if (omit.includes("fuelType")) n.fuelType = [];
  if (omit.includes("bodyColour")) n.bodyColour = [];
  if (omit.includes("driveType")) n.driveType = [];
  if (omit.includes("transmission")) n.transmission = [];
  if (omit.includes("type")) n.type = [];
  if (omit.includes("price")) {
    n.minPrice = null;
    n.maxPrice = null;
  }
  if (omit.includes("year")) {
    n.minYear = null;
    n.maxYear = null;
  }
  if (omit.includes("q")) n.q = "";
  return n;
}

/** Serialize filters to a query string (no leading `?`). */
export function serializeInventoryFilters(f: InventoryFilterState): string {
  const p = new URLSearchParams();
  const q = f.q.trim();
  if (q) p.set("q", q);
  if (f.condition) p.set("condition", f.condition);
  if (f.make) p.set("make", f.make.trim().toLowerCase());
  for (const bt of f.bodyType) p.append("bodyType", bt);
  for (const ft of f.fuelType) p.append("fuelType", ft);
  for (const c of f.bodyColour) p.append("bodyColour", c);
  for (const d of f.driveType) p.append("driveType", d);
  for (const t of f.transmission) p.append("transmission", t);
  for (const ty of f.type) p.append("type", ty);
  if (f.minPrice !== null) p.set("minPrice", String(f.minPrice));
  if (f.maxPrice !== null) p.set("maxPrice", String(f.maxPrice));
  if (f.minYear !== null) p.set("minYear", String(f.minYear));
  if (f.maxYear !== null) p.set("maxYear", String(f.maxYear));
  if (f.sort !== "best") p.set("sort", f.sort);
  if (f.view !== "grid") p.set("view", f.view);
  if (f.page > 1) p.set("page", String(f.page));
  return p.toString();
}
