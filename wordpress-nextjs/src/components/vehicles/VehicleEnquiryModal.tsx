"use client";

import { getAPIUrl } from "@/lib/wordpress";
import "@/app/contact/contact.css";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  ChangeEvent,
  FormEvent,
} from "react";
import { createPortal } from "react-dom";

export type VehicleEnquiryItemPayload = {
  image: string;
  make: string;
  model: string;
  year: string;
  stock: string;
  rego: string;
  status: string;
  tag: string;
  url: string;
};

const DEALERSHIP_OPTIONS = [
  {
    value: "ormiston",
    label: "Car Sales Brisbane",
  },
] as const;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

interface VehicleEnquiryModalProps {
  item: VehicleEnquiryItemPayload;
}

export default function VehicleEnquiryModal({ item }: VehicleEnquiryModalProps) {
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const closeRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comments, setComments] = useState("");
  const [dealership, setDealership] = useState("");
  const [similarStock, setSimilarStock] = useState(false);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const resetForm = useCallback(() => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setComments("");
    setDealership("");
    setSimilarStock(false);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setStatus("idle");
    setStatusMessage("");
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("idle");
    setStatusMessage("");

    const phoneDigits = digitsOnly(phone);
    if (phoneDigits.length !== 10) {
      setStatus("error");
      setStatusMessage(
        "Please enter a valid 10-digit Australian mobile number.",
      );
      return;
    }

    const dealerLabel =
      DEALERSHIP_OPTIONS.find((d) => d.value === dealership)?.label ?? "";

    const messageParts = [comments.trim()];
    if (dealerLabel) {
      messageParts.push(`Preferred dealership: ${dealerLabel}`);
    }
    if (similarStock) {
      messageParts.push(
        "Please email me similar stock and latest offers.",
      );
    }
    const message = messageParts.filter(Boolean).join("\n\n");

    setLoading(true);
    try {
      const body = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phoneDigits,
        email: email.trim(),
        message,
        form_type: "used vehicle",
        budget: "",
        dob: "",
        driverLicence: "",
        address: "",
        item: {
          image: item.image,
          make: item.make,
          model: item.model,
          year: item.year,
          stock: item.stock,
          rego: item.rego,
          status: item.status,
          tag: item.tag,
          url: item.url,
        },
      };

      const res = await fetch(getAPIUrl("/custom/v1/submit-lead"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setStatusMessage(
          "Thank you — your enquiry was sent. We will be in touch shortly.",
        );
        resetForm();
      } else {
        setStatus("error");
        setStatusMessage(
          typeof data.message === "string" && data.message
            ? data.message
            : "Something went wrong. Please try again.",
        );
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setStatusMessage(
        "We could not send your enquiry. Check your connection and try again.",
      );
    }
    setLoading(false);
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
        Enquire now
      </button>

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
                    Enquire Now
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
              {status === "success" && (
                <div
                  className="cs-contact-form__alert cs-contact-form__alert--success mb-3"
                  role="status"
                >
                  <i className="bi bi-check-circle-fill" aria-hidden />
                  <div className="flex-grow-1">
                    <strong className="d-block mb-1">Sent</strong>
                    <span>{statusMessage}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success mt-2"
                      onClick={close}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
              {status === "error" && (
                <div
                  className="cs-contact-form__alert cs-contact-form__alert--error mb-3"
                  role="alert"
                >
                  <i className="bi bi-exclamation-triangle-fill" aria-hidden />
                  <div>
                    <strong className="d-block mb-1">Could not submit</strong>
                    <span>{statusMessage}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="vdp-enquiry-form">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label
                      className="cs-contact-form__label"
                      htmlFor={`${dialogId}-fn`}
                    >
                      First name
                      <span className="cs-contact-form__req" aria-hidden>
                        *
                      </span>
                    </label>
                    <input
                      id={`${dialogId}-fn`}
                      name="firstName"
                      type="text"
                      className="form-control cs-contact-form__control"
                      required
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFirstName(e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label
                      className="cs-contact-form__label"
                      htmlFor={`${dialogId}-ln`}
                    >
                      Last name
                      <span className="cs-contact-form__req" aria-hidden>
                        *
                      </span>
                    </label>
                    <input
                      id={`${dialogId}-ln`}
                      name="lastName"
                      type="text"
                      className="form-control cs-contact-form__control"
                      required
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setLastName(e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    className="cs-contact-form__label"
                    htmlFor={`${dialogId}-email`}
                  >
                    Email address
                    <span className="cs-contact-form__req" aria-hidden>
                      *
                    </span>
                  </label>
                  <input
                    id={`${dialogId}-email`}
                    name="email"
                    type="email"
                    className="form-control cs-contact-form__control"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="cs-contact-form__label"
                    htmlFor={`${dialogId}-phone`}
                  >
                    Mobile number
                    <span className="cs-contact-form__req" aria-hidden>
                      *
                    </span>
                  </label>
                  <input
                    id={`${dialogId}-phone`}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    className="form-control cs-contact-form__control"
                    required
                    autoComplete="tel"
                    placeholder="0412 345 678"
                    value={phone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPhone(e.target.value)
                    }
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="cs-contact-form__label"
                    htmlFor={`${dialogId}-msg`}
                  >
                    Comments
                    <span className="cs-contact-form__req" aria-hidden>
                      *
                    </span>
                  </label>
                  <textarea
                    id={`${dialogId}-msg`}
                    name="message"
                    className="form-control cs-contact-form__control cs-contact-form__textarea"
                    rows={4}
                    required
                    placeholder="Message"
                    value={comments}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      setComments(e.target.value)
                    }
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="cs-contact-form__label"
                    htmlFor={`${dialogId}-dealer`}
                  >
                    Dealership location
                    <span className="cs-contact-form__req" aria-hidden>
                      *
                    </span>
                  </label>
                  <select
                    id={`${dialogId}-dealer`}
                    name="dealership"
                    className="form-select cs-contact-form__control"
                    required
                    value={dealership}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setDealership(e.target.value)
                    }
                  >
                    <option value="">Select a location</option>
                    {DEALERSHIP_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-check cs-contact-form__subscribe mb-4">
                  <input
                    id={`${dialogId}-similar`}
                    name="similarStock"
                    type="checkbox"
                    className="form-check-input"
                    checked={similarStock}
                    onChange={(e) => setSimilarStock(e.target.checked)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`${dialogId}-similar`}
                  >
                    Email me similar stock and latest offers.
                  </label>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-2">
                  <button
                    type="submit"
                    className="btn cs-contact-form__submit flex-grow-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden
                        />
                        Sending…
                      </>
                    ) : (
                      "Send enquiry"
                    )}
                  </button>
                  {/* <button
                    type="button"
                    className="btn btn-outline-secondary flex-grow-1 flex-sm-grow-0"
                    onClick={close}
                    disabled={loading}
                  >
                    Cancel
                  </button> */}
                </div>
              </form>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
