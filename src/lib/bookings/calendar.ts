import { format, parse } from "date-fns";
import { DEFAULT_DURATION_MINUTES } from "../constants";
import type { Location } from "../types";

function toIcsDateTime(date: string, time: string): string {
  const parsed = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
  return format(parsed, "yyyyMMdd'T'HHmmss");
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function buildBookingIcs(input: {
  referenceCode: string;
  customerName: string;
  location: Location;
  date: string;
  time: string;
  partySize: number;
  seatingLabel: string;
  specialRequests?: string;
}): string {
  const start = toIcsDateTime(input.date, input.time);
  const endDate = parse(`${input.date} ${input.time}`, "yyyy-MM-dd HH:mm", new Date());
  endDate.setMinutes(endDate.getMinutes() + DEFAULT_DURATION_MINUTES);
  const end = format(endDate, "yyyyMMdd'T'HHmmss");
  const stamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");

  const description = [
    `Reference: ${input.referenceCode}`,
    `Guest: ${input.customerName}`,
    `Party: ${input.partySize}`,
    `Seating: ${input.seatingLabel}`,
    input.specialRequests ? `Requests: ${input.specialRequests}` : null,
    `Phone: ${input.location.phone}`,
  ]
    .filter(Boolean)
    .join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pho Ta//Reservations//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:pho-ta-${input.referenceCode}@phota`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(`Pho Ta ${input.location.shortName}`)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(`${input.location.address}, ${input.location.postcode}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function formatBookingDateTime(date: string, time: string): string {
  const parsedDate = parse(date, "yyyy-MM-dd", new Date());
  const formattedDate = format(parsedDate, "EEE d MMM yyyy");
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 || 12;
  return `${formattedDate} at ${displayHour}:${minutes}${ampm}`;
}
