import {
  buildCancellationEmail,
  buildConfirmationEmail,
  buildReminderEmail,
  buildRestaurantNotificationEmail,
} from "./templates";
import { logNotification } from "../db/notification-log-store";
import {
  isEmailConfigured,
  resolveStaffNotificationEmail,
  shouldSkipGuestEmail,
} from "./config";
import { sendTransactionalEmail } from "./mailer";
import type { Booking } from "../types";

async function deliverGuestEmail(
  booking: Booking,
  type: "confirmation" | "reminder" | "cancellation",
  build: (booking: Booking) => { subject: string; html: string; text: string },
): Promise<boolean> {
  const { subject, html, text } = build(booking);

  if (!isEmailConfigured()) {
    await logNotification({
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      channel: "email",
      type,
      recipient: booking.customerEmail,
      status: "failed",
      error: "Email provider not configured",
    });
    return false;
  }

  if (shouldSkipGuestEmail()) {
    await logNotification({
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      channel: "email",
      type,
      recipient: booking.customerEmail,
      status: "skipped",
      error: "Resend test domain — use SMTP or verify domain",
    });
    return false;
  }

  const result = await sendTransactionalEmail({
    to: booking.customerEmail,
    subject,
    html,
    text,
  });

  if (!result.ok) {
    console.error(`[email:${type}:error]`, result.error);
    await logNotification({
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      channel: "email",
      type,
      recipient: booking.customerEmail,
      status: "failed",
      error: result.error,
    });
    return false;
  }

  await logNotification({
    bookingId: booking.id,
    referenceCode: booking.referenceCode,
    channel: "email",
    type,
    recipient: booking.customerEmail,
    status: "sent",
  });
  return true;
}

export async function sendConfirmationEmail(
  booking: Booking,
): Promise<boolean> {
  return deliverGuestEmail(booking, "confirmation", buildConfirmationEmail);
}

export async function sendRestaurantNotificationEmail(
  booking: Booking,
): Promise<boolean> {
  const staffEmail = resolveStaffNotificationEmail();
  const { subject, html, text } = buildRestaurantNotificationEmail(booking);

  if (!isEmailConfigured()) {
    console.error("[email:restaurant] Email provider not configured");
    return false;
  }

  const result = await sendTransactionalEmail({
    to: staffEmail,
    subject,
    html,
    text,
  });

  if (!result.ok) {
    console.error("[email:restaurant:error]", result.error);
    await logNotification({
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      channel: "email",
      type: "staff",
      recipient: staffEmail,
      status: "failed",
      error: result.error,
    });
    return false;
  }

  await logNotification({
    bookingId: booking.id,
    referenceCode: booking.referenceCode,
    channel: "email",
    type: "staff",
    recipient: staffEmail,
    status: "sent",
  });
  return true;
}

export async function sendReminderEmail(booking: Booking): Promise<boolean> {
  return deliverGuestEmail(booking, "reminder", buildReminderEmail);
}

export async function sendCancellationEmail(
  booking: Booking,
): Promise<boolean> {
  return deliverGuestEmail(booking, "cancellation", buildCancellationEmail);
}
