import { Resend } from "resend";
import {
  buildCancellationEmail,
  buildConfirmationEmail,
  buildReminderEmail,
  buildRestaurantNotificationEmail,
} from "./templates";
import { logNotification } from "../db/notification-log-store";
import {
  isUsingResendTestDomain,
  resolveEmailFrom,
  resolveResendApiKey,
  RESEND_OWNER_EMAIL,
} from "./config";
import type { Booking } from "../types";

function getResend(): Resend | null {
  const key = resolveResendApiKey();
  if (!key) return null;
  return new Resend(key);
}

export async function sendConfirmationEmail(
  booking: Booking,
): Promise<boolean> {
  const resend = getResend();
  const { subject, html, text } = buildConfirmationEmail(booking);

  if (!resend) {
    console.error("[email:confirmation] Resend API key not configured");
    await logNotification({
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      channel: "email",
      type: "confirmation",
      recipient: booking.customerEmail,
      status: "failed",
      error: "Resend not configured",
    });
    return false;
  }

  if (isUsingResendTestDomain()) {
    console.warn(
      "[email:confirmation] Test domain active — customer email skipped until photarestaurants.com is verified on Resend",
      { to: booking.customerEmail },
    );
    await logNotification({
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      channel: "email",
      type: "confirmation",
      recipient: booking.customerEmail,
      status: "skipped",
      error: "Resend test domain",
    });
    return false;
  }

  const { error } = await resend.emails.send({
    from: resolveEmailFrom(),
    to: booking.customerEmail,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[email:confirmation:error]", error);
    await logNotification({
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      channel: "email",
      type: "confirmation",
      recipient: booking.customerEmail,
      status: "failed",
      error: error.message,
    });
    return false;
  }

  await logNotification({
    bookingId: booking.id,
    referenceCode: booking.referenceCode,
    channel: "email",
    type: "confirmation",
    recipient: booking.customerEmail,
    status: "sent",
  });
  return true;
}

/** Staff notification — works with Resend test domain (delivers to account owner). */
export async function sendRestaurantNotificationEmail(
  booking: Booking,
): Promise<boolean> {
  const resend = getResend();
  const { subject, html, text } = buildRestaurantNotificationEmail(booking);

  if (!resend) {
    console.error("[email:restaurant] Resend API key not configured");
    return false;
  }

  const { error } = await resend.emails.send({
    from: resolveEmailFrom(),
    to: RESEND_OWNER_EMAIL,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[email:restaurant:error]", error);
    await logNotification({
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      channel: "email",
      type: "staff",
      recipient: RESEND_OWNER_EMAIL,
      status: "failed",
      error: error.message,
    });
    return false;
  }

  await logNotification({
    bookingId: booking.id,
    referenceCode: booking.referenceCode,
    channel: "email",
    type: "staff",
    recipient: RESEND_OWNER_EMAIL,
    status: "sent",
  });
  return true;
}

export async function sendReminderEmail(booking: Booking): Promise<boolean> {
  const resend = getResend();
  const { subject, html, text } = buildReminderEmail(booking);

  if (!resend) {
    console.error("[email:reminder] Resend API key not configured");
    return false;
  }

  if (isUsingResendTestDomain()) {
    return false;
  }

  const { error } = await resend.emails.send({
    from: resolveEmailFrom(),
    to: booking.customerEmail,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[email:reminder:error]", error);
    await logNotification({
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      channel: "email",
      type: "reminder",
      recipient: booking.customerEmail,
      status: "failed",
      error: error.message,
    });
    return false;
  }

  await logNotification({
    bookingId: booking.id,
    referenceCode: booking.referenceCode,
    channel: "email",
    type: "reminder",
    recipient: booking.customerEmail,
    status: "sent",
  });
  return true;
}

export async function sendCancellationEmail(
  booking: Booking,
): Promise<boolean> {
  const resend = getResend();
  const { subject, html, text } = buildCancellationEmail(booking);

  if (!resend) {
    await logNotification({
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      channel: "email",
      type: "cancellation",
      recipient: booking.customerEmail,
      status: "failed",
      error: "Resend not configured",
    });
    return false;
  }

  if (isUsingResendTestDomain()) {
    await logNotification({
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      channel: "email",
      type: "cancellation",
      recipient: booking.customerEmail,
      status: "skipped",
      error: "Resend test domain",
    });
    return false;
  }

  const { error } = await resend.emails.send({
    from: resolveEmailFrom(),
    to: booking.customerEmail,
    subject,
    html,
    text,
  });

  if (error) {
    await logNotification({
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      channel: "email",
      type: "cancellation",
      recipient: booking.customerEmail,
      status: "failed",
      error: error.message,
    });
    return false;
  }

  await logNotification({
    bookingId: booking.id,
    referenceCode: booking.referenceCode,
    channel: "email",
    type: "cancellation",
    recipient: booking.customerEmail,
    status: "sent",
  });
  return true;
}
