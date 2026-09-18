import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  parseISO,
  startOfMonth,
} from "date-fns";
import { location } from "@/lib/data/locations";
import type { BlackoutDate } from "@/lib/types";
import {
  FULL_TIME_WEEKLY_HOURS,
  PART_TIME_MAX_WEEKLY_HOURS,
  type EmploymentType,
  type RotaEmployee,
  type RotaShift,
} from "./types";

interface ShiftTemplate {
  startTime: string;
  endTime: string;
  hours: number;
}

const SHIFT_TEMPLATES: ShiftTemplate[] = [
  { startTime: "11:30", endTime: "19:30", hours: 8 },
  { startTime: "13:30", endTime: "21:30", hours: 8 },
  { startTime: "11:30", endTime: "21:30", hours: 10 },
  { startTime: "11:30", endTime: "17:30", hours: 6 },
  { startTime: "15:30", endTime: "21:30", hours: 6 },
];

function weeklyHoursForEmployee(employee: RotaEmployee): number {
  if (employee.employmentType === "full_time") {
    return FULL_TIME_WEEKLY_HOURS;
  }
  return Math.min(
    Math.max(employee.requestedHoursPerWeek, 1),
    PART_TIME_MAX_WEEKLY_HOURS,
  );
}

export function targetHoursForMonth(
  employee: RotaEmployee,
  monthKey: string,
): number {
  const monthStart = parseISO(`${monthKey}-01`);
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: endOfMonth(monthStart),
  }).length;
  const weekly = weeklyHoursForEmployee(employee);
  return Math.round(weekly * (daysInMonth / 7) * 10) / 10;
}

function pickTemplate(remainingHours: number): ShiftTemplate {
  const sorted = [...SHIFT_TEMPLATES].sort((a, b) => b.hours - a.hours);
  for (const template of sorted) {
    if (template.hours <= remainingHours + 0.5) {
      return template;
    }
  }
  return SHIFT_TEMPLATES[SHIFT_TEMPLATES.length - 1];
}

function isOpenDay(date: Date, blackouts: BlackoutDate[]): boolean {
  const iso = format(date, "yyyy-MM-dd");
  if (blackouts.some((b) => b.date === iso)) return false;
  return true;
}

function shiftId(employeeId: string, date: string, startTime: string): string {
  return `${employeeId}-${date}-${startTime.replace(":", "")}`;
}

export function generateMonthlyRota(input: {
  monthKey: string;
  employees: RotaEmployee[];
  blackouts?: BlackoutDate[];
  existingShifts?: RotaShift[];
}): RotaShift[] {
  const { monthKey, employees, blackouts = [] } = input;
  const activeEmployees = employees.filter((e) => e.active);
  if (activeEmployees.length === 0) return [];

  const monthStart = startOfMonth(parseISO(`${monthKey}-01`));
  const monthEnd = endOfMonth(monthStart);
  const openDays = eachDayOfInterval({ start: monthStart, end: monthEnd }).filter(
    (day) => isOpenDay(day, blackouts),
  );

  if (openDays.length === 0) return [];

  const shifts: RotaShift[] = [];

  activeEmployees.forEach((employee, employeeIndex) => {
    let remaining = targetHoursForMonth(employee, monthKey);
    let dayCursor = employeeIndex % openDays.length;

    while (remaining >= 4 && shifts.filter((s) => s.employeeId === employee.id).length < openDays.length) {
      const day = openDays[dayCursor % openDays.length];
      dayCursor += 1;

      const dateStr = format(day, "yyyy-MM-dd");
      const alreadyScheduled = shifts.some(
        (s) => s.employeeId === employee.id && s.shiftDate === dateStr,
      );
      if (alreadyScheduled) continue;

      const template = pickTemplate(remaining);
      shifts.push({
        id: shiftId(employee.id, dateStr, template.startTime),
        employeeId: employee.id,
        shiftDate: dateStr,
        startTime: template.startTime,
        endTime: template.endTime,
        monthKey,
      });
      remaining -= template.hours;

      if (dayCursor > openDays.length * 3) break;
    }
  });

  return shifts.sort((a, b) =>
    a.shiftDate === b.shiftDate
      ? a.startTime.localeCompare(b.startTime)
      : a.shiftDate.localeCompare(b.shiftDate),
  );
}

export function summarizeEmployeeMonth(
  employee: RotaEmployee,
  monthKey: string,
  shifts: RotaShift[],
): {
  scheduledHours: number;
  targetHours: number;
  shiftCount: number;
} {
  const employeeShifts = shifts.filter(
    (s) => s.employeeId === employee.id && s.monthKey === monthKey,
  );
  const scheduledHours = employeeShifts.reduce((sum, shift) => {
    const template = SHIFT_TEMPLATES.find(
      (t) => t.startTime === shift.startTime && t.endTime === shift.endTime,
    );
    return sum + (template?.hours ?? 8);
  }, 0);

  return {
    scheduledHours: Math.round(scheduledHours * 10) / 10,
    targetHours: targetHoursForMonth(employee, monthKey),
    shiftCount: employeeShifts.length,
  };
}

export function validateEmployeeInput(input: {
  name: string;
  employmentType: EmploymentType;
  requestedHoursPerWeek: number;
}): string | null {
  if (!input.name.trim()) return "Name is required";
  if (input.employmentType === "full_time") return null;
  if (input.requestedHoursPerWeek >= 20) {
    return "Part-time hours must be less than 20 per week";
  }
  if (input.requestedHoursPerWeek <= 0) {
    return "Requested hours must be greater than zero";
  }
  return null;
}

export function restaurantHoursLabel(): string {
  return `${location.openTime} – ${location.closeTime}`;
}

export function dayName(dateStr: string): string {
  return format(parseISO(dateStr), "EEE");
}

export function formatShiftRange(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`;
}

export function hoursBetween(startTime: string, endTime: string): number {
  const template = SHIFT_TEMPLATES.find(
    (t) => t.startTime === startTime && t.endTime === endTime,
  );
  if (template) return template.hours;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) / 60;
}

export function isWeekend(dateStr: string): boolean {
  const day = getDay(parseISO(dateStr));
  return day === 0 || day === 6;
}

export function nextMonthKey(monthKey: string): string {
  const date = addDays(endOfMonth(parseISO(`${monthKey}-01`)), 1);
  return format(date, "yyyy-MM");
}
