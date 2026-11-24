import { parse, startOfDay } from "date-fns";
import { getResolvedLocation } from "@/lib/db/settings-store";
import { isDateBlackout } from "@/lib/db/blackout-store";
import { getBookingsForSlot } from "@/lib/db/store";
import type { LocationSlug } from "@/lib/types";

function normalizeTime(time: string): string {
  return time.slice(0, 5);
}

export async function checkSlotCapacity(input: {
  locationSlug: LocationSlug;
  date: string;
  time: string;
  partySize: number;
  /** When editing, exclude this booking from cover counts. */
  excludeBookingId?: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const time = normalizeTime(input.time);

  if (await isDateBlackout(input.locationSlug, input.date)) {
    return {
      ok: false,
      reason: "This date is closed. Remove the closure or pick another day.",
    };
  }

  const location = await getResolvedLocation(input.locationSlug);
  const selectedDate = startOfDay(parse(input.date, "yyyy-MM-dd", new Date()));

  const open = parse(
    `${input.date} ${location.openTime}`,
    "yyyy-MM-dd HH:mm",
    new Date(),
  );
  const close = parse(
    `${input.date} ${location.closeTime}`,
    "yyyy-MM-dd HH:mm",
    new Date(),
  );
  const slotAt = parse(
    `${input.date} ${time}`,
    "yyyy-MM-dd HH:mm",
    new Date(),
  );

  if (slotAt < open || slotAt >= close) {
    return {
      ok: false,
      reason: `Time must be within opening hours (${location.openTime}–${location.closeTime}).`,
    };
  }

  if (selectedDate < startOfDay(new Date())) {
    return {
      ok: false,
      reason: "Cannot book in the past.",
    };
  }

  const existing = await getBookingsForSlot(
    input.locationSlug,
    input.date,
    time,
  );
  const usedCovers = existing
    .filter((b) => b.id !== input.excludeBookingId)
    .reduce((sum, b) => sum + b.partySize, 0);

  const remaining = location.maxCoversPerSlot - usedCovers;
  if (input.partySize > remaining) {
    return {
      ok: false,
      reason: `Only ${Math.max(0, remaining)} covers left for ${time} (max ${location.maxCoversPerSlot} per slot).`,
    };
  }

  return { ok: true };
}