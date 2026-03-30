import type { VehicleListing } from "@/types/inventory";
import VehicleCard from "./VehicleCard";

interface VehicleGridProps {
  listings: VehicleListing[];
  view?: "grid" | "list";
}

export default function VehicleGrid({
  listings,
  view = "grid",
}: VehicleGridProps) {
  return (
    <div
      className={`inventory-results-grid ${view === "list" ? "is-list" : "is-grid"}`}
      role="list"
    >
      {listings.map((listing) => (
        <div key={listing.id} role="listitem">
          <VehicleCard listing={listing} view={view} />
        </div>
      ))}
    </div>
  );
}
