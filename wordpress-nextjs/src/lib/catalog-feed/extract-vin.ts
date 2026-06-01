import type { DealerVehicle } from "@/types/inventory";

const VIN_PATTERN = /\bVIN\s*\*?\s*([A-HJ-NPR-Z0-9]{11,17})\s*\*?/i;

/** VIN from feed field or dealer comments / description text. */
export function extractVinFromDealerVehicle(v: DealerVehicle): string {
  const fromField =
    (v as DealerVehicle & { VIN?: string; Vin?: string }).VIN?.trim() ||
    (v as DealerVehicle & { VIN?: string; Vin?: string }).Vin?.trim() ||
    "";
  if (fromField) return fromField.toUpperCase();

  const text = [v.Comments, v.Description].filter(Boolean).join("\n");
  const m = text.match(VIN_PATTERN);
  return m ? m[1].toUpperCase() : "";
}
