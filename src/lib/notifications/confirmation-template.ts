import { format, parse } from "date-fns";
import { SEATING_LABELS } from "../constants";
import { getLocation } from "../data/locations";
import type { Booking } from "../types";

export interface ConfirmationEmailContext {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  referenceCode: string;
  venueName: string;
  venueShortName: string;
  venueAddress: string;
  venuePostcode: string;
  venuePhone: string;
  venueEmail: string;
  mapUrl: string;
  dateTime: string;
  partySize: number;
  partyLabel: string;
  seating: string;
  specialRequests?: string;
  confirmationUrl: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://phota.vercel.app"
  );
}

function formatBookingDateTime(date: string, time: string): string {
  const parsed = parse(date, "yyyy-MM-dd", new Date());
  const formattedDate = format(parsed, "EEE d MMM yyyy");
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 || 12;
  return `${formattedDate} at ${displayHour}:${minutes}${ampm}`;
}

export function buildConfirmationEmailContext(
  booking: Booking,
): ConfirmationEmailContext {
  const location = getLocation(booking.locationSlug)!;
  const baseUrl = siteBaseUrl();

  return {
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    referenceCode: booking.referenceCode,
    venueName: location.name,
    venueShortName: location.shortName,
    venueAddress: location.address,
    venuePostcode: location.postcode,
    venuePhone: location.phone,
    venueEmail: location.email,
    mapUrl: location.mapUrl,
    dateTime: formatBookingDateTime(booking.date, booking.time),
    partySize: booking.partySize,
    partyLabel: booking.partySize === 1 ? "1 guest" : `${booking.partySize} guests`,
    seating: SEATING_LABELS[booking.seatingPreference],
    specialRequests: booking.specialRequests?.trim() || undefined,
    confirmationUrl: `${baseUrl}/book/confirmation?ref=${encodeURIComponent(booking.referenceCode)}`,
  };
}

function detailRow(label: string, value: string): string {
  return `
    <tr style="border-top: 1px solid #c9a96220;">
      <td style="padding: 12px 0; color: #c9a962; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; vertical-align: top; width: 42%;">${escapeHtml(label)}</td>
      <td style="padding: 12px 0; text-align: right; color: #f5f0e6; font-size: 15px; line-height: 1.5;">${escapeHtml(value)}</td>
    </tr>`;
}

export function renderConfirmationEmail(ctx: ConfirmationEmailContext): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Reservation confirmed — Pho Ta ${ctx.venueShortName}`;

  const text = `Dear ${ctx.customerName},

Your reservation at Pho Ta ${ctx.venueShortName} is confirmed.

Reference: ${ctx.referenceCode}
Guest name: ${ctx.customerName}
Email: ${ctx.customerEmail}
Phone: ${ctx.customerPhone}
Guests: ${ctx.partyLabel}
Date & time: ${ctx.dateTime}
Seating preference: ${ctx.seating}
${ctx.specialRequests ? `Special requests: ${ctx.specialRequests}\n` : ""}
Venue: ${ctx.venueName}
Address: ${ctx.venueAddress}, ${ctx.venuePostcode}
Phone: ${ctx.venuePhone}

View your confirmation online:
${ctx.confirmationUrl}

We look forward to welcoming you.

Pho Ta Restaurant`;

  const rows = [
    detailRow("Reference", ctx.referenceCode),
    detailRow("Guest", ctx.customerName),
    detailRow("Email", ctx.customerEmail),
    detailRow("Phone", ctx.customerPhone),
    detailRow("Guests", ctx.partyLabel),
    detailRow("Date & time", ctx.dateTime),
    detailRow("Seating", ctx.seating),
    ...(ctx.specialRequests
      ? [detailRow("Special requests", ctx.specialRequests)]
      : []),
    detailRow("Venue", ctx.venueName),
  ].join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
  <body style="margin: 0; padding: 24px; background: #0f0d0b;">
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; background: #0a0908; color: #f5f0e6; border: 1px solid #c9a96230;">
      <div style="padding: 40px 32px; text-align: center; border-bottom: 1px solid #c9a96240;">
        <p style="margin: 0; font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; color: #c9a962;">Pho Ta</p>
        <h1 style="margin: 16px 0 0; font-size: 28px; font-weight: 300; letter-spacing: 0.05em; color: #f5f0e6;">Reservation Confirmed</h1>
        <p style="margin: 12px 0 0; font-size: 14px; color: #9a9085;">${escapeHtml(ctx.venueShortName)}</p>
      </div>
      <div style="padding: 40px 32px;">
        <p style="margin: 0 0 16px; color: #9a9085; font-size: 16px; line-height: 1.6;">Dear ${escapeHtml(ctx.customerName)},</p>
        <p style="margin: 0 0 24px; color: #f5f0e6; font-size: 16px; line-height: 1.6;">
          We are honoured to confirm your table at
          <strong style="color: #c9a962;">Pho Ta ${escapeHtml(ctx.venueShortName)}</strong>.
          Please find your reservation details below.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 0 0 28px; font-size: 14px;">
          ${rows}
        </table>
        <div style="padding: 20px; background: #141210; border: 1px solid #c9a96225; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #c9a962;">Location</p>
          <p style="margin: 0; color: #f5f0e6; line-height: 1.6;">
            ${escapeHtml(ctx.venueAddress)}<br/>
            ${escapeHtml(ctx.venuePostcode)}<br/>
            <a href="tel:${escapeHtml(ctx.venuePhone.replace(/\s/g, ""))}" style="color: #c9a962; text-decoration: none;">${escapeHtml(ctx.venuePhone)}</a>
          </p>
          <p style="margin: 16px 0 0;">
            <a href="${escapeHtml(ctx.mapUrl)}" style="color: #c9a962; font-size: 14px; text-decoration: underline;">View on map</a>
          </p>
        </div>
        <p style="margin: 0 0 24px; text-align: center;">
          <a href="${escapeHtml(ctx.confirmationUrl)}" style="display: inline-block; border: 1px solid #c9a962; color: #c9a962; padding: 14px 28px; text-decoration: none; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;">View confirmation online</a>
        </p>
        <p style="margin: 0; color: #9a9085; font-size: 14px; line-height: 1.6; text-align: center;">
          We look forward to welcoming you.<br/>
          To change or cancel, please call ${escapeHtml(ctx.venuePhone)}.
        </p>
      </div>
      <div style="padding: 20px 32px; border-top: 1px solid #c9a96220; text-align: center;">
        <p style="margin: 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b645c;">Pho Ta Restaurant · London</p>
      </div>
    </div>
  </body>
</html>`;

  return { subject, html, text };
}

export function buildConfirmationEmailFromBooking(booking: Booking): {
  subject: string;
  html: string;
  text: string;
  recipient: string;
  context: ConfirmationEmailContext;
} {
  const context = buildConfirmationEmailContext(booking);
  const email = renderConfirmationEmail(context);
  return {
    ...email,
    recipient: booking.customerEmail,
    context,
  };
}
