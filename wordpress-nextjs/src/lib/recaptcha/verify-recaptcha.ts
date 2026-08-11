type VerifyResult = {
  ok: boolean;
  message?: string;
};

type GoogleVerifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export async function verifyRecaptchaToken(
  token: string,
  remoteIp?: string,
): Promise<VerifyResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  if (!secret) {
    return {
      ok: false,
      message: "reCAPTCHA is not configured on server.",
    };
  }

  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", token);
  if (remoteIp) params.append("remoteip", remoteIp);

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        ok: false,
        message: "Could not verify reCAPTCHA. Please try again.",
      };
    }

    const data = (await res.json()) as GoogleVerifyResponse;
    if (data.success === true) return { ok: true };

    return {
      ok: false,
      message: "reCAPTCHA validation failed. Please try again.",
    };
  } catch {
    return {
      ok: false,
      message: "Could not verify reCAPTCHA. Please try again.",
    };
  }
}
