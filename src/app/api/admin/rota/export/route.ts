import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getRotaForMonth, listRotaEmployees } from "@/lib/db/rota-store";
import {
  buildEmployeeScheduleCsv,
  buildTeamScheduleCsv,
} from "@/lib/rota/export-schedule";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const employeeId = request.nextUrl.searchParams.get("employeeId");
    const monthKey = request.nextUrl.searchParams.get("month");
    if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
      return NextResponse.json({ error: "Valid month is required" }, { status: 400 });
    }

    const { employees, shifts: teamShifts } = await getRotaForMonth(monthKey);

    if (!employeeId) {
      if (teamShifts.length === 0) {
        return NextResponse.json(
          { error: "Generate the team schedule for this month first" },
          { status: 404 },
        );
      }
      const csv = buildTeamScheduleCsv({ monthKey, employees, teamShifts });
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="team-rota-${monthKey}.csv"`,
        },
      });
    }

    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    if (teamShifts.length === 0) {
      return NextResponse.json(
        { error: "Generate the team schedule for this month first" },
        { status: 404 },
      );
    }

    const csv = buildEmployeeScheduleCsv({ employee, monthKey, teamShifts });
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
