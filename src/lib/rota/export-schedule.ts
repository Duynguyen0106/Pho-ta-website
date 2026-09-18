import { format, parseISO } from "date-fns";
import { hoursBetween } from "./generate-schedule";
import type { RotaEmployee, RotaShift } from "./types";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildEmployeeScheduleCsv(input: {
  employee: RotaEmployee;
  monthKey: string;
  shifts: RotaShift[];
  venueName?: string;
}): string {
  const { employee, monthKey, shifts, venueName = "Pho Ta Finchley Road" } = input;
  const employeeShifts = shifts
    .filter((s) => s.employeeId === employee.id && s.monthKey === monthKey)
    .sort((a, b) =>
      a.shiftDate === b.shiftDate
        ? a.startTime.localeCompare(b.startTime)
        : a.shiftDate.localeCompare(b.shiftDate),
    );

  const headers = ["Employee", "Month", "Date", "Day", "Start", "End", "Hours"];
  const rows = employeeShifts.map((shift) => {
    const hours = hoursBetween(shift.startTime, shift.endTime);
    return [
      employee.name,
      monthKey,
      shift.shiftDate,
      format(parseISO(shift.shiftDate), "EEEE"),
      shift.startTime,
      shift.endTime,
      hours.toFixed(1),
    ];
  });

  const totalHours = employeeShifts.reduce(
    (sum, shift) => sum + hoursBetween(shift.startTime, shift.endTime),
    0,
  );

  const meta = [
    [`Venue`, venueName],
    [`Employment`, employee.employmentType === "full_time" ? "Full-time (40h/week)" : `Part-time (${employee.requestedHoursPerWeek}h/week)`],
    [`Total scheduled hours`, totalHours.toFixed(1)],
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
  shifts: RotaShift[];
  venueName?: string;
}): string {
  const { employee, monthKey, shifts, venueName = "Pho Ta Finchley Road" } = input;
  const employeeShifts = shifts
    .filter((s) => s.employeeId === employee.id && s.monthKey === monthKey)
    .sort((a, b) => a.shiftDate.localeCompare(b.shiftDate));

  const totalHours = employeeShifts.reduce(
    (sum, shift) => sum + hoursBetween(shift.startTime, shift.endTime),
    0,
  );

  const lines = [
    `${venueName}`,
    `Work schedule — ${employee.name}`,
    `Month: ${format(parseISO(`${monthKey}-01`), "MMMM yyyy")}`,
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
      const hours = hoursBetween(shift.startTime, shift.endTime);
      lines.push(
        `  ${day}  ${shift.startTime} – ${shift.endTime}  (${hours}h)`,
      );
    }
  }

  lines.push("", `Total scheduled hours: ${totalHours.toFixed(1)}`);
  return lines.join("\n");
}
