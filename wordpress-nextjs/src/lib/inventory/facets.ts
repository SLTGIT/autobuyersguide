import type {
  DealerVehicle,
  FilterOptionCount,
  InventoryFacets,
  InventoryFilterState,
} from "@/types/inventory";
import {
  countByField,
  filterDealerVehicles,
  mapToOptions,
  omitInventoryFilters,
} from "./query";

/** One row per make; URL value is lowercase, label keeps feed casing. */
function mergeMakeFacetOptions(map: Map<string, number>): FilterOptionCount[] {
  const byLower = new Map<string, { label: string; count: number }>();
  for (const [raw, count] of map) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    const prev = byLower.get(key);
    if (prev) {
      byLower.set(key, { label: prev.label, count: prev.count + count });
    } else {
      byLower.set(key, { label: trimmed, count });
    }
  }
  return [...byLower.entries()]
    .map(([value, { label, count }]) => ({
      value,
      label,
      count,
    }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
    );
}

export function buildInventoryFacets(
  all: DealerVehicle[],
  f: InventoryFilterState
): InventoryFacets {
  const cBase = filterDealerVehicles(all, omitInventoryFilters(f, ["condition"]));
  const conditions = mapToOptions(countByField(cBase, "Condition"));

  const makeBase = filterDealerVehicles(all, omitInventoryFilters(f, ["make"]));
  const makes = mergeMakeFacetOptions(countByField(makeBase, "Make"));

  let models: FilterOptionCount[] = [];
  if (f.make.trim()) {
    const modelBase = filterDealerVehicles(
      all,
      omitInventoryFilters(f, ["model"]),
    );
    models = mergeMakeFacetOptions(countByField(modelBase, "Model"));
  }

  const bodyTypes = mapToOptions(
    countByField(
      filterDealerVehicles(all, omitInventoryFilters(f, ["bodyType"])),
      "BodyType"
    )
  );
  const fuelTypes = mapToOptions(
    countByField(
      filterDealerVehicles(all, omitInventoryFilters(f, ["fuelType"])),
      "FuelType"
    )
  );
  const colours = mapToOptions(
    countByField(
      filterDealerVehicles(all, omitInventoryFilters(f, ["bodyColour"])),
      "BodyColour"
    )
  );
  const driveTypes = mapToOptions(
    countByField(
      filterDealerVehicles(all, omitInventoryFilters(f, ["driveType"])),
      "DriveType"
    )
  );
  const transmissions = mapToOptions(
    countByField(
      filterDealerVehicles(all, omitInventoryFilters(f, ["transmission"])),
      "TransmissionType"
    )
  );
  const types = mapToOptions(
    countByField(
      filterDealerVehicles(all, omitInventoryFilters(f, ["type"])),
      "Type"
    )
  );

  return {
    conditions,
    makes,
    models,
    bodyTypes,
    fuelTypes,
    colours,
    driveTypes,
    transmissions,
    types,
  };
}
