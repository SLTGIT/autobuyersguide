"use client";

import { getAPIUrl } from "@/lib/wordpress";
import "@/app/contact/contact.css";
import { useCallback, useState, ChangeEvent, FormEvent } from "react";

const FORM_TYPE = "Sell My Car Enquiry";

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

function buildMessage(values: FormFields): string {
  const y = values.vehicleYear.trim();
  const mk = values.vehicleMake.trim();
  const md = values.vehicleModel.trim();
  const odo = values.odometer.trim();
  const rego = values.rego.trim();
  const comments = values.comments.trim();

  const parts = [
    "Sell My Car — obligation-free valuation",
    `Vehicle: ${y} ${mk} ${md}`,
    odo ? `Odometer: ${odo} km` : null,
    rego ? `Registration: ${rego}` : null,
    comments ? `Comments: ${comments}` : null,
  ].filter(Boolean) as string[];

  return parts.join("\n");
}

export default function SellMyCarValuationForm() {
  const [formData, setFormData] = useState<FormFields>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("idle");
    setStatusMessage("");

    const phoneDigits = digitsOnly(formData.phone);
    if (phoneDigits.length !== 10) {
      setStatus("error");
      setStatusMessage(
        "Please enter a valid 10-digit Australian mobile number (no country code).",
      );
      return;
    }

    const y = formData.vehicleYear.trim();
    const mk = formData.vehicleMake.trim();
    const md = formData.vehicleModel.trim();
    if (!y || !mk || !md) {
      setStatus("error");
      setStatusMessage("Please complete year, make, and model.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: phoneDigits,
        email: formData.email.trim(),
        message: buildMessage(formData),
        form_type: FORM_TYPE,
        budget: "",
        dob: "",
        driverLicence: "",
        address: "",
        item: {
          tag: "Auto Buyers Guide",
          make: formData.vehicleMake,
          model: formData.vehicleModel,
          year: formData.vehicleYear,
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
        <h2 className="smc-form-title mb-4">
          Enquire now for your vehicle price.
        </h2>

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

        <div className="mb-3">
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
          <p className="form-text text-muted small mb-0 mt-1">
            
          </p>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="smc-form-label" htmlFor="smc-year">
              Year<span className="smc-form-req">*</span>
            </label>
            <input
              id="smc-year"
              name="vehicleYear"
              type="text"
              inputMode="numeric"
              className="form-control smc-form-control"
              placeholder="e.g. 2018"
              required
              autoComplete="off"
              value={formData.vehicleYear}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label className="smc-form-label" htmlFor="smc-make">
              Make<span className="smc-form-req">*</span>
            </label>
            <input
              id="smc-make"
              name="vehicleMake"
              type="text"
              className="form-control smc-form-control"
              placeholder="Make"
              required
              autoComplete="off"
              value={formData.vehicleMake}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
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
        </div>

        {/* <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="smc-form-label" htmlFor="smc-odo">
              Odometer (km)
            </label>
            <input
              id="smc-odo"
              name="odometer"
              type="text"
              inputMode="numeric"
              className="form-control smc-form-control"
              placeholder="Optional"
              autoComplete="off"
              value={formData.odometer}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label className="smc-form-label" htmlFor="smc-rego">
              Registration
            </label>
            <input
              id="smc-rego"
              name="rego"
              type="text"
              className="form-control smc-form-control"
              placeholder="Optional"
              autoComplete="off"
              value={formData.rego}
              onChange={handleChange}
            />
          </div>
        </div> */}

        <div className="mb-4">
          <label className="smc-form-label" htmlFor="smc-comments">
            Comments
          </label>
          <textarea
            id="smc-comments"
            name="comments"
            className="form-control smc-form-control smc-form-textarea"
            rows={3}
            placeholder="Optional"
            autoComplete="off"
            value={formData.comments}
            onChange={handleChange}
          />
        </div>

        <div className="d-flex justify-content-end">
          <button type="submit" className="btn smc-form-btn" disabled={loading}>
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
      </form>
    </div>
  );
}
