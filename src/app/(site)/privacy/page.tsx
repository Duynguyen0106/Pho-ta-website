import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Pho Ta Restaurant handles your personal data for bookings.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-4xl text-[#1a3c34]">Privacy Policy</h1>
      <p className="mt-4 text-sm text-[#8a7f72]">Last updated: September 2026</p>

      <div className="prose prose-neutral mt-10 max-w-none space-y-6 text-[#5c534a]">
        <section>
          <h2 className="font-serif text-xl text-[#1a3c34]">Who we are</h2>
          <p className="mt-2 leading-relaxed">
            Pho Ta Restaurant operates Vietnamese restaurants at Kentish Town and
            Finchley Road, London. When you book a table online, we collect the
            information needed to manage your reservation.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-[#1a3c34]">What we collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Name, email address, and phone number</li>
            <li>Booking details (date, time, party size, seating preference)</li>
            <li>Special requests you choose to provide</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-[#1a3c34]">How we use your data</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Confirm and manage your table reservation</li>
            <li>Send booking confirmations and reminders by email and SMS</li>
            <li>Contact you if we need to change or cancel your booking</li>
            <li>Maintain a record of visits to improve service</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-[#1a3c34]">Legal basis</h2>
          <p className="mt-2 leading-relaxed">
            We process your data to fulfil your booking request (contract) and,
            where you agree, to send transactional messages about your
            reservation. We do not use your details for unrelated marketing
            without separate consent.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-[#1a3c34]">How long we keep data</h2>
          <p className="mt-2 leading-relaxed">
            Booking and contact records are kept for up to 2 years for operational
            and legal purposes, then deleted or anonymised.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-[#1a3c34]">Your rights</h2>
          <p className="mt-2 leading-relaxed">
            You may request access, correction, or deletion of your personal data
            by emailing{" "}
            <a href="mailto:Phovagrill@gmail.com" className="text-[#1a3c34] underline">
              Phovagrill@gmail.com
            </a>
            . You may also complain to the ICO (ico.org.uk).
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-[#1a3c34]">Third parties</h2>
          <p className="mt-2 leading-relaxed">
            We use Supabase (database), Resend (email), and Twilio (SMS) to
            operate our booking system. These providers process data on our
            behalf under their own privacy terms.
          </p>
        </section>
      </div>

      <Link
        href="/book"
        className="mt-10 inline-block text-sm font-medium text-[#1a3c34] hover:text-[#c9a962]"
      >
        ← Back to booking
      </Link>
    </div>
  );
}
