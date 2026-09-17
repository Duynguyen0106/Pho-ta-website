/**
 * Resend email configuration.
 * Set RESEND_API_KEY and EMAIL_FROM in Vercel → Project Settings → Environment Variables.
 * Customer emails require photarestaurants.com domain verification at resend.com/domains.
 * Until verified, use onboarding@resend.dev — Resend only delivers to the account owner inbox.
 */
export const RESEND_OWNER_EMAIL = "duydichdanh@gmail.com";

export function resolveResendApiKey(): string | null {
  const key = process.env.RESEND_API_KEY?.trim();
  return key || null;
}

export function resolveEmailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || "Pho Ta <onboarding@resend.dev>";
}

export function isUsingResendTestDomain(): boolean {
  return resolveEmailFrom().includes("@resend.dev");
}
