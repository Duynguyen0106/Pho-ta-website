import { NextRequest, NextResponse } from "next/server";
import { getReminderMode } from "@/lib/bookings/reminders";
import { getBookingsNeedingReminder } from "@/lib/db/store";
import { sendBookingReminder } from "@/lib/notifications/send";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await getBookingsNeedingReminder();
  const results = [];

  for (const booking of bookings) {
    await sendBookingReminder(booking);
    results.push(booking.referenceCode);
  }

  return NextResponse.json({
    mode: getReminderMode(),
    processed: results.length,
    references: results,
  });
}
