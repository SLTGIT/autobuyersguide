import type { DealerVehicle } from "@/types/inventory";
import type { InventoryFilterState } from "@/types/inventory";
import {
  filterDealerVehicles,
  parseInventorySearchParams,
  inventoryListingQueryHref,
} from "./query";

const emptyFilters: InventoryFilterState = parseInventorySearchParams({});

function norm(s: string | undefined | null): string {
  return (s ?? "").trim();
}

/** Exact condition string from feed for used vehicles (matches search filter). */
export function dominantUsedCondition(vehicles: DealerVehicle[]): string {
  const counts = new Map<string, number>();
  for (const v of vehicles) {
    const c = norm(v.Condition);
    if (!c) continue;
    if (!/used/i.test(c)) continue;
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  let best = "";
  let max = 0;
  for (const [k, n] of counts) {
    if (n > max) {
      max = n;
      best = k;
    }
  }
  return best || "Used";
}

export type PopularCarTypeItem = {
  title: string;
  image: string;
  count: number;
  countLabel: string;
  href: string;
};

type CategoryDef = {
  title: string;
  image: string;
  match: (v: DealerVehicle) => boolean;
  /** When there are no matching vehicles, still produce a useful /search link */
  fallbackFilter: Pick<InventoryFilterState, "bodyType" | "driveType" | "q">;
};

function uniqueBodyTypes(matches: DealerVehicle[]): string[] {
  return [...new Set(matches.map((v) => norm(v.BodyType)).filter(Boolean))];
}

function uniqueDriveTypes(matches: DealerVehicle[]): string[] {
  return [...new Set(matches.map((v) => norm(v.DriveType)).filter(Boolean))];
}

const CATEGORIES: CategoryDef[] = [
  {
    title: "Used SUVs for Sale",
    image: "/assets/images/aus-car-types/suv.webp",
    match: (v) => norm(v.BodyType).toLowerCase().includes("suv"),
    fallbackFilter: { bodyType: ["SUV"], driveType: [], q: "" },
  },
  {
    title: "Used Utes for Sale",
    image: "/assets/images/aus-car-types/utility.webp",
    match: (v) => {
      const b = norm(v.BodyType).toLowerCase();
      return (
        b.includes("ute") ||
        b.includes("utility") ||
        b.includes("pickup") ||
        b.includes("cab chassis")
      );
    },
    fallbackFilter: { bodyType: ["Ute"], driveType: [], q: "" },
  },
  {
    title: "Used Hatchbacks",
    image: "/assets/images/aus-car-types/hatchback.webp",
    match: (v) => norm(v.BodyType).toLowerCase().includes("hatch"),
    fallbackFilter: { bodyType: ["Hatchback"], driveType: [], q: "" },
  },
  {
    title: "Used Sedans",
    image: "/assets/images/aus-car-types/seadn.webp",
    match: (v) => norm(v.BodyType).toLowerCase().includes("sedan"),
    fallbackFilter: { bodyType: ["Sedan"], driveType: [], q: "" },
  },
  {
    title: "Used 4WD Vehicles",
    image: "/assets/images/aus-car-types/4wd.webp",
    match: (v) => {
      const d = norm(v.DriveType).toLowerCase();
      const b = norm(v.BodyType).toLowerCase();
      return (
        d.includes("4wd") ||
        d.includes("4x4") ||
        d.includes("awd") ||
        d.includes("four wheel") ||
        b.includes("4wd")
      );
    },
    fallbackFilter: { bodyType: [], driveType: ["Four Wheel Drive"], q: "" },
  },
  {
    title: "Used Family Cars",
    image: "/assets/images/aus-car-types/van.webp",
    match: (v) => {
      const b = norm(v.BodyType).toLowerCase();
      return (
        b.includes("van") ||
        b.includes("people mover") ||
        b.includes("wagon") ||
        b.includes("mpv") ||
        b.includes("minivan")
      );
    },
    fallbackFilter: { bodyType: ["People Mover"], driveType: [], q: "" },
  },
];

function buildSearchHref(
  condition: string,
  matches: DealerVehicle[],
  cat: CategoryDef
): string {
  const f: InventoryFilterState = {
    ...emptyFilters,
    condition,
    page: 1,
    q: "",
    bodyType: [],
    driveType: [],
  };

  const is4wdCategory = cat.title.includes("4WD");

  if (matches.length === 0) {
    f.bodyType = [...(cat.fallbackFilter.bodyType ?? [])];
    f.driveType = [...(cat.fallbackFilter.driveType ?? [])];
    f.q = cat.fallbackFilter.q ?? "";
  } else if (is4wdCategory) {
    const drives = uniqueDriveTypes(matches);
    f.driveType = drives.length ? drives : [...(cat.fallbackFilter.driveType ?? [])];
  } else {
    const bodies = uniqueBodyTypes(matches);
    f.bodyType = bodies.length ? bodies : [...(cat.fallbackFilter.bodyType ?? [])];
  }

  return inventoryListingQueryHref(f);
}

/** Only show a body-type tile when at least this many used vehicles match. */
const MIN_BODY_TYPE_TILE_COUNT = 10;

/**
 * Body-type tiles for the home page: counts and /search links use the same rules as inventory search.
 * Tiles with fewer than {@link MIN_BODY_TYPE_TILE_COUNT} matches are omitted.
 */
export function getPopularCarTypeItems(
  vehicles: DealerVehicle[]
): PopularCarTypeItem[] {
  const condition = dominantUsedCondition(vehicles);
  const usedPool = filterDealerVehicles(vehicles, {
    ...emptyFilters,
    condition,
  });

  return CATEGORIES.map((cat) => {
    const matches = usedPool.filter(cat.match);
    const count = matches.length;
    const href = buildSearchHref(condition, matches, cat);
    return {
      title: cat.title,
      image: cat.image,
      count,
      countLabel: `${count.toLocaleString("en-AU")} Car${count === 1 ? "" : "s"}`,
      href,
    };
  }).filter((item) => item.count >= MIN_BODY_TYPE_TILE_COUNT);
}
