import type { Metadata } from "next";
import {
  LegalLayout,
  LegalList,
  LegalSection,
} from "@/components/legal/LegalLayout";
import { LEGAL_CONTACT_EMAIL } from "@/lib/data/legal";
import { locations } from "@/lib/data/locations";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Pho Ta Restaurant collects, uses, and protects your personal data when you book online or contact us.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      currentPath="/privacy"
      title="Privacy Policy"
      description="How we handle your personal information when you use our website and booking service."
    >
      <LegalSection title="1. Who we are">
        <p>
          Pho Ta Restaurant operates Vietnamese dining at two locations in
          London:{" "}
          {locations.map((l) => `${l.shortName} (${l.address})`).join(" and ")}.
          We are the data controller for personal information collected through
          this website and our online reservation system.
        </p>
        <p>
          For privacy enquiries or to exercise your rights, contact us at{" "}
          <a
            href={`mailto:${LEGAL_CONTACT_EMAIL}`}
            className="text-gold hover:underline"
          >
            {LEGAL_CONTACT_EMAIL}
          </a>
          , or call either branch during opening hours.
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>When you make a reservation or contact us, we may collect:</p>
        <LegalList
          items={[
            "Your name, email address, and telephone number",
            "Reservation details: date, time, party size, venue, and seating preference",
            "Special requests you choose to provide (e.g. dietary needs, celebrations, accessibility)",
            "Booking reference, status, and whether confirmations or reminders were sent",
            "Technical data when you use the site (browser type, IP address, pages visited) through our hosting provider",
          ]}
        />
        <p>
          We do not intentionally collect sensitive personal data. If you
          mention allergies or health-related needs in special requests, we
          treat that information carefully to serve you safely — see our{" "}
          <a href="/food-safety" className="text-gold hover:underline">
            Food hygiene & allergies
          </a>{" "}
          page.
        </p>
      </LegalSection>

      <LegalSection title="3. How and why we use your data">
        <p>We use your information to:</p>
        <LegalList
          items={[
            "Process and manage your table reservation",
            "Send booking confirmations and reminders by email (and SMS if enabled)",
            "Notify restaurant staff of new bookings",
            "Contact you about changes, cancellations, or questions regarding your visit",
            "Maintain customer records and booking history for repeat guests (admin use)",
            "Improve our service and keep our website secure",
          ]}
        />
        <p>
          Our lawful bases under UK GDPR include:{" "}
          <strong className="text-foreground">performance of a contract</strong>{" "}
          (honouring your booking),{" "}
          <strong className="text-foreground">consent</strong> (where you agree
          to receive email communications), and{" "}
          <strong className="text-foreground">legitimate interests</strong>{" "}
          (running our restaurants safely and efficiently).
        </p>
      </LegalSection>

      <LegalSection title="4. Email and SMS">
        <p>
          Booking confirmations and reminders are sent by email. We may use a
          transactional email provider (such as Resend) or secure SMTP (e.g.
          our restaurant email account) to deliver messages. If SMS reminders
          are enabled, messages may be sent via Twilio using the mobile number
          you provide.
        </p>
        <p>
          You can withdraw consent for marketing at any time — we do not send
          promotional emails unless you separately opt in. Service messages
          about your booking are part of managing your reservation.
        </p>
      </LegalSection>

      <LegalSection title="5. Who we share data with">
        <p>
          We use trusted service providers who process data on our instructions:
        </p>
        <LegalList
          items={[
            "Supabase — secure database hosting for bookings and customer records",
            "Vercel — website hosting and infrastructure",
            "Email delivery — Resend and/or SMTP (restaurant email)",
            "Twilio — SMS notifications (when configured)",
          ]}
        />
        <p>
          We do not sell your personal data. We may disclose information if
          required by law or to protect the rights and safety of our guests and
          staff.
        </p>
      </LegalSection>

      <LegalSection title="6. Confidentiality">
        <p>
          Information you share about allergies, dietary needs, or special
          occasions is used only to prepare for your visit and improve your
          experience. Staff may record notes on guest profiles for internal
          use (e.g. VIP preferences). We do not publish guest details and
          restrict admin access to authorised personnel only.
        </p>
      </LegalSection>

      <LegalSection title="7. How long we keep your data">
        <LegalList
          items={[
            "Active booking records are kept for the duration of your reservation and a reasonable period afterwards",
            "Customer profiles and booking history may be retained to recognise returning guests and improve service",
            "You may request deletion of your data — we will honour this unless we must retain records for legal or accounting reasons",
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Your rights">
        <p>Under UK data protection law, you have the right to:</p>
        <LegalList
          items={[
            "Access the personal data we hold about you",
            "Request correction of inaccurate data",
            "Request erasure of your data in certain circumstances",
            "Object to or restrict processing in certain circumstances",
            "Data portability where applicable",
            "Withdraw consent where processing is based on consent",
            "Lodge a complaint with the ICO (ico.org.uk)",
          ]}
        />
        <p>
          To make a request, email{" "}
          <a
            href={`mailto:${LEGAL_CONTACT_EMAIL}`}
            className="text-gold hover:underline"
          >
            {LEGAL_CONTACT_EMAIL}
          </a>{" "}
          with your name and booking reference if you have one.
        </p>
      </LegalSection>

      <LegalSection title="9. Cookies">
        <p>
          Our public website uses minimal cookies. Staff admin login uses a
          session cookie. See our{" "}
          <a href="/cookies" className="text-gold hover:underline">
            Cookie policy
          </a>{" "}
          for details.
        </p>
      </LegalSection>

      <LegalSection title="10. Security">
        <p>
          We use industry-standard measures including encrypted connections
          (HTTPS), access controls on admin systems, and reputable cloud
          providers. No method of transmission over the internet is completely
          secure; we work to protect your data and review our practices
          regularly.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to this policy">
        <p>
          We may update this policy from time to time. The date at the top of
          this page shows when it was last revised. Continued use of the website
          after changes constitutes acceptance of the updated policy where
          permitted by law.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
