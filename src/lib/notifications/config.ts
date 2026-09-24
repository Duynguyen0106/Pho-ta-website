/**
 * Email configuration — Resend API or SMTP (Gmail, Google Workspace, etc.).
 *
 * Resend: RESEND_API_KEY + EMAIL_FROM (domain must be verified for guest mail).
 * SMTP:   SMTP_HOST, SMTP_USER, SMTP_PASS + EMAIL_FROM
 *
 * Set EMAIL_PROVIDER=resend|smtp to force a provider; otherwise SMTP wins if
 * SMTP_HOST is set, else Resend if RESEND_API_KEY is set.
 */
export const DEFAULT_STAFF_NOTIFICATION_EMAIL = "v.tran64@yahoo.com.uk";

export type EmailProvider = "resend" | "smtp" | "none";

export function resolveResendApiKey(): string | null {
  const key = process.env.RESEND_API_KEY?.trim();
  return key || null;
}

export function resolveEmailFrom(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    "Pho Ta <onboarding@resend.dev>"
  );
}

export function isUsingResendTestDomain(): boolean {
  return resolveEmailFrom().includes("@resend.dev");
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
}

export function resolveEmailProvider(): EmailProvider {
  const explicit = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (explicit === "smtp") {
    return isSmtpConfigured() ? "smtp" : "none";
  }
  if (explicit === "resend") {
    return resolveResendApiKey() ? "resend" : "none";
  }
  if (isSmtpConfigured()) return "smtp";
  if (resolveResendApiKey()) return "resend";
  return "none";
}

export function isEmailConfigured(): boolean {
  return resolveEmailProvider() !== "none";
}

/** Guest emails blocked only when using Resend's unverified test domain. */
export function shouldSkipGuestEmail(): boolean {
  return (
    resolveEmailProvider() === "resend" && isUsingResendTestDomain()
  );
}

export function resolveStaffNotificationEmail(): string {
  return (
    process.env.STAFF_NOTIFICATION_EMAIL?.trim() ||
    DEFAULT_STAFF_NOTIFICATION_EMAIL
  );
}

export function resolveSmtpConfig() {
  const port = parseInt(process.env.SMTP_PORT?.trim() || "587", 10);
  const secure =
    process.env.SMTP_SECURE?.trim() === "true" || port === 465;

  return {
    host: process.env.SMTP_HOST!.trim(),
    port,
    secure,
    user: process.env.SMTP_USER!.trim(),
    pass: process.env.SMTP_PASS!.trim(),
  };
}
