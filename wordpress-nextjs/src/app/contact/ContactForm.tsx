"use client";

import { getAPIUrl } from "@/lib/wordpress";
import { useState, ChangeEvent, FormEvent, useCallback } from "react";

type FormDataType = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  enquiryType: string;
  message: string;
};

const ENQUIRY_OPTIONS: string[] = [
  "General Enquiry",
  "Service Enquiry",
  "Parts Enquiry",
  "New Vehicle Enquiry",
  "Used Vehicle Enquiry",
  "Fleet Enquiry",
  "Finance Enquiry",
  "Careers Enquiry",
  "Sell My Car Enquiry",
];

export default function ContactForm() {
  const [formData, setFormData] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    enquiryType: "",
    message: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    if (status !== "idle") {
      setStatus("idle");
      setStatusMessage("");
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setStatusMessage("");

    try {
      const res = await fetch(getAPIUrl("/custom/v1/submit-lead"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          message: formData.message,
          form_type: formData.enquiryType,
          budget: "",
          item: {
            tag: "Auto Buyers Guide",
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setStatusMessage(
          "Thank you — your enquiry was sent successfully. We will get back to you soon.",
        );
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          enquiryType: "",
          message: "",
        });
      } else {
        setStatus("error");
        setStatusMessage(
          typeof data.message === "string" && data.message
            ? data.message
            : "Something went wrong. Please try again in a moment.",
        );
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setStatusMessage(
        "We could not send your enquiry. Check your connection and try again.",
      );
    }

    setLoading(false);
  };

  const dismissSuccess = useCallback(() => {
    setStatus("idle");
    setStatusMessage("");
  }, []);

  return (
    <div className="cs-contact-form">
      <div className="cs-panel p-4 p-lg-5 shadow-sm">
        <h2 className="cs-contact-form__title mb-0">Send an enquiry</h2>
        <p className="text-secondary mt-2 mb-4">
          Fill in the form below and our team will respond as soon as we can.
        </p>

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

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label
                className="cs-contact-form__label"
                htmlFor="contact-firstName"
              >
                First name
                <span className="cs-contact-form__req" aria-hidden>
                  *
                </span>
              </label>
              <input
                id="contact-firstName"
                name="firstName"
                type="text"
                className="form-control cs-contact-form__control"
                required
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label
                className="cs-contact-form__label"
                htmlFor="contact-lastName"
              >
                Last name
                <span className="cs-contact-form__req" aria-hidden>
                  *
                </span>
              </label>
              <input
                id="contact-lastName"
                name="lastName"
                type="text"
                className="form-control cs-contact-form__control"
                required
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="cs-contact-form__label" htmlFor="contact-email">
              Email
              <span className="cs-contact-form__req" aria-hidden>
                *
              </span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              className="form-control cs-contact-form__control"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="cs-contact-form__label" htmlFor="contact-phone">
              Phone number
              <span className="cs-contact-form__req" aria-hidden>
                *
              </span>
            </label>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              className="form-control cs-contact-form__control"
              required
              pattern="[0-9]{10}"
              maxLength={10}
              autoComplete="tel"
              placeholder="10 digits, no spaces"
              value={formData.phone}
              onChange={handleChange}
            />
            <p className="form-text text-muted small mb-0 mt-1">
              Australian mobile or landline: 10 digits only.
            </p>
          </div>

          <div className="mb-3">
            <label
              className="cs-contact-form__label"
              htmlFor="contact-enquiryType"
            >
              Enquiry type
              <span className="cs-contact-form__req" aria-hidden>
                *
              </span>
            </label>
            <select
              id="contact-enquiryType"
              name="enquiryType"
              className="form-select cs-contact-form__control"
              required
              value={formData.enquiryType}
              onChange={handleChange}
            >
              <option value="">Select an option</option>
              {ENQUIRY_OPTIONS.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="cs-contact-form__label" htmlFor="contact-message">
              Comments
              <span className="cs-contact-form__req" aria-hidden>
                *
              </span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              className="form-control cs-contact-form__control cs-contact-form__textarea"
              rows={5}
              required
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn w-100 cs-contact-form__submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden
                />
                Submitting…
              </>
            ) : (
              "Submit enquiry"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
