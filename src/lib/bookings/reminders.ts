import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import { REMINDER_HOURS_BEFORE } from "../constants";
import type { Booking } from "../types";

const LONDON_TZ = "Europe/London";

export type ReminderMode = "daily" | "two_hours";

/** daily = morning-of reminder (Vercel Hobby). two_hours = 2h before (Pro or external cron). */
export function getReminderMode(): ReminderMode {
  return process.env.REMINDER_MODE === "two_hours" ? "two_hours" : "daily";
}

function getLondonTodayString(): string {
  return format(toZonedTime(new Date(), LONDON_TZ), "yyyy-MM-dd");
}

function getBookingDateTimeLondon(booking: Booking): Date {
  return fromZonedTime(`${booking.date}T${booking.time}:00`, LONDON_TZ);
}

export function filterBookingsNeedingReminder(
  bookings: Booking[],
  mode: ReminderMode = getReminderMode(),
): Booking[] {
  const now = new Date();

  return bookings.filter((booking) => {
    if (booking.reminderSentAt || booking.status !== "confirmed") {
      return false;
    }

    const bookingDateTime = getBookingDateTimeLondon(booking);

    if (bookingDateTime <= now) {
      return false;
    }

    if (mode === "daily") {
      return booking.date === getLondonTodayString();
    }

    const windowStart = new Date(
      now.getTime() + (REMINDER_HOURS_BEFORE * 60 - 15) * 60 * 1000,
    );
    const windowEnd = new Date(
      now.getTime() + (REMINDER_HOURS_BEFORE * 60 + 15) * 60 * 1000,
    );

    return (
      bookingDateTime >= windowStart && bookingDateTime <= windowEnd
    );
  });
}

export function isDailyReminderMode(): boolean {
  return getReminderMode() === "daily";
}
