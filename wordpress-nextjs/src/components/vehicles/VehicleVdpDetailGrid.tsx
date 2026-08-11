interface DetailRow {
  label: string;
  value: string;
}

interface VehicleVdpDetailGridProps {
  rows: DetailRow[];
}

function hasMeaningfulValue(value: string): boolean {
  const t = value.trim();
  if (!t) return false;
  const lower = t.toLowerCase();
  if (t === "—" || t === "-" || lower === "n/a" || lower === "na") {
    return false;
  }
  return true;
}

function CellIcon({ label }: { label: string }) {
  const key = label.toLowerCase();
  const common = { width: 22, height: 22, viewBox: "0 0 24 24" as const, fill: "none", stroke: "currentColor", strokeWidth: 1.75 };
  if (key.includes("condition") || key.includes("stock"))
    return (
      <svg {...common} aria-hidden>
        <path d="M5 12h14M12 5v14" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  if (key.includes("transmission"))
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
      </svg>
    );
  if (key.includes("body"))
    return (
      <svg {...common} aria-hidden>
        <path d="M5 17h14v-5l-2-4H7l-2 4v5zM7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
      </svg>
    );
  if (key.includes("odometer") || key.includes("km"))
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  if (key.includes("fuel"))
    return (
      <svg {...common} aria-hidden>
        <path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V10l-2-2V6" />
      </svg>
    );
  if (key.includes("engine") || key.includes("power"))
    return (
      <svg {...common} aria-hidden>
        <path d="M12 2v4M6 6h12v6H6zM8 18h8v4H8z" />
      </svg>
    );
  if (key.includes("colour") || key.includes("color"))
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" opacity="0.35" />
      </svg>
    );
  if (key.includes("drive"))
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      </svg>
    );
  if (key.includes("location"))
    return (
      <svg {...common} aria-hidden>
        <path d="M12 21s8-5.33 8-11a8 8 0 1 0-16 0c0 5.67 8 11 8 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  if (key.includes("seat") || key.includes("door"))
    return (
      <svg {...common} aria-hidden>
        <path d="M4 19V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" />
        <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
      </svg>
    );
  return (
    <svg {...common} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12h6M12 9v6" />
    </svg>
  );
}

export default function VehicleVdpDetailGrid({ rows }: VehicleVdpDetailGridProps) {
  const visibleRows = rows.filter((row) => hasMeaningfulValue(row.value));
  if (visibleRows.length === 0) return null;

  return (
    <section className="vdp-car-details" aria-labelledby="vdp-car-details-heading">
      <h2 id="vdp-car-details-heading" className="vdp-section-heading">
        Car details
      </h2>
      <div className="vdp-detail-grid">
        {visibleRows.map((row) => (
          <div key={row.label} className="vdp-detail-cell">
            <span className="vdp-detail-icon" aria-hidden>
              <CellIcon label={row.label} />
            </span>
            <div className="vdp-detail-text">
              <span className="vdp-detail-label">{row.label}</span>
              <span className="vdp-detail-value">{row.value}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
