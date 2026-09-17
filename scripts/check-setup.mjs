#!/usr/bin/env node

/**
 * Validates environment configuration for Pho Ta website deployment.
 * Run: npm run check-setup
 */

const checks = [
  {
    name: "Supabase URL",
    key: "NEXT_PUBLIC_SUPABASE_URL",
    required: "production",
  },
  {
    name: "Supabase publishable key",
    key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    required: "production",
  },
  {
    name: "Supabase service role key",
    key: "SUPABASE_SERVICE_ROLE_KEY",
    required: "recommended",
  },
  { name: "Resend API key", key: "RESEND_API_KEY", required: "production" },
  { name: "Email sender", key: "EMAIL_FROM", required: "recommended" },
  { name: "Twilio account SID", key: "TWILIO_ACCOUNT_SID", required: "production" },
  { name: "Twilio auth token", key: "TWILIO_AUTH_TOKEN", required: "production" },
  { name: "Twilio phone number", key: "TWILIO_PHONE_NUMBER", required: "production" },
  { name: "Admin password", key: "ADMIN_PASSWORD", required: "production" },
  { name: "Cron secret", key: "CRON_SECRET", required: "production" },
];

const isProd = process.env.NODE_ENV === "production";
let hasErrors = false;
let hasWarnings = false;

console.log("\nPho Ta — environment check\n");

for (const check of checks) {
  const value = process.env[check.key];
  const set = Boolean(value && value.trim());

  if (!set) {
    if (check.required === "production" && isProd) {
      console.log(`✗ ${check.name} (${check.key}) — REQUIRED for production`);
      hasErrors = true;
    } else if (check.required === "production") {
      console.log(`○ ${check.name} (${check.key}) — not set (needed for production)`);
      hasWarnings = true;
    } else {
      console.log(`○ ${check.name} (${check.key}) — not set (recommended)`);
    }
  } else if (check.key === "ADMIN_PASSWORD" && value === "123456") {
    console.log(`⚠ ${check.name} — still using default dev password`);
    hasWarnings = true;
  } else {
    console.log(`✓ ${check.name}`);
  }
}

console.log("\n---\n");

if (hasErrors) {
  console.log("Fix required variables before deploying to production.\n");
  process.exit(1);
}

if (hasWarnings) {
  console.log("Setup incomplete but OK for local development.");
  console.log("Copy .env.example → .env.local and fill in values before going live.\n");
} else {
  console.log("All services configured.\n");
}
