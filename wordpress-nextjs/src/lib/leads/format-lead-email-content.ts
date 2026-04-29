/**
 * Human-readable lead email bodies (HTML + plain text) with escaped user content.
 */

const LABELS: Record<string, string> = {
  form_type: "Enquiry type",
  date: "Submitted",
  firstName: "First name",
  lastName: "Last name",
  phone: "Phone",
  email: "Email",
  message: "Message",
  budget: "Budget",
  dob: "Date of birth",
  driverLicence: "Driver licence",
  address: "Address",
  subscribe: "Email updates / marketing",
  kms: "Odometer (km)",
  preferredDate: "Preferred date",
  preferredTime: "Preferred time",
  item: "Vehicle / listing",
};

const ITEM_LABELS: Record<string, string> = {
  image: "Photo",
  make: "Make",
  model: "Model",
  year: "Year",
  stock: "Stock number",
  rego: "Registration",
  status: "Status",
  tag: "Dealership",
  url: "Listing URL",
};

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function labelForKey(key: string, item = false): string {
  const map = item ? ITEM_LABELS : LABELS;
  return map[key] ?? key.replace(/_/g, " ");
}

/** Allow http(s) for listing images (inventory CDNs often use http). */
function safeImageSrc(raw: string): string | null {
  const u = raw.trim();
  if (!/^https?:\/\//i.test(u)) return null;
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return u;
  } catch {
    return null;
  }
}

function formatAuPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10 && d.startsWith("0")) {
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }
  return raw;
}

function formatFieldValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value !== "string" && typeof value !== "number") {
    return String(value);
  }
  const str = String(value).trim();
  if (!str) return "";

  if (key === "date" && /^\d{4}-\d{2}-\d{2}T/.test(str)) {
    const d = new Date(str);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString("en-AU", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
  }

  if (
    (key === "preferredDate" || key === "dob") &&
    /^\d{4}-\d{2}-\d{2}$/.test(str)
  ) {
    const d = new Date(`${str}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-AU", { dateStyle: "long" });
    }
  }

  if (key === "phone") {
    return formatAuPhone(str);
  }

  if (key === "budget" && /^\d+$/.test(str)) {
    const n = Number(str);
    if (!Number.isNaN(n)) return `$${n.toLocaleString("en-AU")}`;
  }

  if (key === "kms") {
    const n =
      typeof value === "number"
        ? value
        : Number.parseInt(String(value).replace(/\D/g, ""), 10);
    if (Number.isFinite(n) && n > 0) {
      return `${n.toLocaleString("en-AU")} km`;
    }
  }

  return str;
}

const ORDERED_TOP_KEYS = [
  "form_type",
  "date",
  "firstName",
  "lastName",
  "phone",
  "email",
  "message",
  "budget",
  "dob",
  "driverLicence",
  "address",
  "subscribe",
  "kms",
  "preferredDate",
  "preferredTime",
] as const;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function itemRows(item: Record<string, unknown>): { key: string; value: string }[] {
  const order = [
    "make",
    "model",
    "year",
    "stock",
    "rego",
    "status",
    "tag",
    "url",
  ];
  const rows: { key: string; value: string }[] = [];
  const seen = new Set<string>(["image"]);

  for (const k of order) {
    if (!(k in item)) continue;
    seen.add(k);
    const formatted = formatFieldValue(k, item[k]);
    if (!formatted) continue;
    rows.push({ key: k, value: formatted });
  }

  for (const [k, v] of Object.entries(item)) {
    if (seen.has(k)) continue;
    const formatted = formatFieldValue(k, v);
    if (formatted) rows.push({ key: k, value: formatted });
  }

  return rows;
}

function collectDetailRows(
  payload: Record<string, unknown>,
): { key: string; label: string; value: string }[] {
  const rows: { key: string; label: string; value: string }[] = [];
  /** Skip in follow-up pass (message has its own block in the template). */
  const seen = new Set<string>(["item", "message"]);

  const messageStr =
    typeof payload.message === "string" ? payload.message.trim() : "";

  for (const key of ORDERED_TOP_KEYS) {
    if (!(key in payload) || key === "message") continue;
    const value = formatFieldValue(key, payload[key]);
    seen.add(key);
    if (!value) continue;
    if (
      (key === "preferredDate" || key === "preferredTime") &&
      messageStr &&
      messageStr.includes(value)
    ) {
      continue;
    }
    rows.push({ key, label: labelForKey(key), value });
  }

  for (const [key, val] of Object.entries(payload)) {
    if (seen.has(key)) continue;
    const value = formatFieldValue(key, val);
    if (!value) continue;
    rows.push({ key, label: labelForKey(key), value });
  }

  return rows;
}

export function formatLeadEmailPlainText(payload: Record<string, unknown>): string {
  const lines: string[] = [
    "Car Sales Brisbane — website lead",
    "=================================",
    "",
  ];

  const formType = formatFieldValue("form_type", payload.form_type) || "Enquiry";
  const submitted = formatFieldValue("date", payload.date);
  lines.push(`Enquiry type: ${formType}`);
  if (submitted) lines.push(`Submitted: ${submitted}`);
  lines.push("", "— Contact —", "");

  const contactKeys = ["firstName", "lastName", "phone", "email"] as const;
  for (const key of contactKeys) {
    if (!(key in payload)) continue;
    const v = formatFieldValue(key, payload[key]);
    if (!v) continue;
    lines.push(`${labelForKey(key)}: ${v}`);
  }

  const message = formatFieldValue("message", payload.message);
  if (message) {
    lines.push("", "— Message —", "", message);
  }

  const item = payload.item;
  if (isPlainObject(item)) {
    lines.push("", "— Vehicle / listing —", "");
    for (const { key, value } of itemRows(item)) {
      lines.push(`${labelForKey(key, true)}: ${value}`);
    }
    const img = item.image;
    if (typeof img === "string" && safeImageSrc(img)) {
      lines.push(`${labelForKey("image", true)}: ${img.trim()}`);
    }
  }

  const detailRows = collectDetailRows(payload).filter(
    (r) => !contactKeys.includes(r.key as (typeof contactKeys)[number]),
  );
  const skip = new Set([
    "form_type",
    "date",
    "firstName",
    "lastName",
    "phone",
    "email",
    "message",
    "item",
  ]);
  const extras = detailRows.filter((r) => !skip.has(r.key));
  if (extras.length) {
    lines.push("", "— Other details —", "");
    for (const { label, value } of extras) {
      lines.push(`${label}: ${value}`);
    }
  }

  return lines.join("\n");
}

export function buildLeadEmailHtml(payload: Record<string, unknown>): string {
  const accent = "#0d6efd";
  const text = "#0f172a";
  const muted = "#64748b";
  const border = "#e2e8f0";
  const bg = "#f8fafc";

  const formType =
    escapeHtml(formatFieldValue("form_type", payload.form_type) || "Website enquiry");
  const submitted = formatFieldValue("date", payload.date);
  const submittedHtml = submitted
    ? escapeHtml(submitted)
    : escapeHtml(new Date().toLocaleString("en-AU"));

  const contactRows: string[] = [];
  for (const key of ["firstName", "lastName", "phone", "email"] as const) {
    if (!(key in payload)) continue;
    const v = formatFieldValue(key, payload[key]);
    if (!v) continue;
    const label = escapeHtml(labelForKey(key));
    const val = escapeHtml(v);
    contactRows.push(
      `<tr><td style="padding:10px 16px;border-bottom:1px solid ${border};color:${muted};width:140px;font-size:14px;">${label}</td><td style="padding:10px 16px;border-bottom:1px solid ${border};color:${text};font-size:15px;font-weight:600;">${val}</td></tr>`,
    );
  }

  const message = formatFieldValue("message", payload.message);
  const messageBlock = message
    ? `<tr><td colspan="2" style="padding:20px 16px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${muted};font-weight:600;">Message</p>
        <div style="white-space:pre-wrap;font-size:15px;line-height:1.55;color:${text};background:${bg};padding:16px;border-radius:8px;border:1px solid ${border};">${escapeHtml(message)}</div>
      </td></tr>`
    : "";

  let vehicleBlock = "";
  const item = payload.item;
  if (isPlainObject(item)) {
    const imgRaw = typeof item.image === "string" ? item.image : "";
    const imgSrc = imgRaw ? safeImageSrc(imgRaw) : null;
    const imgHtml = imgSrc
      ? `<img src="${escapeHtml(imgSrc)}" alt="" width="280" style="display:block;max-width:100%;height:auto;border-radius:8px;border:1px solid ${border};margin-bottom:16px;" />`
      : "";

    const specRows = itemRows(item)
      .filter((r) => r.key !== "url")
      .map(
        (r) =>
          `<tr><td style="padding:8px 0;color:${muted};font-size:14px;width:38%;">${escapeHtml(labelForKey(r.key, true))}</td><td style="padding:8px 0;color:${text};font-size:15px;font-weight:600;">${escapeHtml(r.value)}</td></tr>`,
      )
      .join("");

    const urlRaw = typeof item.url === "string" ? item.url.trim() : "";
    const urlSafe = urlRaw ? safeImageSrc(urlRaw) : null;
    const cta = urlSafe
      ? `<p style="margin:16px 0 0;"><a href="${escapeHtml(urlSafe)}" style="display:inline-block;background:${accent};color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:600;">View listing</a></p><p style="margin:8px 0 0;font-size:13px;word-break:break-all;"><a href="${escapeHtml(urlSafe)}" style="color:${accent};">${escapeHtml(urlSafe)}</a></p>`
      : "";

    vehicleBlock = `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border:1px solid ${border};border-radius:12px;overflow:hidden;">
        <tr><td style="padding:20px 20px 16px;background:#ffffff;">
          <p style="margin:0 0 16px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${muted};font-weight:600;">Vehicle</p>
          ${imgHtml}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${specRows}</table>
          ${cta}
        </td></tr>
      </table>`;
  }

  const skip = new Set([
    "form_type",
    "date",
    "firstName",
    "lastName",
    "phone",
    "email",
    "message",
    "item",
  ]);
  const extras = collectDetailRows(payload).filter((r) => !skip.has(r.key));
  let extrasBlock = "";
  if (extras.length) {
    const extraRows = extras
      .map(
        (r) =>
          `<tr><td style="padding:10px 16px;border-bottom:1px solid ${border};color:${muted};width:140px;font-size:14px;">${escapeHtml(r.label)}</td><td style="padding:10px 16px;border-bottom:1px solid ${border};color:${text};font-size:15px;">${escapeHtml(r.value)}</td></tr>`,
      )
      .join("");
    extrasBlock = `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border:1px solid ${border};border-radius:12px;overflow:hidden;">
        <tr><td style="padding:16px 20px;background:${bg};border-bottom:1px solid ${border};">
          <p style="margin:0;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${muted};font-weight:600;">Additional details</p>
        </td></tr>
        <tr><td style="padding:0;background:#ffffff;">${extraRows}</td></tr>
      </table>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:24px 12px;background:${bg};font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;">
    <tr><td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid ${border};overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.06);">
        <tr><td style="padding:24px 24px 20px;background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;">Car Sales Brisbane</p>
          <h1 style="margin:0;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">New website lead</h1>
          <p style="margin:12px 0 0;font-size:15px;color:#e2e8f0;"><strong style="color:#ffffff;">${formType}</strong></p>
          <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">Submitted ${submittedHtml}</p>
        </td></tr>
        <tr><td style="padding:0 0 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">
            ${contactRows.join("")}
            ${messageBlock}
          </table>
          ${vehicleBlock}
          ${extrasBlock}
        </td></tr>
        <tr><td style="padding:16px 24px 20px;border-top:1px solid ${border};background:${bg};">
          <p style="margin:0;font-size:12px;color:${muted};line-height:1.5;">This message was generated from the enquiry form on your website. Reply to this email to contact the customer when their address is set as Reply-To.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
