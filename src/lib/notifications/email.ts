import { Resend } from "resend";
import {
  buildConfirmationEmail,
  buildReminderEmail,
  buildRestaurantNotificationEmail,
} from "./templates";
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
    return false;
  }

  // Resend test domain cannot deliver to arbitrary customer addresses yet.
  if (isUsingResendTestDomain()) {
    console.warn(
      "[email:confirmation] Test domain active — customer email skipped until photarestaurants.com is verified on Resend",
      { to: booking.customerEmail },
    );
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
    return false;
  }

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
    return false;
  }

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
    return false;
  }

  return true;
}
