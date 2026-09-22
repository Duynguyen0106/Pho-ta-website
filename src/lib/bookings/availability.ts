import { addDays, addMinutes, format, isBefore, parse, startOfDay } from "date-fns";
import {
  MAX_ADVANCE_DAYS,
  MIN_LEAD_MINUTES,
} from "../constants";
import { getResolvedLocation } from "../db/settings-store";
import { isDateBlackout } from "../db/blackout-store";
import { getBookingsForSlot } from "../db/store";
import type { AvailabilitySlot, LocationSlug } from "../types";

function parseTime(time: string): Date {
  return parse(time, "HH:mm", new Date());
}

function formatTime(date: Date): string {
  return format(date, "HH:mm");
}

export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  intervalMinutes: number,
): string[] {
  const slots: string[] = [];
  let current = parseTime(openTime);
  const end = parseTime(closeTime);

  while (isBefore(current, end)) {
    slots.push(formatTime(current));
    current = addMinutes(current, intervalMinutes);
  }

  return slots;
}

export async function getAvailability(
  locationSlug: LocationSlug,
  date: string,
  partySize: number,
): Promise<AvailabilitySlot[]> {
  const location = await getResolvedLocation(locationSlug);

  const selectedDate = startOfDay(parse(date, "yyyy-MM-dd", new Date()));
  const today = startOfDay(new Date());
  const maxDate = addDays(today, MAX_ADVANCE_DAYS);

  if (selectedDate < today || selectedDate > maxDate) {
    return [];
  }

  if (await isDateBlackout(locationSlug, date)) {
    return generateTimeSlots(
      location.openTime,
      location.closeTime,
      location.slotIntervalMinutes,
    ).map((time) => ({
      time,
      available: false,
      remainingCovers: 0,
    }));
  }

  const slots = generateTimeSlots(
    location.openTime,
    location.closeTime,
    location.slotIntervalMinutes,
  );

  const now = new Date();
  const minBookingTime = addMinutes(now, MIN_LEAD_MINUTES);

  const availability = await Promise.all(
    slots.map(async (time) => {
      const slotDateTime = parse(
        `${date} ${time}`,
        "yyyy-MM-dd HH:mm",
        new Date(),
      );

      if (slotDateTime < minBookingTime) {
        return {
          time,
          available: false,
          remainingCovers: 0,
        };
      }

      const existing = await getBookingsForSlot(locationSlug, date, time);
      const usedCovers = existing.reduce((sum, b) => sum + b.partySize, 0);
      const remainingCovers = location.maxCoversPerSlot - usedCovers;

      return {
        time,
        available: remainingCovers >= partySize,
        remainingCovers: Math.max(0, remainingCovers),
      };
    }),
  );

  return availability;
}

export async function isSlotAvailable(
  locationSlug: LocationSlug,
  date: string,
  time: string,
  partySize: number,
): Promise<boolean> {
  const slots = await getAvailability(locationSlug, date, partySize);
  const slot = slots.find((s) => s.time === time);
  return slot?.available ?? false;
}
