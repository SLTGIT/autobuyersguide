"use client";

export type SubmitLeadResponse = {
  success: boolean;
  message?: string;
};

/**
 * POSTs lead payload to the Next.js API route (/api/leads).
 * The server verifies reCAPTCHA, emails LEADS_TO_EMAIL, and forwards to WordPress with the secret token.
 */
export async function submitLead(
  body: Record<string, unknown>,
): Promise<SubmitLeadResponse> {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data: SubmitLeadResponse = {
    success: false,
    message: "Could not read server response.",
  };
  try {
    data = (await res.json()) as SubmitLeadResponse;
  } catch {
    return data;
  }

  if (!res.ok && !data.message) {
    return {
      success: false,
      message: `Something went wrong (${res.status}). Please try again.`,
    };
  }

  return data;
}
