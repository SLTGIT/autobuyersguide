"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "How do I book a test drive for this car?",
    a: "Use the “Book a test drive” button on this page to contact us, or call the number shown. We’ll confirm a time that suits you.",
  },
  {
    q: "Is this vehicle available for finance?",
    a: "Many of our vehicles are eligible for finance. Ask our team for a quote and we’ll walk you through the options.",
  },
  {
    q: "Can I trade in my current vehicle?",
    a: "Yes — we accept trade-ins. Bring your vehicle details or visit us for a valuation.",
  },
  {
    q: "Where is the vehicle located?",
    a: "The suburb or region shown on this listing reflects the stock location from our inventory feed.",
  },
];

export default function VehicleVdpFaq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="vdp-faq" aria-labelledby="vdp-faq-heading">
      <h2 id="vdp-faq-heading" className="vdp-faq-title">
        Frequently asked questions
      </h2>
      <div className="vdp-faq-list">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className={`vdp-faq-item ${isOpen ? "is-open" : ""}`}>
              <button
                type="button"
                className="vdp-faq-trigger"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <span className="vdp-faq-chevron" aria-hidden>
                  {isOpen ? "▾" : "▸"}
                </span>
              </button>
              {isOpen ? (
                <div className="vdp-faq-panel">
                  <p>{item.a}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
