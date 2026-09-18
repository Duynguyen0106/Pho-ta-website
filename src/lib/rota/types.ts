export type EmploymentType = "part_time" | "full_time";

export type RightToWorkCategory = "uk_irish" | "settled" | "visa";

export const FULL_TIME_WEEKLY_HOURS = 40;
export const PART_TIME_MAX_WEEKLY_HOURS = 19;

export interface RightToWorkDocument {
  fileName: string;
  mimeType: string;
  uploadedAt: string;
  sizeBytes: number;
}

export interface RotaEmployee {
  id: string;
  name: string;
  employmentType: EmploymentType;
  /** Weekly hours requested. Full-time is always 40; part-time must be under 20. */
  requestedHoursPerWeek: number;
  downloadToken: string;
  active: boolean;
  createdAt: string;
  dateOfBirth: string | null;
  rightToWorkCategory: RightToWorkCategory;
  visaType: string | null;
  visaExpiryDate: string | null;
  rightToWorkDocument: RightToWorkDocument | null;
}

export interface RotaShift {
  id: string;
  employeeId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  monthKey: string;
}

/** Persisted rota state — employees are saved permanently; schedules are per month. */
export interface RotaSettingsData {
  employees: RotaEmployee[];
  monthlySchedules: Record<string, RotaShift[]>;
}

export interface RotaMonthSummary {
  monthKey: string;
  employeeId: string;
  employeeName: string;
  scheduledHours: number;
  targetHours: number;
  shiftCount: number;
}
