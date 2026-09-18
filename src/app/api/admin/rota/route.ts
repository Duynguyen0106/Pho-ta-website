import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import {
  createRotaEmployee,
  deleteRotaEmployee,
  generateRotaForMonth,
  getRotaForMonth,
  listRotaEmployees,
  regenerateEmployeeDownloadToken,
  updateRotaEmployee,
} from "@/lib/db/rota-store";
import { summarizeEmployeeMonth } from "@/lib/rota/generate-schedule";
import type { EmploymentType } from "@/lib/rota/types";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const month = request.nextUrl.searchParams.get("month");
    if (month) {
      const { employees, shifts } = await getRotaForMonth(month);
      const summaries = employees.map((employee) => ({
        employeeId: employee.id,
        employeeName: employee.name,
        monthKey: month,
        ...summarizeEmployeeMonth(employee, month, shifts),
      }));
      return NextResponse.json({ employees, shifts, summaries, monthKey: month });
    }

    const employees = await listRotaEmployees();
    return NextResponse.json({ employees });
  } catch (error) {
    console.error("[admin/rota:GET]", error);
    return NextResponse.json({ error: "Failed to load rota" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body as { action: string };

    switch (action) {
      case "createEmployee": {
        const employee = await createRotaEmployee({
          name: String(body.name ?? ""),
          employmentType: body.employmentType as EmploymentType,
          requestedHoursPerWeek: Number(body.requestedHoursPerWeek ?? 0),
        });
        return NextResponse.json({ employee });
      }
      case "updateEmployee": {
        const employee = await updateRotaEmployee(String(body.id), {
          name: body.name,
          employmentType: body.employmentType,
          requestedHoursPerWeek:
            body.requestedHoursPerWeek !== undefined
              ? Number(body.requestedHoursPerWeek)
              : undefined,
          active: body.active,
        });
        if (!employee) {
          return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }
        return NextResponse.json({ employee });
      }
      case "deleteEmployee": {
        const ok = await deleteRotaEmployee(String(body.id));
        if (!ok) {
          return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }
        return NextResponse.json({ ok: true });
      }
      case "generateMonth": {
        const monthKey = String(body.monthKey ?? "");
        if (!/^\d{4}-\d{2}$/.test(monthKey)) {
          return NextResponse.json({ error: "Invalid month" }, { status: 400 });
        }
        const shifts = await generateRotaForMonth(monthKey);
        const { employees } = await getRotaForMonth(monthKey);
        const summaries = employees.map((employee) => ({
          employeeId: employee.id,
          employeeName: employee.name,
          monthKey,
          ...summarizeEmployeeMonth(employee, monthKey, shifts),
        }));
        return NextResponse.json({ shifts, summaries, monthKey });
      }
      case "regenerateToken": {
        const employee = await regenerateEmployeeDownloadToken(String(body.id));
        if (!employee) {
          return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }
        return NextResponse.json({ employee });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[admin/rota:POST]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Rota action failed" },
      { status: 500 },
    );
  }
}
