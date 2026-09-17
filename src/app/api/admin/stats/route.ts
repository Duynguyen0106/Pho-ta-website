import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getBookingStats } from "@/lib/db/store";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const days = Number(request.nextUrl.searchParams.get("days") ?? "7");
    const stats = await getBookingStats(Number.isFinite(days) ? days : 7);
    return NextResponse.json({ stats, days });
  } catch (error) {
    console.error("[admin/stats:GET]", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 },
    );
  }
}
