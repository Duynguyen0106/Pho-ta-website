import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/BookingForm";

export const metadata: Metadata = {
  title: "Reservations",
  description: "Reserve your table at Pho Ta Finchley Road.",
};

export default function BookPage() {
  return (
    <>
      <section className="border-b border-gold/15 bg-surface-alt/60">
        <div className="mx-auto max-w-6xl px-6 py-10 text-center sm:py-20">
          <p className="label-caps">Reservations</p>
          <h1 className="mt-3 font-display text-4xl font-normal tracking-wide text-foreground sm:mt-4 sm:text-6xl">
            Book a Table
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted sm:mt-6 sm:text-xl">
            Choose your date, time, and seating. We confirm by email and show a
            reference to save or print.
          </p>
          <div className="gold-line mx-auto mt-6 w-20 sm:mt-8" />
        </div>
      </section>

      <div className="mx-auto min-w-0 max-w-6xl overflow-x-hidden px-4 py-8 pb-24 sm:px-6 sm:py-16 sm:pb-16 lg:py-20">
        <BookingForm />
      </div>
    </>
  );
}
