"use client";

import { useClientMounted } from "@/hooks/useClientMounted";
import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import "./form-submission-modal.css";

export type FormSubmissionModalPhase = "loading" | "success";

export interface FormSubmissionModalProps {
  open: boolean;
  phase: FormSubmissionModalPhase;
  /** First name shown in the thank-you message. */
  firstName: string;
  onClose: () => void;
}

export default function FormSubmissionModal({
  open,
  phase,
  firstName,
  onClose,
}: FormSubmissionModalProps) {
  const mounted = useClientMounted();
  const reactId = useId();
  const titleId = `form-submission-modal-title-${reactId.replace(/:/g, "")}`;
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    if (phase === "loading") return;
    onClose();
  }, [onClose, phase]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (phase === "success") {
      closeRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, phase]);

  useEffect(() => {
    if (!open || phase === "loading") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, phase, handleClose]);

  if (!mounted || !open) return null;

  const displayName = firstName.trim() || "there";

  return createPortal(
    <div
      className="form-submission-modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="form-submission-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={phase === "loading"}
      >
        {phase === "success" ? (
          <button
            ref={closeRef}
            type="button"
            className="form-submission-modal__icon-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <i className="bi bi-x-lg" aria-hidden />
          </button>
        ) : null}

        <div
          className={`form-submission-modal__body${
            phase === "success" ? " form-submission-modal__body--success" : ""
          }`}
        >
          {phase === "loading" ? (
            <div className="form-submission-modal__loading">
              <div
                className="form-submission-modal__spinner"
                role="status"
                aria-label="Submitting your enquiry"
              />
              <p className="form-submission-modal__loading-text">
                Submitting your enquiry…
              </p>
            </div>
          ) : (
            <>
              <div className="form-submission-modal__success-icon" aria-hidden>
                <i className="bi bi-check-lg" />
              </div>
              <h2 id={titleId} className="form-submission-modal__heading">
                Thank you{" "}
                <span className="form-submission-modal__name">{displayName}</span>{" "}
                for submitting your enquiry.
              </h2>
              <p className="form-submission-modal__subtext">
                A customer relations representative will contact you shortly to
                answer any questions you may have.
              </p>
              <button
                type="button"
                className="form-submission-modal__close-btn"
                onClick={handleClose}
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
