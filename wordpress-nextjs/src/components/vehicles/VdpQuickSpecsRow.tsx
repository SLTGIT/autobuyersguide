import { biClass } from "@/lib/openai/vehicleVdpDisplayUtils";

export interface VdpQuickSpecItem {
  label: string;
  value: string;
  icon: string;
}

export default function VdpQuickSpecsRow({ items }: { items: VdpQuickSpecItem[] }) {
  const visible = items.filter((i) => i.value && i.value !== "—");
  if (!visible.length) return null;

  return (
    <div className="vdp-ref-quick-specs row g-3 mb-4" role="list">
      {visible.map((item) => (
        <div key={item.label} className="col-6 col-md-3" role="listitem">
          <div className="vdp-ref-quick-spec h-100">
            <span className="vdp-ref-quick-spec__icon">
              <i className={biClass(item.icon)} aria-hidden />
            </span>
            <div>
              <div className="vdp-ref-quick-spec__label">{item.label}</div>
              <div className="vdp-ref-quick-spec__value fw-semibold">{item.value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
