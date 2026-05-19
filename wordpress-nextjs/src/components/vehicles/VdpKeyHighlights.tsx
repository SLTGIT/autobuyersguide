export default function VdpKeyHighlights({ chips }: { chips: string[] }) {
  const visible = chips.map((c) => c.trim()).filter(Boolean);
  if (!visible.length) return null;

  return (
    <section className="cs-card p-4 p-lg-5 mb-4 vdp-ref-highlights">
      <h2 className="h4 fw-bold mb-3">Key highlights</h2>
      <ul className="vdp-ref-highlight-chips list-unstyled mb-2 d-flex flex-wrap gap-2">
        {visible.map((chip) => (
          <li key={chip}>
            <span className="vdp-ref-highlight-chip">{chip}</span>
          </li>
        ))}
      </ul>
      <p className="vdp-ref-highlights-note cs-muted small mb-0">
        <i className="bi bi-stars me-1" aria-hidden />
        Generated with AI from seller comments and car specifications.*
      </p>
    </section>
  );
}
