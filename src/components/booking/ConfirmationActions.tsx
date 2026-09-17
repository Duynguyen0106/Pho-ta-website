"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { buildBookingIcs, formatBookingDateTime } from "@/lib/bookings/calendar";

export interface ConfirmationDetails {
  referenceCode: string;
  customerName: string;
  customerEmail: string;
  locationSlug: string;
  locationName: string;
  locationShortName: string;
  locationAddress: string;
  locationPostcode: string;
  locationPhone: string;
  locationEmail: string;
  mapUrl: string;
  date: string;
  time: string;
  partySize: number;
  seatingLabel: string;
  specialRequests?: string;
}

function buildMailtoHref(details: ConfirmationDetails): string {
  const dateTime = formatBookingDateTime(details.date, details.time);
  const subject = encodeURIComponent(
    `Pho Ta reservation — ${details.referenceCode}`,
  );
  const body = encodeURIComponent(
    [
      `Pho Ta ${details.locationShortName} — reservation confirmed`,
      "",
      `Reference: ${details.referenceCode}`,
      `Guest: ${details.customerName}`,
      `Date & time: ${dateTime}`,
      `Party size: ${details.partySize}`,
      `Seating: ${details.seatingLabel}`,
      details.specialRequests
        ? `Special requests: ${details.specialRequests}`
        : null,
      "",
      `${details.locationAddress}, ${details.locationPostcode}`,
      `Phone: ${details.locationPhone}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return `mailto:${details.customerEmail}?subject=${subject}&body=${body}`;
}

export function ConfirmationActions({ details }: { details: ConfirmationDetails }) {
  const [copied, setCopied] = useState(false);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(details.referenceCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function downloadCalendar() {
    const ics = buildBookingIcs({
      referenceCode: details.referenceCode,
      customerName: details.customerName,
      location: {
        slug: details.locationSlug as "finchley-road",
        name: details.locationName,
        shortName: details.locationShortName,
        address: details.locationAddress,
        city: "London",
        postcode: details.locationPostcode,
        phone: details.locationPhone,
        email: details.locationEmail,
        mapUrl: details.mapUrl,
        maxCoversPerSlot: 0,
        openTime: "11:30",
        closeTime: "21:30",
        slotIntervalMinutes: 30,
      },
      date: details.date,
      time: details.time,
      partySize: details.partySize,
      seatingLabel: details.seatingLabel,
      specialRequests: details.specialRequests,
    });

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pho-ta-${details.referenceCode}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-10 space-y-6 print:hidden">
      <p className="text-base text-muted">
        Keep this page as your reference. You can print it, add the visit to
        your calendar, or email the details to yourself.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <Button type="button" className="w-full sm:w-auto" onClick={() => window.print()}>
          Print confirmation
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={copyReference}
        >
          {copied ? "Copied" : "Copy reference"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={downloadCalendar}
        >
          Add to calendar
        </Button>
        <a href={buildMailtoHref(details)} className="inline-flex w-full sm:w-auto">
          <Button type="button" variant="outline" className="w-full">
            Email to myself
          </Button>
        </a>
      </div>

      <p className="text-sm text-muted">
        Need to change your booking? Call{" "}
        <a href={`tel:${details.locationPhone.replace(/\s/g, "")}`} className="text-gold hover:text-gold-light">
          {details.locationPhone}
        </a>{" "}
        and quote reference{" "}
        <span className="font-serif text-foreground">{details.referenceCode}</span>.
      </p>
    </div>
  );
}
