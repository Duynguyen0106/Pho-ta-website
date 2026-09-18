import { differenceInCalendarDays, parseISO } from "date-fns";
import type { RightToWorkCategory, RotaEmployee } from "./types";

export const RIGHT_TO_WORK_CATEGORIES: {
  value: RightToWorkCategory;
  label: string;
}[] = [
  { value: "uk_irish", label: "British / Irish citizen" },
  { value: "settled", label: "Settled or pre-settled status" },
  { value: "visa", label: "Visa holder" },
];

export const VISA_TYPES: { value: string; label: string }[] = [
  { value: "skilled_worker", label: "Skilled Worker" },
  { value: "student", label: "Student" },
  { value: "graduate", label: "Graduate route" },
  { value: "youth_mobility", label: "Youth Mobility Scheme" },
  { value: "dependant", label: "Dependant" },
  { value: "other", label: "Other visa" },
];

export const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

export function defaultComplianceFields(): Pick<
  RotaEmployee,
  | "dateOfBirth"
  | "rightToWorkCategory"
  | "visaType"
  | "visaExpiryDate"
  | "rightToWorkDocument"
> {
  return {
    dateOfBirth: null,
    rightToWorkCategory: "uk_irish",
    visaType: null,
    visaExpiryDate: null,
    rightToWorkDocument: null,
  };
}

export function normalizeEmployeeCompliance(
  employee: Partial<RotaEmployee>,
): Pick<
  RotaEmployee,
  | "dateOfBirth"
  | "rightToWorkCategory"
  | "visaType"
  | "visaExpiryDate"
  | "rightToWorkDocument"
> {
  const defaults = defaultComplianceFields();
  return {
    dateOfBirth:
      typeof employee.dateOfBirth === "string" ? employee.dateOfBirth : null,
    rightToWorkCategory:
      employee.rightToWorkCategory === "settled" ||
      employee.rightToWorkCategory === "visa"
        ? employee.rightToWorkCategory
        : "uk_irish",
    visaType:
      typeof employee.visaType === "string" ? employee.visaType : null,
    visaExpiryDate:
      typeof employee.visaExpiryDate === "string"
        ? employee.visaExpiryDate
        : null,
    rightToWorkDocument: employee.rightToWorkDocument ?? null,
  };
}

export function validateCompliance(input: {
  dateOfBirth?: string | null;
  rightToWorkCategory: RightToWorkCategory;
  visaType?: string | null;
  visaExpiryDate?: string | null;
}): string | null {
  if (input.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(input.dateOfBirth)) {
    return "Date of birth must be a valid date";
  }

  if (input.rightToWorkCategory === "visa") {
    if (!input.visaType?.trim()) {
      return "Visa type is required for visa holders";
    }
    if (!input.visaExpiryDate) {
      return "Visa expiry date is required for visa holders";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.visaExpiryDate)) {
      return "Visa expiry must be a valid date";
    }
  }

  return null;
}

export function visaTypeLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return VISA_TYPES.find((t) => t.value === value)?.label ?? value;
}

export type VisaAlert = "expired" | "expiring_soon" | null;

export function visaAlert(expiryDate: string | null | undefined): VisaAlert {
  if (!expiryDate) return null;
  const days = differenceInCalendarDays(parseISO(expiryDate), new Date());
  if (days < 0) return "expired";
  if (days <= 60) return "expiring_soon";
  return null;
}
