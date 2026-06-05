/**
 * POSTs lead payload to WordPress REST `custom/v1/submit-lead`.
 * Runs on the Next.js server only — Bearer token stays in LEAD_API_SECRET (never sent to the browser).
 */
export async function forwardLeadToWordpress(
  body: Record<string, unknown>,
): Promise<void> {
  const raw =
    process.env.WORDPRESS_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.trim();
  if (!raw) {
    throw new Error(
      "WordPress URL is not set. Add WORDPRESS_API_URL or NEXT_PUBLIC_WORDPRESS_API_URL.",
    );
  }

  const secret = process.env.LEAD_API_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "LEAD_API_SECRET is not set. Add it to your server environment (must match WordPress LEAD_API_SECRET).",
    );
  }

  const base = raw.replace(/\/$/, "");
  const url = `${base}/custom/v1/submit-lead`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  let data: { success?: boolean; message?: string } = {};
  try {
    data = (await res.json()) as { success?: boolean; message?: string };
  } catch {
    throw new Error(
      `WordPress lead API did not return JSON (HTTP ${res.status}).`,
    );
  }

  if (!res.ok || data.success !== true) {
    const msg =
      typeof data.message === "string" && data.message.trim()
        ? data.message.trim()
        : `WordPress lead API failed (HTTP ${res.status}).`;
    throw new Error(msg);
  }
}
