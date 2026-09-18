import { NextRequest, NextResponse } from "next/server";
import {
  findEmployeeByDownloadToken,
  getRotaForMonth,
} from "@/lib/db/rota-store";
import {
  buildEmployeeScheduleCsv,
  buildEmployeeScheduleText,
} from "@/lib/rota/export-schedule";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    const monthKey = request.nextUrl.searchParams.get("month");
    const format = request.nextUrl.searchParams.get("format") ?? "csv";

    if (!token || !monthKey) {
      return NextResponse.json(
        { error: "token and month are required" },
        { status: 400 },
      );
    }
    if (!/^\d{4}-\d{2}$/.test(monthKey)) {
      return NextResponse.json({ error: "Invalid month" }, { status: 400 });
    }

    const employee = await findEmployeeByDownloadToken(token);
    if (!employee || !employee.active) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const { shifts } = await getRotaForMonth(monthKey);
    const safeName = employee.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

    if (format === "txt") {
      const text = buildEmployeeScheduleText({ employee, monthKey, shifts });
      return new NextResponse(text, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="schedule-${safeName}-${monthKey}.txt"`,
        },
      });
    }

    const csv = buildEmployeeScheduleCsv({ employee, monthKey, shifts });
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="schedule-${safeName}-${monthKey}.csv"`,
      },
    });
  } catch (error) {
    console.error("[rota/download:GET]", error);
    return NextResponse.json({ error: "Failed to download schedule" }, { status: 500 });
  }
}
