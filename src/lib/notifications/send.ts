import { updateBooking } from "../db/store";
import type { Booking } from "../types";
import { sendConfirmationEmail, sendReminderEmail } from "./email";
import { sendConfirmationSms, sendReminderSms } from "./sms";

export async function sendBookingConfirmation(
  booking: Booking,
): Promise<void> {
  const [emailOk, smsOk] = await Promise.all([
    sendConfirmationEmail(booking),
    sendConfirmationSms(booking),
  ]);

  if (emailOk || smsOk) {
    await updateBooking(booking.id, {
      confirmationSentAt: new Date().toISOString(),
    });
  }
}

export async function sendBookingReminder(booking: Booking): Promise<void> {
  const [emailOk, smsOk] = await Promise.all([
    sendReminderEmail(booking),
    sendReminderSms(booking),
  ]);

  if (emailOk || smsOk) {
    await updateBooking(booking.id, {
      reminderSentAt: new Date().toISOString(),
    });
  }
}
