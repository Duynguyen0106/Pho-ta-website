import {
  BREAK_REQUIRED_AFTER_HOURS,
  MAX_DAILY_SHIFT_HOURS,
  UNPAID_BREAK_MINUTES,
} from "./types";

function parseTime(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/** Wall-clock hours between start and end (HH:mm). */
export function wallClockHoursBetween(startTime: string, endTime: string): number {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  if (end <= start) return 0;
  return (end - start) / 60;
}

export function unpaidBreakMinutes(startTime: string, endTime: string): number {
  const hours = wallClockHoursBetween(startTime, endTime);
  return hours > BREAK_REQUIRED_AFTER_HOURS ? UNPAID_BREAK_MINUTES : 0;
}

/** Paid working hours after deducting unpaid break. */
export function workingHoursBetween(startTime: string, endTime: string): number {
  const wallClock = wallClockHoursBetween(startTime, endTime);
  const breakHours = unpaidBreakMinutes(startTime, endTime) / 60;
  return Math.max(0, Math.round((wallClock - breakHours) * 10) / 10);
}

/** Shift length used for scheduling totals (wall clock, capped at daily max). */
export function shiftHoursBetween(startTime: string, endTime: string): number {
  const hours = wallClockHoursBetween(startTime, endTime);
  return Math.min(hours, MAX_DAILY_SHIFT_HOURS);
}

export function isValidShiftDuration(startTime: string, endTime: string): boolean {
  const hours = wallClockHoursBetween(startTime, endTime);
  return hours > 0 && hours <= MAX_DAILY_SHIFT_HOURS;
}

export function formatBreakLabel(startTime: string, endTime: string): string {
  const minutes = unpaidBreakMinutes(startTime, endTime);
  if (minutes === 0) return "None";
  return `${minutes} min unpaid`;
}
