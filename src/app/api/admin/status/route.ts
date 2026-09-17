import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getEnvStatus } from "@/lib/env";
import { isUsingLocalStore } from "@/lib/db/store";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const env = getEnvStatus();

  return NextResponse.json({
    storage: isUsingLocalStore() ? "local file store" : "Supabase",
    services: env,
  });
}
