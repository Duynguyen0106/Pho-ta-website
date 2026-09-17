#!/usr/bin/env node

import { readFileSync, existsSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  if (!existsSync(".env.local")) return;
  const lines = readFileSync(".env.local", "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1).replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase URL or key in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);
const { error } = await supabase.from("bookings").select("id").limit(1);

if (!error) {
  console.log("✓ Supabase connected — bookings table ready");
  process.exit(0);
}

if (error.code === "PGRST205") {
  console.log("✓ Supabase connected");
  console.log("✗ Tables not created yet");
  console.log("\nRun supabase/setup-complete.sql in your Supabase SQL Editor:");
  console.log("  https://supabase.com/dashboard/project/sccrvdqrllsgnxctyrhr/sql/new");
  process.exit(1);
}

console.error("✗ Supabase error:", error.message);
if (error.code === "42501") {
  console.error("\nPermission denied — run supabase/rls-policies.sql or setup-complete.sql");
}
process.exit(1);
