"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import VehicleEnquiryForm, {
  type VehicleEnquiryItemPayload,
} from "./VehicleEnquiryForm";

export type { VehicleEnquiryItemPayload };

const ENQUIRY_SECTION_ID = "vdp-vehicle-enquiry";

interface VehicleEnquiryModalProps {
  item: VehicleEnquiryItemPayload;
}

export default function VehicleEnquiryModal({ item }: VehicleEnquiryModalProps) {
  const reactId = useId();
  const safe = reactId.replace(/:/g, "");
  const dialogId = `vdp-enq-dialog-${safe}`;
  const titleId = `${dialogId}-title`;
  const idPrefixModal = `vdp-enq-modal-${safe}`;
  const idPrefixInline = `vdp-enq-inline-${safe}`;
  const inlineHeadingId = `${idPrefixInline}-heading`;

  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const onBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) close();
  };

  return (
    <>
      <button
        type="button"
        className="vdp-cta vdp-cta--outline vdp-enquiry-open"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
      >
        <span className="vdp-cta-icon" aria-hidden>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </span>
        Book a test drive
      </button>

      <section
        id={ENQUIRY_SECTION_ID}
        className="vdp-enquiry-inline"
        aria-labelledby={inlineHeadingId}
      >
        <h2 id={inlineHeadingId} className="vdp-enquiry-inline__title">
          Enquire now
        </h2>
        <VehicleEnquiryForm idPrefix={idPrefixInline} item={item} />
      </section>

      {open
        ? createPortal(
            <div
              className="vdp-enquiry-backdrop"
              role="presentation"
              onMouseDown={onBackdropMouseDown}
            >
              <div
                id={dialogId}
                className="vdp-enquiry-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
              >
                <div className="vdp-enquiry-dialog__head">
                  <h2 id={titleId} className="vdp-enquiry-dialog__title">
                    Book a test drive
                  </h2>
                  <button
                    ref={closeRef}
                    type="button"
                    className="vdp-enquiry-dialog__close"
                    onClick={close}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <div className="vdp-enquiry-dialog__body">
                  <VehicleEnquiryForm
                    idPrefix={idPrefixModal}
                    item={item}
                    showCloseOnSuccess
                    onSuccessClose={close}
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
