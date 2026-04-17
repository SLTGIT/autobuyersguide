"use client";

import { getAPIUrl } from "@/lib/wordpress";
import "@/app/contact/contact.css";
import { useCallback, useState, ChangeEvent, FormEvent } from "react";
import { SELL_MY_CAR_MAKES, sellMyCarMakeLabel } from "./sell-my-car-makes";

const FORM_TYPE = "Sell My Car Enquiry";

const YEAR_OPTIONS: string[] = [];
for (let y = 2026; y >= 1970; y -= 1) {
  YEAR_OPTIONS.push(String(y));
}

type FormFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  odometer: string;
  rego: string;
  comments: string;
};

const emptyForm: FormFields = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  vehicleYear: "",
  vehicleMake: "",
  vehicleModel: "",
  odometer: "",
  rego: "",
  comments: "",
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Parses km from user input (digits only); null if invalid or out of range. */
function parseOdometerKm(raw: string): number | null {
  const digits = digitsOnly(raw);
  if (!digits) return null;
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n) || n < 1 || n > 2_000_000) return null;
  return n;
}

function buildMessage(values: FormFields): string {
  const y = values.vehicleYear.trim();
  const mk = sellMyCarMakeLabel(values.vehicleMake.trim());
  const md = values.vehicleModel.trim();
  const odoNum = parseOdometerKm(values.odometer);
  const rego = values.rego.trim();
  const comments = values.comments.trim();

  const parts = [
    "Sell My Car — obligation-free valuation",
    `Vehicle: ${y} ${mk} ${md}`,
    odoNum != null
      ? `Odometer: ${odoNum.toLocaleString("en-AU")} km`
      : null,
    rego ? `Registration: ${rego}` : null,
    comments ? `Comments: ${comments}` : null,
  ].filter(Boolean) as string[];

  return parts.join("\n");
}

export default function SellMyCarValuationForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FormFields>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    if (status !== "idle") {
      setStatus("idle");
      setStatusMessage("");
    }
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const dismissSuccess = useCallback(() => {
    setStatus("idle");
    setStatusMessage("");
  }, []);

  const validateStep1 = (): boolean => {
    setStatus("idle");
    setStatusMessage("");
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setStatus("error");
      setStatusMessage("Please enter your first and last name.");
      return false;
    }
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      setStatus("error");
      setStatusMessage("Please enter a valid email address.");
      return false;
    }
    const phoneDigits = digitsOnly(formData.phone);
    if (phoneDigits.length !== 10) {
      setStatus("error");
      setStatusMessage(
        "Please enter a valid 10-digit Australian mobile number (no country code).",
      );
      return false;
    }
    return true;
  };

  const goToStep2 = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("idle");
    setStatusMessage("");

    if (!validateStep1()) {
      setStep(1);
      return;
    }

    const phoneDigits = digitsOnly(formData.phone);
    const y = formData.vehicleYear.trim();
    const mk = formData.vehicleMake.trim();
    const md = formData.vehicleModel.trim();
    const odoNum = parseOdometerKm(formData.odometer);
    if (!y || !mk || !md) {
      setStatus("error");
      setStatusMessage("Please select year and make, and enter the model.");
      return;
    }
    if (odoNum == null) {
      setStatus("error");
      setStatusMessage(
        "Please enter a valid odometer reading in kilometres (whole numbers only).",
      );
      return;
    }

    setLoading(true);
    try {
      const makeLabel = sellMyCarMakeLabel(mk);
      const body = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: phoneDigits,
        email: formData.email.trim(),
        message: buildMessage(formData),
        form_type: FORM_TYPE,
        budget: "",
        kms: odoNum,
        dob: "",
        driverLicence: "",
        address: "",
        date: new Date().toISOString(),
        item: {
          tag: "Car Sales Brisbane",
          make: makeLabel,
          model: formData.vehicleModel.trim(),
          year: formData.vehicleYear.trim(),
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
          "Thank you — your enquiry was sent successfully. We will get back to you soon.",
        );
        setFormData(emptyForm);
        setStep(1);
      } else {
        setStatus("error");
        setStatusMessage(
          typeof data.message === "string" && data.message
            ? data.message
            : "Something went wrong. Please try again in a moment.",
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
    <div className="smc-form-card">
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {status === "success" && statusMessage}
        {status === "error" && statusMessage}
      </div>

      {status === "success" && (
        <div
          className="cs-contact-form__alert cs-contact-form__alert--success mb-4"
          role="status"
        >
          <i className="bi bi-check-circle-fill" aria-hidden />
          <div className="flex-grow-1">
            <strong className="d-block mb-1">Enquiry received</strong>
            <span>{statusMessage}</span>
            <button
              type="button"
              className="btn btn-link p-0 mt-2 d-block text-decoration-none fw-semibold"
              style={{ color: "var(--cs-primary)" }}
              onClick={dismissSuccess}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div
          className="cs-contact-form__alert cs-contact-form__alert--error mb-4"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill" aria-hidden />
          <div>
            <strong className="d-block mb-1">Could not submit</strong>
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div
          className="smc-steps-progress mb-3"
          role="group"
          aria-label="Enquiry form progress"
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span
              className="smc-steps-progress__meta text-muted small"
              aria-live="polite"
            >
              Step {step} of 2
            </span>
            <span className="smc-steps-progress__meta text-muted small">
              {step === 1 ? "Your details" : "Your vehicle"}
            </span>
          </div>
          <div
            className="smc-steps-progress__track"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={2}
            aria-valuenow={step}
            aria-valuetext={`Step ${step} of 2`}
          >
            <div
              className="smc-steps-progress__fill"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
          <div className="smc-steps-progress__labels">
            <span className={step === 1 ? "is-active" : "is-complete"}>
              <span className="smc-steps-progress__dot" aria-hidden />
              Your details
            </span>
            <span className={step === 2 ? "is-active" : ""}>
              <span className="smc-steps-progress__dot" aria-hidden />
              Your vehicle
            </span>
          </div>
        </div>

        <h2 className="smc-form-title mb-4">
          Enquire now for your vehicle price.
        </h2>

        {step === 1 ? (
          <>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="smc-form-label" htmlFor="smc-firstName">
                  First name<span className="smc-form-req">*</span>
                </label>
                <input
                  id="smc-firstName"
                  name="firstName"
                  type="text"
                  className="form-control smc-form-control"
                  placeholder="First name"
                  required
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="smc-form-label" htmlFor="smc-lastName">
                  Last name<span className="smc-form-req">*</span>
                </label>
                <input
                  id="smc-lastName"
                  name="lastName"
                  type="text"
                  className="form-control smc-form-control"
                  placeholder="Last name"
                  required
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="smc-form-label" htmlFor="smc-email">
                Email address<span className="smc-form-req">*</span>
              </label>
              <input
                id="smc-email"
                name="email"
                type="email"
                className="form-control smc-form-control"
                placeholder="Email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label className="smc-form-label" htmlFor="smc-phone">
                Mobile number<span className="smc-form-req">*</span>
              </label>
              <input
                id="smc-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                className="form-control smc-form-control"
                placeholder=""
                required
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn smc-form-btn"
                onClick={goToStep2}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3">
              <label className="smc-form-label" htmlFor="smc-make">
                Vehicle make<span className="smc-form-req">*</span>
              </label>
              <select
                id="smc-make"
                name="vehicleMake"
                className="form-select smc-form-control"
                required
                value={formData.vehicleMake}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Vehicle make
                </option>
                {SELL_MY_CAR_MAKES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="smc-form-label" htmlFor="smc-model">
                Model<span className="smc-form-req">*</span>
              </label>
              <input
                id="smc-model"
                name="vehicleModel"
                type="text"
                className="form-control smc-form-control"
                placeholder="Model"
                required
                autoComplete="off"
                value={formData.vehicleModel}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="smc-form-label" htmlFor="smc-year">
                Year<span className="smc-form-req">*</span>
              </label>
              <select
                id="smc-year"
                name="vehicleYear"
                className="form-select smc-form-control"
                required
                value={formData.vehicleYear}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Vehicle year…
                </option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="smc-form-label" htmlFor="smc-odo">
                Kilometres (km)<span className="smc-form-req">*</span>
              </label>
              <input
                id="smc-odo"
                name="odometer"
                type="text"
                inputMode="numeric"
                className="form-control smc-form-control"
                placeholder="e.g. 125000"
                required
                autoComplete="off"
                value={formData.odometer}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label className="smc-form-label" htmlFor="smc-comments">
                Comments
              </label>
              <textarea
                id="smc-comments"
                name="comments"
                className="form-control smc-form-control smc-form-textarea"
                rows={3}
                placeholder=""
                autoComplete="off"
                value={formData.comments}
                onChange={handleChange}
              />
            </div>

            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary order-2 order-sm-1"
                onClick={() => {
                  setStep(1);
                  setStatus("idle");
                  setStatusMessage("");
                }}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn smc-form-btn order-1 order-sm-2"
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
                  "Enquire now"
                )}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
