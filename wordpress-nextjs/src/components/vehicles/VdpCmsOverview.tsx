export default function VdpCmsOverview({ text }: { text: string }) {
  const overview = text.trim();
  if (!overview) return null;

  return (
    <section className="cs-card p-4 p-lg-5 mb-4 vdp-ref-overview">
      <h2 className="h4 fw-bold mb-3">Overview</h2>
      <p
        className="cs-muted mb-0 vdp-ref-overview__body"
        dangerouslySetInnerHTML={{ __html: overview }}
      />
    </section>
  );
}
