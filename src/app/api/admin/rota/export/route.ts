import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getRotaForMonth, listRotaEmployees } from "@/lib/db/rota-store";
import { buildEmployeeScheduleCsv } from "@/lib/rota/export-schedule";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const employeeId = request.nextUrl.searchParams.get("employeeId");
    const monthKey = request.nextUrl.searchParams.get("month");
    if (!employeeId || !monthKey) {
      return NextResponse.json(
        { error: "employeeId and month are required" },
        { status: 400 },
      );
    }

    const employees = await listRotaEmployees();
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const { shifts } = await getRotaForMonth(monthKey);
    const csv = buildEmployeeScheduleCsv({ employee, monthKey, shifts });
    const safeName = employee.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rota-${safeName}-${monthKey}.csv"`,
      },
    });
  } catch (error) {
    console.error("[admin/rota/export:GET]", error);
    return NextResponse.json({ error: "Failed to export schedule" }, { status: 500 });
  }
}
