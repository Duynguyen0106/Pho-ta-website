import { updateBooking } from "../db/store";
import type { Booking } from "../types";
import {
  isEmailConfigured,
  shouldSkipGuestEmail,
} from "./config";
import {
  sendCancellationEmail,
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

export async function sendBookingCancellation(
  booking: Booking,
): Promise<boolean> {
  return sendCancellationEmail(booking);
}

export type ResendConfirmationResult = {
  sent: boolean;
  skipped?: boolean;
  error?: string;
  recipient: string;
};

/** Admin resend — customer confirmation email only (filled from booking). */
export async function resendBookingConfirmationEmail(
  booking: Booking,
): Promise<ResendConfirmationResult> {
  const recipient = booking.customerEmail;

  if (!isEmailConfigured()) {
    return {
      sent: false,
      recipient,
      error:
        "Email is not configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS or RESEND_API_KEY.",
    };
  }

  if (shouldSkipGuestEmail()) {
    return {
      sent: false,
      skipped: true,
      recipient,
      error:
        "Guest emails are blocked on Resend test domain. Use SMTP (e.g. Gmail) or verify photarestaurants.com on Resend.",
    };
  }

  const sent = await sendConfirmationEmail(booking);

  if (sent) {
    try {
      await updateBooking(booking.id, {
        confirmationSentAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[notify:resend:update]", error);
    }
    return { sent: true, recipient };
  }

  return {
    sent: false,
    recipient,
    error: "Email delivery failed. Check the notifications log for details.",
  };
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
