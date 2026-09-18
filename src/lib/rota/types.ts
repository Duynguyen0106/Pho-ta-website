export type EmploymentType = "part_time" | "full_time";

export const FULL_TIME_WEEKLY_HOURS = 40;
export const PART_TIME_MAX_WEEKLY_HOURS = 19;

export interface RotaEmployee {
  id: string;
  name: string;
  employmentType: EmploymentType;
  /** Weekly hours requested. Full-time is always 40; part-time must be under 20. */
  requestedHoursPerWeek: number;
  downloadToken: string;
  active: boolean;
  createdAt: string;
}

export interface RotaShift {
  id: string;
  employeeId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  monthKey: string;
}

export interface RotaMonthSummary {
  monthKey: string;
  employeeId: string;
  employeeName: string;
  scheduledHours: number;
  targetHours: number;
  shiftCount: number;
}
