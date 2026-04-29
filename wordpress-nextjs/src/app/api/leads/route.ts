import { NextRequest, NextResponse } from "next/server";
import { forwardLeadToWordpress } from "@/lib/leads/forward-lead-to-wordpress";
import { sendLeadEmail } from "@/lib/leads/send-lead-email";

export const runtime = "nodejs";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * POST /api/leads
 * Accepts the same JSON shape used by site forms:
 * - sends email (LEADS_TO_EMAIL)
 * - forwards the same payload to WordPress REST `custom/v1/submit-lead`
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

  if (!isNonEmptyString(body.firstName) || !isNonEmptyString(body.lastName)) {
    return NextResponse.json(
      { success: false, message: "First name and last name are required." },
      { status: 400 },
    );
  }

  if (!isNonEmptyString(body.phone)) {
    return NextResponse.json(
      { success: false, message: "Phone is required." },
      { status: 400 },
    );
  }

  try {
    await Promise.all([sendLeadEmail(body), forwardLeadToWordpress(body)]);
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
