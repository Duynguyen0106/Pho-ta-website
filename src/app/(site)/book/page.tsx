import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/BookingForm";
import type { LocationSlug } from "@/lib/types";

export const metadata: Metadata = {
  title: "Book a Table",
  description: "Reserve a table at Pho Ta Kentish Town or Finchley Road online.",
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const params = await searchParams;
  const defaultLocation =
    params.location === "kentish-town" || params.location === "finchley-road"
      ? (params.location as LocationSlug)
      : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-[#c9a962]">
          Reservations
        </p>
        <h1 className="mt-2 font-serif text-4xl text-[#1a3c34]">Book a Table</h1>
        <p className="mt-4 text-[#5c534a]">
          Choose your location, time, and seating preference. We&apos;ll confirm
          by email and SMS, and remind you 2 hours before.
        </p>
      </div>

      <div className="mt-12 rounded-2xl border border-[#e8e0d4] bg-white p-6 shadow-sm sm:p-8">
        <BookingForm defaultLocation={defaultLocation} />
      </div>
    </div>
  );
}
