import type { InventoryFilterState } from "@/types/inventory";

function titleCaseWord(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function titleCasePhrase(s: string): string {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map(titleCaseWord)
    .join(" ");
}

function conditionPrefix(filters: InventoryFilterState): string {
  const c = filters.condition.trim().toLowerCase();
  if (c === "new") return "new";
  if (c === "used") return "used";
  return "";
}

function joinFilterParts(...segments: string[]): string {
  return segments
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
}

/**
 * Human-readable filter phrase for SRP meta templates (`{filterText}`).
 * e.g. "Hyundai", "used Hyundai", "SUV", "new cars".
 */
export function buildSrpSearchFilterText(
  filters: InventoryFilterState,
  opts?: { pathHeroLabel?: string | null },
): string {
  const pathLabel = opts?.pathHeroLabel?.trim();
  const prefix = conditionPrefix(filters);

  if (pathLabel) {
    const lower = pathLabel.toLowerCase();
    if (lower.startsWith("new ") || lower.startsWith("used ")) {
      return pathLabel;
    }
    if (/^\$/.test(pathLabel) || /^\d{4}$/.test(pathLabel)) {
      return pathLabel;
    }
    return joinFilterParts(prefix, pathLabel);
  }

  if (filters.make.trim()) {
    return joinFilterParts(
      prefix,
      titleCasePhrase(filters.make),
      filters.model.trim() ? titleCasePhrase(filters.model) : "",
    );
  }

  if (filters.bodyType.length === 1) {
    return joinFilterParts(prefix, titleCasePhrase(filters.bodyType[0]));
  }
  if (filters.fuelType.length === 1) {
    return joinFilterParts(prefix, titleCasePhrase(filters.fuelType[0]));
  }
  if (filters.driveType.length === 1) {
    return joinFilterParts(prefix, titleCasePhrase(filters.driveType[0]));
  }
  if (filters.transmission.length === 1) {
    return joinFilterParts(prefix, titleCasePhrase(filters.transmission[0]));
  }
  if (filters.type.length === 1) {
    return joinFilterParts(prefix, titleCasePhrase(filters.type[0]));
  }

  return joinFilterParts(prefix, "cars");
}
