import nodemailer from "nodemailer";
import {
  buildLeadEmailHtml,
  formatLeadEmailPlainText,
} from "@/lib/leads/format-lead-email-content";

const DEFAULT_LEADS_TO = "john@statewideautogroup.com.au";

type MailConfig =
  | { ok: true; transporter: nodemailer.Transporter; from: string; to: string }
  | { ok: false; error: string };

function inferSmtpHostForUser(mailUser: string): string | undefined {
  const lower = mailUser.toLowerCase();
  if (lower.endsWith("@gmail.com") || lower.endsWith("@googlemail.com")) {
    return "smtp.gmail.com";
  }
  return undefined;
}

function isGmailMailbox(email: string): boolean {
  const lower = email.toLowerCase();
  return lower.endsWith("@gmail.com") || lower.endsWith("@googlemail.com");
}

/** Google shows app passwords in groups; pasted spaces break auth. */
function normalizeSmtpPassword(pass: string, stripSpaces: boolean): string {
  const t = pass.trim();
  return stripSpaces ? t.replace(/\s+/g, "") : t;
}

export function getLeadMailerConfig(): MailConfig {
  const portRaw = process.env.SMTP_PORT?.trim() || "587";
  const user =
    process.env.SMTP_USER?.trim() || process.env.EMAIL_USER?.trim() || "";
  const rawPass =
    process.env.SMTP_PASS?.trim() || process.env.EMAIL_PASS?.trim() || "";
  const host =
    process.env.SMTP_HOST?.trim() || inferSmtpHostForUser(user) || "";
  const from =
    process.env.LEADS_FROM_EMAIL?.trim() ||
    process.env.EMAIL_USER?.trim() ||
    "";
  const to = process.env.LEADS_TO_EMAIL?.trim() || DEFAULT_LEADS_TO;

  if (!host || !user || !rawPass) {
    return {
      ok: false,
      error:
        "Email is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS — or for Gmail testing use EMAIL_USER, EMAIL_PASS (and optionally SMTP_HOST=smtp.gmail.com).",
    };
  }
  if (!from) {
    return {
      ok: false,
      error:
        "Set LEADS_FROM_EMAIL or EMAIL_USER as the outgoing sender (must match what your SMTP provider allows).",
    };
  }

  const gmailMailbox = isGmailMailbox(user);
  const pass = normalizeSmtpPassword(rawPass, gmailMailbox);

  // Gmail: use built-in service profile (correct TLS / ports for current Google).
  if (gmailMailbox) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    return { ok: true, transporter, from, to };
  }

  const port = Number.parseInt(portRaw, 10);
  const secure =
    process.env.SMTP_SECURE === "true" ||
    (!Number.isNaN(port) && port === 465);

  const transporter = nodemailer.createTransport({
    host,
    port: Number.isNaN(port) ? 587 : port,
    secure,
    requireTLS: !secure && port === 587,
    auth: { user, pass },
  });

  return { ok: true, transporter, from, to };
}

export async function sendLeadEmail(
  payload: Record<string, unknown>,
): Promise<void> {
  const cfg = getLeadMailerConfig();
  if (!cfg.ok) {
    throw new Error(cfg.error);
  }

  const firstName = String(payload.firstName ?? "").trim();
  const lastName = String(payload.lastName ?? "").trim();
  const formType = String(payload.form_type ?? "Website lead").trim();
  const subject = `[Lead] ${formType} — ${firstName} ${lastName}`.slice(0, 250);

  const visitorEmail = String(payload.email ?? "").trim();
  const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorEmail)
    ? visitorEmail
    : undefined;

  try {
    await cfg.transporter.sendMail({
      from: `"Car Sales Brisbane" <${cfg.from}>`,
      to: cfg.to,
      replyTo: replyTo || undefined,
      subject,
      text: formatLeadEmailPlainText(payload),
      html: buildLeadEmailHtml(payload),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/535|BadCredentials|Invalid login/i.test(msg)) {
      const hint = isGmailMailbox(cfg.from)
        ? " Gmail: you must use an App Password (Google Account → Security → 2-Step Verification → App passwords), not your normal Gmail password. Turn on 2-Step Verification first. Paste the 16-character password with no spaces in EMAIL_PASS."
        : "";
      throw new Error(`${msg}${hint}`);
    }
    throw err;
  }
}
