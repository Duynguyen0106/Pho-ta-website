import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SEATING_LABELS } from "@/lib/constants";
import { getLocation } from "@/lib/data/locations";
import { getBookingByReference } from "@/lib/db/store";

export const metadata: Metadata = {
  title: "Booking Confirmed",
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
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-serif text-2xl text-[#1a3c34]">Booking not found</h1>
        <Link href="/book" className="mt-6 inline-block">
          <Button>Make a new booking</Button>
        </Link>
      </div>
    );
  }

  const location = getLocation(booking.locationSlug)!;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <CheckCircle className="mx-auto text-[#1a3c34]" size={56} strokeWidth={1.5} />
      <h1 className="mt-6 font-serif text-3xl text-[#1a3c34]">
        Booking Confirmed
      </h1>
      <p className="mt-4 text-[#5c534a]">
        Thank you, {booking.customerName}. A confirmation has been sent to your
        email and phone. We&apos;ll send a reminder before your visit.
      </p>

      <div className="mt-8 rounded-xl border border-[#e8e0d4] bg-white p-6 text-left text-sm">
        <p className="font-medium text-[#1a3c34]">Reference: {booking.referenceCode}</p>
        <dl className="mt-4 space-y-2 text-[#5c534a]">
          <div className="flex justify-between">
            <dt>Location</dt>
            <dd>{location.shortName}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Date</dt>
            <dd>{booking.date}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Time</dt>
            <dd>{booking.time}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Guests</dt>
            <dd>{booking.partySize}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Seating</dt>
            <dd>{SEATING_LABELS[booking.seatingPreference]}</dd>
          </div>
        </dl>
      </div>

      <Link href="/" className="mt-8 inline-block">
        <Button variant="outline">Back to home</Button>
      </Link>
    </div>
  );
}
