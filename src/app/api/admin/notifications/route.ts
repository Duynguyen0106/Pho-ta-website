import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { listNotificationLog } from "@/lib/db/notification-log-store";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await listNotificationLog(150);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("[admin/notifications:GET]", error);
    return NextResponse.json(
      { error: "Failed to load notifications" },
      { status: 500 },
    );
  }
}
