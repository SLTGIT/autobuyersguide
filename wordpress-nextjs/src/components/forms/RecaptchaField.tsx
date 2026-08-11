"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import type ReCAPTCHAType from "react-google-recaptcha";

const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), {
  ssr: false,
  loading: () => (
    <div aria-hidden style={{ minHeight: "78px" }} />
  ),
}) as typeof ReCAPTCHAType;

import { useClientMounted } from "@/hooks/useClientMounted";

type RecaptchaFieldProps = {
  token: string | null;
  onTokenChange: (token: string | null) => void;
  errorMessage?: string;
  className?: string;
};

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";

export default function RecaptchaField({
  token,
  onTokenChange,
  errorMessage,
  className,
}: RecaptchaFieldProps) {
  const mounted = useClientMounted();
  const captchaRef = useRef<ReCAPTCHAType>(null);
  const previousTokenRef = useRef<string | null>(token);

  useEffect(() => {
    // Reset the widget only when token transitions from set -> null (e.g. post-submit).
    if (previousTokenRef.current && !token) {
      captchaRef.current?.reset();
    }
    previousTokenRef.current = token;
  }, [token]);

  if (!SITE_KEY) {
    return (
      <p className="text-danger small mb-0" role="alert">
        reCAPTCHA is not configured. Add NEXT_PUBLIC_RECAPTCHA_SITE_KEY.
      </p>
    );
  }

  if (!mounted) {
    return (
      <div
        className={className}
        aria-hidden
        style={{ minHeight: "78px" }}
      />
    );
  }

  return (
    <div className={className}>
      <ReCAPTCHA
        ref={captchaRef}
        sitekey={SITE_KEY}
        onChange={(value) => onTokenChange(value)}
        onExpired={() => onTokenChange(null)}
        onErrored={() => onTokenChange(null)}
      />
      {errorMessage ? (
        <p className="text-danger small mb-0 mt-2" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
