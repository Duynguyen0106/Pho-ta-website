import { NextResponse } from "next/server";
import { getEnvStatus } from "@/lib/env";
import { isUsingLocalStore } from "@/lib/db/store";

export async function GET() {
  const env = getEnvStatus();

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    storage: isUsingLocalStore() ? "local" : "supabase",
    services: {
      database: env.database,
      email: env.email,
      sms: env.sms,
      admin: env.admin,
      cron: env.cron,
    },
    productionReady: env.productionReady,
    warnings: env.warnings,
  });
}
