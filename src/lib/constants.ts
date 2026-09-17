import type { SeatingPreference } from "./types";

export const SEATING_PREFERENCES: {
  value: SeatingPreference;
  label: string;
  description: string;
}[] = [
  {
    value: "no_preference",
    label: "No preference",
    description: "We'll find the best available table for you",
  },
  {
    value: "near_window",
    label: "Near window",
    description: "Window seating where available",
  },
  {
    value: "quiet",
    label: "Quiet table",
    description: "A calmer spot away from the kitchen and entrance",
  },
  {
    value: "centre",
    label: "Centre",
    description: "Central seating in the main dining area",
  },
  {
    value: "side",
    label: "Side",
    description: "Along the side of the restaurant",
  },
];

export const SEATING_LABELS: Record<SeatingPreference, string> =
  Object.fromEntries(
    SEATING_PREFERENCES.map((p) => [p.value, p.label]),
  ) as Record<SeatingPreference, string>;

export const BOOKING_STATUS_LABELS = {
  confirmed: "Confirmed",
  seated: "Seated",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
} as const;

export const BOOKING_SOURCE_LABELS = {
  website: "Website",
  phone: "Phone",
  walk_in: "Walk-in",
} as const;

export const MAX_PARTY_SIZE = 12;
export const MIN_PARTY_SIZE = 1;
export const MAX_ADVANCE_DAYS = 30;
export const MIN_LEAD_MINUTES = 60;
export const REMINDER_HOURS_BEFORE = 2;
export const DEFAULT_DURATION_MINUTES = 90;
