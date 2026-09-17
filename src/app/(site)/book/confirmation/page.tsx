import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
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

  return (
    <div className="mx-auto max-w-lg px-6 py-28 text-center">
      <div className="gold-line mx-auto mb-10 w-16" />
      <p className="text-base uppercase tracking-[0.16em] text-gold">
        Confirmed
      </p>
      <h1 className="mt-4 font-display text-5xl font-normal text-foreground">
        We await your arrival
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-muted">
        Thank you, {booking.customerName}. A confirmation has been sent to your
        email and phone. We shall remind you before your visit.
      </p>

      <div className="mt-10 luxury-card p-8 text-left text-lg">
        <p className={labelStyle}>Reference</p>
        <p className="mt-1 font-serif text-2xl text-gold">{booking.referenceCode}</p>
        <dl className="mt-6 space-y-3 text-muted">
          <Row label="Venue" value={location.shortName} />
          <Row label="Date" value={booking.date} />
          <Row label="Time" value={booking.time} />
          <Row label="Guests" value={String(booking.partySize)} />
          <Row label="Seating" value={SEATING_LABELS[booking.seatingPreference]} />
        </dl>
      </div>

      <Link href="/" className="mt-10 inline-block">
        <Button variant="outline">Return home</Button>
      </Link>
    </div>
  );
}

const labelStyle = "text-base uppercase tracking-[0.1em] text-gold";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gold/10 pb-3">
      <dt className={labelStyle}>{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
