"use client";

import { useActionState, useState, type FormEvent } from "react";
import type { SellMyCarFormState } from "./actions";
import { submitSellMyCarValuation } from "./actions";

const initialState: SellMyCarFormState = {};

export default function SellMyCarValuationForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [state, formAction, pending] = useActionState(
    submitSellMyCarValuation,
    initialState,
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  function continueToVehicle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setStep(2);
  }

  if (state?.ok) {
    return (
      <div
        className="smc-form-card smc-form-card--done"
        role="status"
      >
        <div className="alert alert-success mb-0">{state.message}</div>
      </div>
    );
  }

  return (
    <div className="smc-form-card">
      <div className="smc-form-progress-wrap">
        <div
          className="smc-form-progress"
          style={{ width: step === 1 ? "50%" : "100%" }}
          aria-hidden
        />
      </div>
      <p className="smc-form-step-label text-end text-secondary small mb-3 mb-md-4">
        Step {step} of 2
      </p>

      {state?.message && !state.ok ? (
        <div className="alert alert-danger mb-4" role="alert">
          {state.message}
        </div>
      ) : null}

      {step === 1 ? (
        <form onSubmit={continueToVehicle} noValidate>
          <h2 className="smc-form-title mb-4">
            Enquire now for your vehicle price.
          </h2>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="smc-form-label" htmlFor="smc-firstName">
                First Name<span className="smc-form-req">*</span>
              </label>
              <input
                id="smc-firstName"
                name="firstNameDraft"
                type="text"
                className="form-control smc-form-control"
                placeholder="First Name"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(ev) => setFirstName(ev.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="smc-form-label" htmlFor="smc-lastName">
                Last Name<span className="smc-form-req">*</span>
              </label>
              <input
                id="smc-lastName"
                name="lastNameDraft"
                type="text"
                className="form-control smc-form-control"
                placeholder="Last Name"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(ev) => setLastName(ev.target.value)}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="smc-form-label" htmlFor="smc-email">
              Email Address<span className="smc-form-req">*</span>
            </label>
            <input
              id="smc-email"
              name="emailDraft"
              type="email"
              className="form-control smc-form-control"
              placeholder="Email"
              required
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="smc-form-label" htmlFor="smc-mobile">
              Mobile Number<span className="smc-form-req">*</span>
            </label>
            <input
              id="smc-mobile"
              name="mobileDraft"
              type="tel"
              className="form-control smc-form-control"
              placeholder="Mobile"
              required
              autoComplete="tel"
              value={mobile}
              onChange={(ev) => setMobile(ev.target.value)}
            />
          </div>
          <div className="d-flex justify-content-end">
            <button type="submit" className="btn smc-form-btn">
              Continue
            </button>
          </div>
        </form>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="firstName" value={firstName} />
          <input type="hidden" name="lastName" value={lastName} />
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="mobile" value={mobile} />

          <h2 className="smc-form-title mb-4">
            Tell us about your vehicle
          </h2>
          <p className="text-secondary small mb-4">
            {firstName} {lastName} · {email} · {mobile}
            <button
              type="button"
              className="btn btn-link btn-sm p-0 ms-2 smc-form-back-inline"
              onClick={() => setStep(1)}
            >
              Edit
            </button>
          </p>

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
              />
            </div>
          </div>
          <div className="row g-3 mb-3">
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
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="smc-form-label" htmlFor="smc-extra">
              Anything else we should know?
            </label>
            <textarea
              id="smc-extra"
              name="extraComments"
              className="form-control smc-form-control smc-form-textarea"
              rows={3}
              placeholder="Optional"
            />
          </div>
          <div className="d-flex flex-wrap justify-content-between gap-2 align-items-center">
            <button
              type="button"
              className="btn btn-link smc-form-back px-0"
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
            <button
              type="submit"
              className="btn smc-form-btn"
              disabled={pending}
            >
              {pending ? "Sending…" : "Enquire now"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
