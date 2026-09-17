import { format, parse } from "date-fns";
import { isDailyReminderMode } from "../bookings/reminders";
import { SEATING_LABELS } from "../constants";
import { getLocation } from "../data/locations";
import type { Booking } from "../types";

function formatBookingDateTime(booking: Booking): string {
  const date = parse(booking.date, "yyyy-MM-dd", new Date());
  const formattedDate = format(date, "EEE d MMM yyyy");
  const [hours, minutes] = booking.time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 || 12;
  return `${formattedDate} at ${displayHour}:${minutes}${ampm}`;
}

export function buildConfirmationEmail(booking: Booking): {
  subject: string;
  html: string;
  text: string;
} {
  const location = getLocation(booking.locationSlug)!;
  const seating = SEATING_LABELS[booking.seatingPreference];
  const dateTime = formatBookingDateTime(booking);

  const subject = `Booking confirmed — Pho Ta ${location.shortName}`;

  const text = `Dear ${booking.customerName},

Your table at Pho Ta ${location.shortName} is confirmed.

Reference: ${booking.referenceCode}
Guests: ${booking.partySize}
Date & time: ${dateTime}
Seating preference: ${seating}
${booking.specialRequests ? `Special requests: ${booking.specialRequests}\n` : ""}
Address: ${location.address}, ${location.postcode}
Phone: ${location.phone}

We look forward to welcoming you.

Pho Ta Restaurant`;

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2d2d2d;">
      <div style="background: #1a3c34; color: #faf7f2; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: normal;">Pho Ta</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Booking Confirmed</p>
      </div>
      <div style="padding: 32px 24px; background: #faf7f2;">
        <p>Dear ${booking.customerName},</p>
        <p>Your table at <strong>Pho Ta ${location.shortName}</strong> is confirmed.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr><td style="padding: 8px 0; color: #666;">Reference</td><td style="padding: 8px 0;"><strong>${booking.referenceCode}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Guests</td><td style="padding: 8px 0;">${booking.partySize}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Date & time</td><td style="padding: 8px 0;">${dateTime}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Seating</td><td style="padding: 8px 0;">${seating}</td></tr>
          ${booking.specialRequests ? `<tr><td style="padding: 8px 0; color: #666;">Requests</td><td style="padding: 8px 0;">${booking.specialRequests}</td></tr>` : ""}
        </table>
        <p style="color: #666; font-size: 14px;">
          ${location.address}, ${location.postcode}<br/>
          ${location.phone}
        </p>
        <p>We look forward to welcoming you.</p>
      </div>
    </div>
  `;

  return { subject, html, text };
}

export function buildReminderEmail(booking: Booking): {
  subject: string;
  html: string;
  text: string;
} {
  const location = getLocation(booking.locationSlug)!;
  const seating = SEATING_LABELS[booking.seatingPreference];
  const dateTime = formatBookingDateTime(booking);

  const daily = isDailyReminderMode();
  const leadLine = daily
    ? "Reminder: your table at Pho Ta is today."
    : "Reminder: your table at Pho Ta is in about 2 hours.";

  const subject = `Reminder: Your Pho Ta booking today`;

  const text = `Hi ${booking.customerName},

${leadLine}

Guests: ${booking.partySize}
Time: ${dateTime}
Seating: ${seating}
Reference: ${booking.referenceCode}

${location.address}, ${location.postcode}
${location.phone}

See you soon!`;

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2d2d2d;">
      <div style="background: #1a3c34; color: #faf7f2; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Booking Reminder</h1>
      </div>
      <div style="padding: 32px 24px; background: #faf7f2;">
        <p>Hi ${booking.customerName},</p>
        <p>${leadLine.replace("Pho Ta", `<strong>Pho Ta ${location.shortName}</strong>`)}</p>
        <p><strong>${booking.partySize} guests</strong> · ${dateTime}<br/>Seating: ${seating}<br/>Ref: ${booking.referenceCode}</p>
        <p style="color: #666;">${location.address}, ${location.postcode}</p>
        <p>See you soon!</p>
      </div>
    </div>
  `;

  return { subject, html, text };
}

export function buildConfirmationSms(booking: Booking): string {
  const location = getLocation(booking.locationSlug)!;
  const seating = SEATING_LABELS[booking.seatingPreference];
  const [hours, minutes] = booking.time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 || 12;

  return `Pho Ta ${location.shortName}: Table for ${booking.partySize}, ${booking.date} ${displayHour}:${minutes}${ampm}. Seating: ${seating}. Ref ${booking.referenceCode}. Call ${location.phone} to change.`;
}

export function buildReminderSms(booking: Booking): string {
  const location = getLocation(booking.locationSlug)!;
  const seating = SEATING_LABELS[booking.seatingPreference];
  const [hours, minutes] = booking.time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 || 12;

  return `Reminder: Pho Ta ${location.shortName} today at ${displayHour}:${minutes}${ampm} for ${booking.partySize} (${seating.toLowerCase()}). Ref ${booking.referenceCode}. See you soon!`;
}
