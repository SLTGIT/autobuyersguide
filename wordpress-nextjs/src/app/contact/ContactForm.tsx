"use client";

import { useActionState } from "react";
import type { ContactFormState } from "./actions";
import { submitContactForm } from "./actions";

const ENQUIRY_OPTIONS = [
  "General Enquiry",
  "Service Enquiry",
  "Parts Enquiry",
  "New Vehicle Enquiry",
  "Used Vehicle Enquiry",
  "Fleet Enquiry",
  "Finance Enquiry",
  "Careers Enquiry",
  "Sell My Car Enquiry",
] as const;

const initialState: ContactFormState = {};

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactForm,
    initialState,
  );

  return (
    <form className="cs-contact-form" action={formAction}>
      <h2 className="cs-contact-form__title">Contact Us</h2>

      {state?.message ? (
        <div
          className={`alert ${state.ok ? "alert-success" : "alert-danger"} mb-4`}
          role="status"
        >
          {state.message}
        </div>
      ) : null}

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="cs-contact-form__label" htmlFor="contact-firstName">
            First Name<span className="cs-contact-form__req">*</span>
          </label>
          <input
            id="contact-firstName"
            name="firstName"
            type="text"
            className="form-control cs-contact-form__control"
            placeholder=""
            required
            autoComplete="given-name"
          />
        </div>
        <div className="col-md-6">
          <label className="cs-contact-form__label" htmlFor="contact-lastName">
            Last Name<span className="cs-contact-form__req">*</span>
          </label>
          <input
            id="contact-lastName"
            name="lastName"
            type="text"
            className="form-control cs-contact-form__control"
            placeholder=""
            required
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="cs-contact-form__label" htmlFor="contact-email">
          Email Address<span className="cs-contact-form__req">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          className="form-control cs-contact-form__control"
          placeholder=""
          required
          autoComplete="email"
        />
      </div>

      <div className="mb-3">
        <label className="cs-contact-form__label" htmlFor="contact-mobile">
          Mobile Number<span className="cs-contact-form__req">*</span>
        </label>
        <input
          id="contact-mobile"
          name="mobile"
          type="tel"
          className="form-control cs-contact-form__control"
          placeholder=""
          required
          autoComplete="tel"
        />
      </div>

      <div className="mb-3">
        <label className="cs-contact-form__label" htmlFor="contact-comments">
          Comments<span className="cs-contact-form__req">*</span>
        </label>
        <textarea
          id="contact-comments"
          name="comments"
          className="form-control cs-contact-form__control cs-contact-form__textarea"
          rows={5}
          placeholder="Message"
          required
        />
      </div>

      <div className="mb-3">
        <label className="visually-hidden" htmlFor="contact-enquiryType">
          Enquiry type
        </label>
        <select
          id="contact-enquiryType"
          name="enquiryType"
          className="form-select cs-contact-form__control"
          defaultValue={ENQUIRY_OPTIONS[0]}
        >
          {ENQUIRY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="form-check mb-4 cs-contact-form__subscribe">
        <input
          className="form-check-input"
          type="checkbox"
          name="subscribe"
          id="contact-subscribe"
        />
        <label className="form-check-label" htmlFor="contact-subscribe">
          Yes, I would like to subscribe to receive latest offers &amp; product
          updates.
        </label>
      </div>

      {/* <div className="cs-altcha-panel mb-4">
        <div className="form-check cs-altcha-panel__main mb-0">
          <input
            className="form-check-input cs-altcha-panel__checkbox"
            type="checkbox"
            name="notRobot"
            id="contact-not-robot"
            required
          />
          <label className="form-check-label" htmlFor="contact-not-robot">
            I&apos;m not a robot
          </label>
        </div>
        <div className="cs-altcha-panel__brand">
          <span className="cs-altcha-panel__refresh" aria-hidden="true">
            <i className="bi bi-arrow-clockwise"></i>
          </span>
          <span className="cs-altcha-panel__protected">Protected by ALTCHA</span>
        </div>
      </div> */}

      <button
        type="submit"
        className="btn cs-contact-form__submit w-100"
        disabled={pending}
      >
        {pending ? "Sending…" : "Enquire Now"}
      </button>
    </form>
  );
}
