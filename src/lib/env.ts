export type ServiceStatus = "configured" | "missing" | "dev_fallback";

export interface EnvStatus {
  nodeEnv: string;
  database: ServiceStatus;
  email: ServiceStatus;
  sms: ServiceStatus;
  admin: ServiceStatus;
  cron: ServiceStatus;
  productionReady: boolean;
  warnings: string[];
}

export function getEnvStatus(): EnvStatus {
  const warnings: string[] = [];

  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasEmail = Boolean(process.env.RESEND_API_KEY);
  const hasSms = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER,
  );
  const hasAdminPassword = Boolean(process.env.ADMIN_PASSWORD);
  const hasCronSecret = Boolean(process.env.CRON_SECRET);
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && !hasSupabase) {
    warnings.push("Supabase is not configured — bookings will not persist in production.");
  }
  if (isProd && hasSupabase && !hasServiceRole) {
    warnings.push(
      "Using publishable key only — add SUPABASE_SERVICE_ROLE_KEY for production, or ensure rls-policies.sql is applied.",
    );
  }
  if (isProd && !hasEmail) {
    warnings.push("Resend is not configured — confirmation emails will not be sent.");
  }
  if (isProd && !hasSms) {
    warnings.push("Twilio is not configured — SMS confirmations and reminders will not be sent.");
  }
  if (isProd && !hasAdminPassword) {
    warnings.push("ADMIN_PASSWORD is not set — using insecure default password.");
  }
  if (isProd && !hasCronSecret) {
    warnings.push("CRON_SECRET is not set — reminder endpoint is unprotected.");
  }
  if (isProd && process.env.ADMIN_PASSWORD === "phota-admin-dev") {
    warnings.push("Change ADMIN_PASSWORD from the default dev value.");
  }

  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    database: hasSupabase ? "configured" : "dev_fallback",
    email: hasEmail ? "configured" : "dev_fallback",
    sms: hasSms ? "configured" : "dev_fallback",
    admin: hasAdminPassword ? "configured" : "dev_fallback",
    cron: hasCronSecret ? "configured" : "missing",
    productionReady: isProd
      ? hasSupabase && hasEmail && hasSms && hasAdminPassword && hasCronSecret
      : true,
    warnings,
  };
}
