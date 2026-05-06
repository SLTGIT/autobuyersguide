"use client";

import type { VehicleListing } from "@/types/inventory";
import { useInventorySearchUrl } from "@/components/vehicles/InventorySearchUrlContext";
import VehicleGrid from "@/components/vehicles/VehicleGrid";

export default function InventorySrpVehicleGrid({
  listings,
}: {
  listings: VehicleListing[];
}) {
  const { resultsView } = useInventorySearchUrl();
  return <VehicleGrid listings={listings} view={resultsView} />;
}
