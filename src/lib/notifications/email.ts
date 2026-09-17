import { Resend } from "resend";
import {
  buildConfirmationEmail,
  buildReminderEmail,
} from "./templates";
import type { Booking } from "../types";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const fromEmail =
  process.env.EMAIL_FROM ?? "Pho Ta <bookings@photarestaurants.com>";

export async function sendConfirmationEmail(
  booking: Booking,
): Promise<boolean> {
  const resend = getResend();
  const { subject, html, text } = buildConfirmationEmail(booking);

  if (!resend) {
    console.log("[email:confirmation]", { to: booking.customerEmail, subject, text });
    return true;
  }

  const { error } = await resend.emails.send({
    from: fromEmail,
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

export async function sendReminderEmail(booking: Booking): Promise<boolean> {
  const resend = getResend();
  const { subject, html, text } = buildReminderEmail(booking);

  if (!resend) {
    console.log("[email:reminder]", { to: booking.customerEmail, subject, text });
    return true;
  }

  const { error } = await resend.emails.send({
    from: fromEmail,
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
