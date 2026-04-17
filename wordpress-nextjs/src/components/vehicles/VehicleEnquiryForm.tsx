"use client";

import { getAPIUrl } from "@/lib/wordpress";
import "@/app/contact/contact.css";
import { useCallback, useState, ChangeEvent, FormEvent } from "react";

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

export interface VehicleEnquiryFormProps {
  item: VehicleEnquiryItemPayload;
  /** Unique prefix for input ids (e.g. from useId). */
  idPrefix: string;
  /** Show a Close control after successful submit (e.g. inside a modal). */
  showCloseOnSuccess?: boolean;
  onSuccessClose?: () => void;
}

export default function VehicleEnquiryForm({
  item,
  idPrefix,
  showCloseOnSuccess,
  onSuccessClose,
}: VehicleEnquiryFormProps) {
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
        form_type: "Used Vehicle Enquiry",
        budget: "",
        dob: "",
        driverLicence: "",
        address: "",
        date: new Date().toISOString(),
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
      {status === "success" && (
        <div
          className="cs-contact-form__alert cs-contact-form__alert--success mb-3"
          role="status"
        >
          <i className="bi bi-check-circle-fill" aria-hidden />
          <div className="flex-grow-1">
            <strong className="d-block mb-1">Sent</strong>
            <span>{statusMessage}</span>
            {showCloseOnSuccess && onSuccessClose ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-success mt-2"
                onClick={onSuccessClose}
              >
                Close
              </button>
            ) : null}
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
              htmlFor={`${idPrefix}-fn`}
            >
              First name
              <span className="cs-contact-form__req" aria-hidden>
                *
              </span>
            </label>
            <input
              id={`${idPrefix}-fn`}
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
              htmlFor={`${idPrefix}-ln`}
            >
              Last name
              <span className="cs-contact-form__req" aria-hidden>
                *
              </span>
            </label>
            <input
              id={`${idPrefix}-ln`}
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
            htmlFor={`${idPrefix}-email`}
          >
            Email address
            <span className="cs-contact-form__req" aria-hidden>
              *
            </span>
          </label>
          <input
            id={`${idPrefix}-email`}
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
            htmlFor={`${idPrefix}-phone`}
          >
            Mobile number
            <span className="cs-contact-form__req" aria-hidden>
              *
            </span>
          </label>
          <input
            id={`${idPrefix}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            className="form-control cs-contact-form__control"
            required
            autoComplete="tel"
            placeholder=""
            value={phone}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPhone(e.target.value)
            }
          />
        </div>

        <div className="mb-3">
          <label
            className="cs-contact-form__label"
            htmlFor={`${idPrefix}-msg`}
          >
            Comments
            <span className="cs-contact-form__req" aria-hidden>
              *
            </span>
          </label>
          <textarea
            id={`${idPrefix}-msg`}
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
            htmlFor={`${idPrefix}-dealer`}
          >
            Dealership location
            <span className="cs-contact-form__req" aria-hidden>
              *
            </span>
          </label>
          <select
            id={`${idPrefix}-dealer`}
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
            id={`${idPrefix}-similar`}
            name="similarStock"
            type="checkbox"
            className="form-check-input"
            checked={similarStock}
            onChange={(e) => setSimilarStock(e.target.checked)}
          />
          <label
            className="form-check-label"
            htmlFor={`${idPrefix}-similar`}
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
        </div>
      </form>
    </>
  );
}
