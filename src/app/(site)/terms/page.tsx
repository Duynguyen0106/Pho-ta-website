import type { Metadata } from "next";
import {
  LegalLayout,
  LegalList,
  LegalSection,
} from "@/components/legal/LegalLayout";
import { LEGAL_CONTACT_EMAIL } from "@/lib/data/legal";
import { locations } from "@/lib/data/locations";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms and conditions for using the Pho Ta website and making online reservations.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      currentPath="/terms"
      title="Terms of Use"
      description="Rules for using our website and booking a table at Pho Ta."
    >
      <LegalSection title="1. Agreement">
        <p>
          By accessing photarestaurants.com, phota.vercel.app, or any Pho Ta
          website (the &ldquo;Site&rdquo;) and making a reservation, you agree
          to these Terms of Use and our{" "}
          <a href="/privacy" className="text-gold hover:underline">
            Privacy policy
          </a>
          . If you do not agree, please do not use the Site.
        </p>
      </LegalSection>

      <LegalSection title="2. About Pho Ta">
        <p>
          Pho Ta Restaurant trades at two London venues operated as part of the
          Pho Ta group. Contact details for each branch are on our{" "}
          <a href="/locations" className="text-gold hover:underline">
            Locations
          </a>{" "}
          page.
        </p>
      </LegalSection>

      <LegalSection title="3. Website use">
        <LegalList
          items={[
            "You must provide accurate information when booking",
            "You must not misuse the Site, attempt unauthorised access, or disrupt our systems",
            "Content on the Site (text, images, menus) is owned by Pho Ta and may not be copied without permission",
            "We may update, suspend, or withdraw parts of the Site without notice",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Reservations">
        <LegalList
          items={[
            "An online booking is a request for a table. We will confirm by email where possible and always show a reference on screen",
            "Bookings are subject to availability. We may contact you if we need to amend your reservation",
            "Please arrive on time. We may release your table if you are significantly late — call the restaurant if you are delayed",
            "For changes or cancellations, contact the branch directly and quote your reference. We appreciate at least two hours’ notice when possible",
            "Repeated no-shows may affect future bookings",
            "We reserve the right to refuse service in line with our house policies and UK law",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Menu, prices & promotions">
        <p>
          Menus and prices on the Site are for guidance. Dishes, ingredients,
          and prices may change without notice. The menu served in the
          restaurant on the day of your visit applies. Lunch and daily menus
          differ by location — check the{" "}
          <a href="/menu" className="text-gold hover:underline">
            Menu
          </a>{" "}
          page for your chosen branch.
        </p>
      </LegalSection>

      <LegalSection title="6. Allergies & dietary requirements">
        <p>
          We take allergens seriously but cannot guarantee an allergen-free
          environment. You are responsible for informing us of allergies and
          dietary needs when booking and again on arrival. Full guidance is in
          our{" "}
          <a href="/food-safety" className="text-gold hover:underline">
            Food hygiene & allergies
          </a>{" "}
          policy. Pho Ta is not liable for reactions where we were not
          informed of a relevant allergy or requirement.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitation of liability">
        <p>
          To the fullest extent permitted by law, Pho Ta shall not be liable for
          indirect or consequential loss arising from use of the Site or a
          booking. Nothing in these terms excludes liability for death or
          personal injury caused by negligence, fraud, or any liability that
          cannot be excluded under English law.
        </p>
        <p>
          The Site is provided &ldquo;as is&rdquo;. We do not warrant
          uninterrupted or error-free operation.
        </p>
      </LegalSection>

      <LegalSection title="8. Third-party links">
        <p>
          The Site may link to external services (e.g. maps). We are not
          responsible for their content or privacy practices.
        </p>
      </LegalSection>

      <LegalSection title="9. Governing law">
        <p>
          These terms are governed by the laws of England and Wales. Disputes
          are subject to the exclusive jurisdiction of the courts of England and
          Wales.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Questions about these terms:{" "}
          <a
            href={`mailto:${LEGAL_CONTACT_EMAIL}`}
            className="text-gold hover:underline"
          >
            {LEGAL_CONTACT_EMAIL}
          </a>
          , or call{" "}
          {locations.map((l) => (
            <span key={l.slug}>
              {l.shortName}{" "}
              <a
                href={`tel:${l.phone.replace(/\s/g, "")}`}
                className="text-gold hover:underline"
              >
                {l.phone}
              </a>
              {l.slug === "kentish-town" ? " · " : ""}
            </span>
          ))}
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
