import type { DealerVehicle } from "@/types/inventory";
import { buildVehicleVdpSnapshotFromVehicle } from "@/lib/openai/vehicleVdpTypes";
import { getVehicleVdpAiContent } from "@/lib/openai/vehicleVdpCopy";

/**
 * Populates the same server-side cache used by VDP (`getVehicleVdpAiContent` / `unstable_cache`).
 * Intended for background use (e.g. `after()` on the home page) so first clicks on featured cars are faster.
 */
export async function warmVehicleVdpCachesForVehicles(
  vehicles: DealerVehicle[],
  options?: { max?: number }
): Promise<void> {
  const cap = options?.max ?? 12;
  const slice = vehicles.slice(0, Math.max(0, cap));
  if (slice.length === 0) return;

  const results = await Promise.allSettled(
    slice.map(async (v) => {
      const snapshot = buildVehicleVdpSnapshotFromVehicle(v);
      await getVehicleVdpAiContent(snapshot);
    })
  );

  for (const r of results) {
    if (r.status === "rejected") {
      console.warn("[warmVehicleVdpCache]", r.reason);
    }
  }
}
