import { NextRequest, NextResponse } from "next/server";
import { forwardLeadToWordpress } from "@/lib/leads/forward-lead-to-wordpress";
import { sendLeadEmail } from "@/lib/leads/send-lead-email";
import { verifyRecaptchaToken } from "@/lib/recaptcha/verify-recaptcha";

export const runtime = "nodejs";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * POST /api/leads
 * Accepts the same JSON shape used by site forms:
 * - sends email (LEADS_TO_EMAIL)
 * - forwards the same payload to WordPress REST `custom/v1/submit-lead` (Bearer token from LEAD_API_SECRET)
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const recaptchaToken = String(body.recaptchaToken ?? "").trim();
  if (!recaptchaToken) {
    return NextResponse.json(
      { success: false, message: "Please complete the reCAPTCHA challenge." },
      { status: 400 },
    );
  }

  const remoteIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const recaptcha = await verifyRecaptchaToken(recaptchaToken, remoteIp);
  if (!recaptcha.ok) {
    return NextResponse.json(
      {
        success: false,
        message:
          recaptcha.message ??
          "Could not verify reCAPTCHA. Please refresh and try again.",
      },
      { status: 400 },
    );
  }

  const { recaptchaToken: _unusedRecaptchaToken, ...leadBody } = body;

  if (
    !isNonEmptyString(leadBody.firstName) ||
    !isNonEmptyString(leadBody.lastName)
  ) {
    return NextResponse.json(
      { success: false, message: "First name and last name are required." },
      { status: 400 },
    );
  }

  if (!isNonEmptyString(leadBody.phone)) {
    return NextResponse.json(
      { success: false, message: "Phone is required." },
      { status: 400 },
    );
  }

  try {
    await Promise.all([sendLeadEmail(leadBody), forwardLeadToWordpress(leadBody)]);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not send your enquiry.";
    console.error("[api/leads]", err);
    return NextResponse.json(
      { success: false, message },
      { status: 503 },
    );
  }

  return NextResponse.json({ success: true });
}
