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
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="label-caps">Reservations</p>
          <h1 className="mt-4 font-display text-5xl font-normal tracking-wide text-foreground sm:text-6xl">
            Book a Table
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-xl leading-relaxed text-muted">
            An intimate evening awaits at Pho Ta Finchley Road. Choose your time
            and seating — we will confirm your reservation by email and show a
            reference on screen to save or print.
          </p>
          <div className="gold-line mx-auto mt-8 w-20" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <BookingForm />
      </div>
    </>
  );
}
