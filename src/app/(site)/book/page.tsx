import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/BookingForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { LocationSlug } from "@/lib/types";

export const metadata: Metadata = {
  title: "Reservations",
  description: "Reserve your table at Pho Ta Kentish Town or Finchley Road.",
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
    <div className="mx-auto max-w-2xl px-6 py-24">
      <SectionHeading
        eyebrow="Reservations"
        title="Book a Table"
        description="Select your preferred date, time, and seating. Confirmation will be sent by email and SMS."
      />

      <div className="mt-16 luxury-card p-8 sm:p-10">
        <BookingForm defaultLocation={defaultLocation} />
      </div>
    </div>
  );
}
