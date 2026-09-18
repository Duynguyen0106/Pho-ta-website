import { format, parseISO } from "date-fns";
import {
  formatBreakLabel,
  shiftHoursBetween,
  workingHoursBetween,
} from "./shift-hours";
import type { RotaEmployee, RotaShift } from "./types";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function employeeShiftsForMonth(
  employeeId: string,
  monthKey: string,
  teamShifts: RotaShift[],
): RotaShift[] {
  return teamShifts
    .filter((s) => s.employeeId === employeeId && s.monthKey === monthKey)
    .sort((a, b) =>
      a.shiftDate === b.shiftDate
        ? a.startTime.localeCompare(b.startTime)
        : a.shiftDate.localeCompare(b.shiftDate),
    );
}

export function buildTeamScheduleCsv(input: {
  monthKey: string;
  employees: RotaEmployee[];
  teamShifts: RotaShift[];
  venueName?: string;
}): string {
  const { monthKey, employees, teamShifts, venueName = "Pho Ta Finchley Road" } =
    input;

  const headers = [
    "Month",
    "Date",
    "Day",
    "Employee",
    "Contract",
    "Weekly hours",
    "Start",
    "End",
    "Shift hours",
    "Break",
    "Working hours",
  ];

  const rows = teamShifts
    .filter((s) => s.monthKey === monthKey)
    .sort((a, b) =>
      a.shiftDate === b.shiftDate
        ? a.startTime.localeCompare(b.startTime)
        : a.shiftDate.localeCompare(b.shiftDate),
    )
    .map((shift) => {
      const employee = employees.find((e) => e.id === shift.employeeId);
      const shiftHours = shiftHoursBetween(shift.startTime, shift.endTime);
      const workingHours = workingHoursBetween(shift.startTime, shift.endTime);
      return [
        monthKey,
        shift.shiftDate,
        format(parseISO(shift.shiftDate), "EEEE"),
        employee?.name ?? "Unknown",
        employee?.employmentType === "full_time" ? "Full-time" : "Part-time",
        employee ? String(employee.requestedHoursPerWeek) : "",
        shift.startTime,
        shift.endTime,
        shiftHours.toFixed(1),
        formatBreakLabel(shift.startTime, shift.endTime),
        workingHours.toFixed(1),
      ];
    });

  const meta = [
    ["Venue", venueName],
    ["Team schedule", format(parseISO(`${monthKey}-01`), "MMMM yyyy")],
    ["Total shifts", String(rows.length)],
    ["Staff count", String(employees.filter((e) => e.active).length)],
    [],
  ];

  return [
    ...meta.map((row) => row.map((cell) => escapeCsv(cell)).join(",")),
    headers.map((cell) => escapeCsv(cell)).join(","),
    ...rows.map((row) => row.map((cell) => escapeCsv(String(cell))).join(",")),
  ].join("\n");
}

export function buildEmployeeScheduleCsv(input: {
  employee: RotaEmployee;
  monthKey: string;
  teamShifts: RotaShift[];
  venueName?: string;
}): string {
  const { employee, monthKey, teamShifts, venueName = "Pho Ta Finchley Road" } =
    input;
  const employeeShifts = employeeShiftsForMonth(
    employee.id,
    monthKey,
    teamShifts,
  );

  const headers = [
    "Employee",
    "Month",
    "Date",
    "Day",
    "Start",
    "End",
    "Shift hours",
    "Break",
    "Working hours",
  ];
  const rows = employeeShifts.map((shift) => {
    const shiftHours = shiftHoursBetween(shift.startTime, shift.endTime);
    const workingHours = workingHoursBetween(shift.startTime, shift.endTime);
    return [
      employee.name,
      monthKey,
      shift.shiftDate,
      format(parseISO(shift.shiftDate), "EEEE"),
      shift.startTime,
      shift.endTime,
      shiftHours.toFixed(1),
      formatBreakLabel(shift.startTime, shift.endTime),
      workingHours.toFixed(1),
    ];
  });

  const totalHours = employeeShifts.reduce(
    (sum, shift) => sum + shiftHoursBetween(shift.startTime, shift.endTime),
    0,
  );

  const meta = [
    ["Venue", venueName],
    ["Extracted from team schedule", format(parseISO(`${monthKey}-01`), "MMMM yyyy")],
    [
      "Employment",
      employee.employmentType === "full_time"
        ? "Full-time (40h/week)"
        : `Part-time (${employee.requestedHoursPerWeek}h/week)`,
    ],
    ["Total scheduled hours", totalHours.toFixed(1)],
    [],
  ];

  return [
    ...meta.map((row) => row.map((cell) => escapeCsv(cell)).join(",")),
    headers.map((cell) => escapeCsv(cell)).join(","),
    ...rows.map((row) => row.map((cell) => escapeCsv(cell)).join(",")),
  ].join("\n");
}

export function buildEmployeeScheduleText(input: {
  employee: RotaEmployee;
  monthKey: string;
  teamShifts: RotaShift[];
  venueName?: string;
}): string {
  const { employee, monthKey, teamShifts, venueName = "Pho Ta Finchley Road" } =
    input;
  const employeeShifts = employeeShiftsForMonth(
    employee.id,
    monthKey,
    teamShifts,
  );

  const totalHours = employeeShifts.reduce(
    (sum, shift) => sum + shiftHoursBetween(shift.startTime, shift.endTime),
    0,
  );

  const lines = [
    venueName,
    `Work schedule — ${employee.name}`,
    `Month: ${format(parseISO(`${monthKey}-01`), "MMMM yyyy")}`,
    "Extracted from published team rota",
    employee.employmentType === "full_time"
      ? "Contract: Full-time (40 hours/week)"
      : `Contract: Part-time (${employee.requestedHoursPerWeek} hours/week)`,
    "",
    "Shifts:",
  ];

  if (employeeShifts.length === 0) {
    lines.push("  No shifts scheduled for this month.");
  } else {
    for (const shift of employeeShifts) {
      const day = format(parseISO(shift.shiftDate), "EEE d MMM");
      const hours = shiftHoursBetween(shift.startTime, shift.endTime);
      const breakLabel = formatBreakLabel(shift.startTime, shift.endTime);
      const working = workingHoursBetween(shift.startTime, shift.endTime);
      lines.push(
        `  ${day}  ${shift.startTime} – ${shift.endTime}  (${hours}h incl. break · ${working}h working · ${breakLabel})`,
      );
    }
  }

  lines.push("", `Total scheduled hours: ${totalHours.toFixed(1)}`);
  return lines.join("\n");
}
