import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Pho Ta Restaurant handles your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <SectionHeading
        align="left"
        eyebrow="Legal"
        title="Privacy Policy"
        description="Last updated September 2026"
      />

      <div className="mt-16 space-y-10 text-base leading-relaxed text-muted">
        <section>
          <h2 className="font-serif text-xl font-normal text-foreground">Who we are</h2>
          <p className="mt-3">
            Pho Ta Restaurant operates fine Vietnamese dining at Kentish Town and
            Finchley Road, London. When you reserve a table, we collect information
            necessary to honour your booking.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-normal text-foreground">What we collect</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Name, email address, and telephone number</li>
            <li>Reservation details and seating preferences</li>
            <li>Special requests you provide voluntarily</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-normal text-foreground">How we use your data</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Confirm and manage your reservation</li>
            <li>Send confirmations and reminders by email and SMS</li>
            <li>Contact you regarding changes to your booking</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-normal text-foreground">Your rights</h2>
          <p className="mt-3">
            You may request access, correction, or deletion of your data by
            contacting{" "}
            <a href="mailto:Phovagrill@gmail.com" className="text-gold hover:underline">
              Phovagrill@gmail.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-normal text-foreground">Third parties</h2>
          <p className="mt-3">
            We use Supabase, Resend, and Twilio to operate our reservation system.
            These providers process data on our behalf under their respective
            privacy terms.
          </p>
        </section>
      </div>

      <Link
        href="/book"
        className="mt-12 inline-block text-sm font-medium uppercase tracking-[0.12em] text-gold hover:text-gold-light"
      >
        ← Return to reservations
      </Link>
    </div>
  );
}
