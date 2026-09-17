import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/BookingForm";
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
    <>
      <section className="border-b border-gold/15 bg-surface-alt/60">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="label-caps">Reservations</p>
          <h1 className="mt-4 font-display text-5xl font-normal tracking-wide text-foreground sm:text-6xl">
            Book a Table
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-xl leading-relaxed text-muted">
            An intimate evening awaits. Select your venue, time, and seating —
            we will confirm your reservation by email and show a reference on
            screen to save or print.
          </p>
          <div className="gold-line mx-auto mt-8 w-20" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <BookingForm defaultLocation={defaultLocation} />
      </div>
    </>
  );
}
