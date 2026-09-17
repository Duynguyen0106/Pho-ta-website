import { updateBooking } from "../db/store";
import type { Booking } from "../types";
import {
  sendConfirmationEmail,
  sendReminderEmail,
  sendRestaurantNotificationEmail,
} from "./email";
import { sendConfirmationSms, sendReminderSms } from "./sms";

export async function sendBookingConfirmation(
  booking: Booking,
): Promise<void> {
  const [emailOk, smsOk, restaurantOk] = await Promise.all([
    sendConfirmationEmail(booking),
    sendConfirmationSms(booking),
    sendRestaurantNotificationEmail(booking),
  ]);

  if (emailOk || smsOk || restaurantOk) {
    try {
      await updateBooking(booking.id, {
        confirmationSentAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[notify:confirmation:update]", error);
    }
  }

  if (!emailOk && !smsOk) {
    console.warn("[notify:confirmation] Customer notification not sent", {
      reference: booking.referenceCode,
      email: booking.customerEmail,
      phone: booking.customerPhone,
      restaurantNotified: restaurantOk,
    });
  }
}

export async function sendBookingReminder(booking: Booking): Promise<void> {
  const [emailOk, smsOk] = await Promise.all([
    sendReminderEmail(booking),
    sendReminderSms(booking),
  ]);

  if (emailOk || smsOk) {
    try {
      await updateBooking(booking.id, {
        reminderSentAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[notify:reminder:update]", error);
    }
  }
}
