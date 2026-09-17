import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmationActions } from "@/components/booking/ConfirmationActions";
import { Button } from "@/components/ui/Button";
import { formatBookingDateTime } from "@/lib/bookings/calendar";
import { SEATING_LABELS } from "@/lib/constants";
import { getLocation } from "@/lib/data/locations";
import { getBookingByReference } from "@/lib/db/store";

export const metadata: Metadata = {
  title: "Reservation Confirmed",
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  const booking = params.ref
    ? await getBookingByReference(params.ref)
    : null;

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg px-6 py-28 text-center">
        <h1 className="font-serif text-4xl font-normal text-foreground">
          Reservation not found
        </h1>
        <Link href="/book" className="mt-10 inline-block">
          <Button>Make a reservation</Button>
        </Link>
      </div>
    );
  }

  const location = getLocation(booking.locationSlug)!;
  const dateTime = formatBookingDateTime(booking.date, booking.time);
  const seatingLabel = SEATING_LABELS[booking.seatingPreference];

  return (
    <div className="mx-auto max-w-2xl px-6 py-28 text-center">
      <div className="gold-line mx-auto mb-10 w-16 print:hidden" />
      <p className="text-base uppercase tracking-[0.16em] text-gold">Confirmed</p>
      <h1 className="mt-4 font-display text-5xl font-normal text-foreground">
        We await your arrival
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-muted">
        Thank you, {booking.customerName}. Your table at Pho Ta{" "}
        {location.shortName} is reserved for {dateTime}.
        {booking.confirmationSentAt ? (
          <>
            {" "}
            We have sent a confirmation to{" "}
            <span className="text-foreground">{booking.customerEmail}</span>.
          </>
        ) : (
          <>
            {" "}
            A confirmation will be sent to{" "}
            <span className="text-foreground">{booking.customerEmail}</span>.
          </>
        )}{" "}
        Please also save this page or print it before you leave.
      </p>

      <div
        id="confirmation-details"
        className="confirmation-print mt-10 luxury-card p-8 text-left text-lg"
      >
        <div className="border-b border-gold/15 pb-6 text-center print:border-black/20">
          <p className="text-sm uppercase tracking-[0.2em] text-gold print:text-black">
            Pho Ta · Reservation confirmed
          </p>
          <p className="mt-2 font-display text-3xl text-foreground print:text-black">
            {location.shortName}
          </p>
        </div>

        <p className={labelStyle}>Reference</p>
        <p className="mt-1 font-serif text-2xl text-gold print:text-black">
          {booking.referenceCode}
        </p>

        <dl className="mt-6 space-y-3 text-muted print:text-black">
          <Row label="Guest" value={booking.customerName} />
          <Row label="Venue" value={location.shortName} />
          <Row label="Date & time" value={dateTime} />
          <Row label="Guests" value={String(booking.partySize)} />
          <Row label="Seating" value={seatingLabel} />
          {booking.specialRequests ? (
            <Row label="Requests" value={booking.specialRequests} />
          ) : null}
        </dl>

        <div className="mt-8 border-t border-gold/15 pt-6 text-base text-muted print:border-black/20 print:text-black">
          <p>{location.address}</p>
          <p>{location.postcode}</p>
          <p className="mt-2">{location.phone}</p>
        </div>
      </div>

      <ConfirmationActions
        details={{
          referenceCode: booking.referenceCode,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          locationSlug: booking.locationSlug,
          locationName: location.name,
          locationShortName: location.shortName,
          locationAddress: location.address,
          locationPostcode: location.postcode,
          locationPhone: location.phone,
          locationEmail: location.email,
          mapUrl: location.mapUrl,
          date: booking.date,
          time: booking.time,
          partySize: booking.partySize,
          seatingLabel,
          specialRequests: booking.specialRequests,
        }}
      />

      <Link href="/" className="mt-10 inline-block print:hidden">
        <Button variant="outline">Return home</Button>
      </Link>
    </div>
  );
}

const labelStyle = "text-base uppercase tracking-[0.1em] text-gold print:text-black";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 border-b border-gold/10 pb-3 print:border-black/15">
      <dt className={labelStyle}>{label}</dt>
      <dd className="text-right text-foreground print:text-black">{value}</dd>
    </div>
  );
}
