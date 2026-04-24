"use client";

import { useCallback, useId, useState } from "react";

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

/** AU-style masked display (e.g. 0418 *** ***). */
function maskDealerPhoneDisplay(phone: string): string {
  const d = digitsOnly(phone);
  if (d.length === 10 && d.startsWith("04")) {
    return `${d.slice(0, 4)} *** ***`;
  }
  if (d.length >= 10 && d.startsWith("0")) {
    return `${d.slice(0, 4)} *** ***`;
  }
  if (d.length >= 8) {
    return `${d.slice(0, 3)} **** **`;
  }
  if (d.length > 0) {
    return `${d.slice(0, 2)}••••`;
  }
  return "Tap to show number";
}

export type VdpRefPhoneRevealProps = {
  dealerPhone: string;
  telHref: string;
  stockNumber: string;
  /** When true (default), top border separates phone from content above (sidebar card). */
  showDivider?: boolean;
  className?: string;
};

export default function VdpRefPhoneReveal({
  dealerPhone,
  telHref,
  stockNumber,
  showDivider = true,
  className,
}: VdpRefPhoneRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const hintId = useId();
  const masked = maskDealerPhoneDisplay(dealerPhone);
  const stock = stockNumber.trim();

  const onReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  if (!dealerPhone.trim() || !telHref.trim()) {
    return null;
  }

  const rootClass = [
    "vdp-ref-phone-inline",
    showDivider ? "vdp-ref-phone-inline--ruled" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <p id={hintId} className="vdp-ref-phone-hint mb-2">
        Click to reveal phone number.
        {/* {stock ? (
          <>
            {" "}
            <span className="vdp-ref-phone-stock">Stock no: {stock}</span>
          </>
        ) : null} */}
      </p>
      <div className="vdp-ref-phone-row d-flex align-items-center justify-content-between gap-3">
        {revealed ? (
          <a
            href={telHref}
            className="vdp-ref-phone-number vdp-ref-phone-number--link text-decoration-none"
            aria-describedby={hintId}
          >
            {dealerPhone.trim()}
          </a>
        ) : (
          <button
            type="button"
            className="vdp-ref-phone-reveal-btn"
            onClick={onReveal}
            aria-expanded={false}
            aria-describedby={hintId}
          >
            <span className="vdp-ref-phone-masked">{masked}</span>
            <span className="visually-hidden">Reveal phone number</span>
          </button>
        )}
        <i className="bi bi-telephone-fill vdp-ref-phone-icon flex-shrink-0" aria-hidden />
      </div>
    </div>
  );
}
