import { createHmac } from "crypto";

const WEAK_PASSWORDS = new Set(["123456", "password", "admin", "change-me"]);

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Staff dashboard password — env var preferred; fallback for local dev only. */
export function resolveAdminPassword(): string {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  if (fromEnv) {
    if (isProduction() && WEAK_PASSWORDS.has(fromEnv)) {
      throw new Error(
        "ADMIN_PASSWORD is too weak for production. Set a strong password in environment secrets.",
      );
    }
    return fromEnv;
  }

  if (isProduction()) {
    throw new Error(
      "ADMIN_PASSWORD is required in production. Set it in Cloudflare/Vercel secrets.",
    );
  }

  return "123456";
}

/** Secret for signing admin session cookies (never sent to the client as plaintext password). */
export function resolveSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret && secret.length >= 16) {
    return secret;
  }

  if (isProduction()) {
    const pwd = process.env.ADMIN_PASSWORD?.trim();
    if (pwd && pwd.length >= 12 && !WEAK_PASSWORDS.has(pwd)) {
      return `derived-session:${pwd.length}:${createHmacSha256(pwd)}`;
    }
    throw new Error(
      "Set ADMIN_SESSION_SECRET (16+ chars) or a strong ADMIN_PASSWORD in production.",
    );
  }

  return resolveAdminPassword() + ":local-dev-session";
}

function createHmacSha256(value: string): string {
  return createHmac("sha256", "pho-ta-admin-session-v1")
    .update(value)
    .digest("hex");
}