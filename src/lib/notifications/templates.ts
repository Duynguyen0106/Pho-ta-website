import { format, parse } from "date-fns";
import { isDailyReminderMode } from "../bookings/reminders";
import { SEATING_LABELS } from "../constants";
import { getLocation } from "../data/locations";
import type { Booking } from "../types";
import { buildConfirmationEmailFromBooking } from "./confirmation-template";

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
  const { subject, html, text } = buildConfirmationEmailFromBooking(booking);
  return { subject, html, text };
}

export function buildRestaurantNotificationEmail(booking: Booking): {
  subject: string;
  html: string;
  text: string;
} {
  const location = getLocation(booking.locationSlug)!;
  const seating = SEATING_LABELS[booking.seatingPreference];
  const dateTime = formatBookingDateTime(booking);

  const subject = `New booking — ${location.shortName} · ${booking.referenceCode}`;

  const text = `New online reservation

Reference: ${booking.referenceCode}
Guest: ${booking.customerName}
Email: ${booking.customerEmail}
Phone: ${booking.customerPhone}
Venue: ${location.shortName}
Guests: ${booking.partySize}
Date & time: ${dateTime}
Seating: ${seating}
${booking.specialRequests ? `Special requests: ${booking.specialRequests}` : ""}`;

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto;">
      <h1 style="font-size: 22px; font-weight: 400;">New online reservation</h1>
      <p><strong>${booking.referenceCode}</strong></p>
      <ul style="line-height: 1.8;">
        <li><strong>Guest:</strong> ${booking.customerName}</li>
        <li><strong>Email:</strong> ${booking.customerEmail}</li>
        <li><strong>Phone:</strong> ${booking.customerPhone}</li>
        <li><strong>Venue:</strong> ${location.shortName}</li>
        <li><strong>Party:</strong> ${booking.partySize}</li>
        <li><strong>When:</strong> ${dateTime}</li>
        <li><strong>Seating:</strong> ${seating}</li>
        ${booking.specialRequests ? `<li><strong>Requests:</strong> ${booking.specialRequests}</li>` : ""}
      </ul>
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
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background: #0a0908; color: #f5f0e6;">
      <div style="padding: 40px 32px; text-align: center; border-bottom: 1px solid #c9a96240;">
        <p style="margin: 0; font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; color: #c9a962;">Reminder</p>
        <h1 style="margin: 16px 0 0; font-size: 24px; font-weight: 300;">We await your arrival</h1>
      </div>
      <div style="padding: 40px 32px;">
        <p style="color: #9a9085;">Dear ${booking.customerName},</p>
        <p>${leadLine.replace("Pho Ta", `<strong style="color: #c9a962;">Pho Ta ${location.shortName}</strong>`)}</p>
        <p style="margin-top: 24px;"><strong>${booking.partySize} guests</strong> · ${dateTime}<br/>Seating: ${seating}<br/>Ref: ${booking.referenceCode}</p>
        <p style="color: #9a9085; margin-top: 16px;">${location.address}, ${location.postcode}</p>
      </div>
    </div>
  `;

  return { subject, html, text };
}

export function buildCancellationEmail(booking: Booking): {
  subject: string;
  html: string;
  text: string;
} {
  const location = getLocation(booking.locationSlug)!;
  const dateTime = formatBookingDateTime(booking);
  const subject = `Reservation cancelled — Pho Ta ${location.shortName}`;

  const text = `Dear ${booking.customerName},

Your reservation at Pho Ta ${location.shortName} has been cancelled.

Reference: ${booking.referenceCode}
Was booked for: ${dateTime}
Guests: ${booking.partySize}

To make a new reservation, visit our website or call ${location.phone}.

Pho Ta Restaurant`;

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background: #0a0908; color: #f5f0e6;">
      <div style="padding: 40px 32px; text-align: center; border-bottom: 1px solid #c9a96240;">
        <p style="margin: 0; font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; color: #c9a962;">Pho Ta</p>
        <h1 style="margin: 16px 0 0; font-size: 28px; font-weight: 300;">Reservation Cancelled</h1>
      </div>
      <div style="padding: 40px 32px;">
        <p style="color: #9a9085;">Dear ${booking.customerName},</p>
        <p>Your table at <strong style="color: #c9a962;">Pho Ta ${location.shortName}</strong> on ${dateTime} has been cancelled.</p>
        <p style="margin-top: 24px; color: #9a9085;">Reference: ${booking.referenceCode}</p>
        <p style="color: #9a9085; margin-top: 16px;">${location.phone}</p>
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
