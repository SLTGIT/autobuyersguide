/**
 * POSTs the same JSON body the browser used to send directly to WordPress.
 * Runs on the Next.js server (no browser CORS).
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

  const base = raw.replace(/\/$/, "");
  const url = `${base}/custom/v1/submit-lead`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
