import type { Metadata } from "next";
import {
  LegalLayout,
  LegalList,
  LegalSection,
} from "@/components/legal/LegalLayout";
import { LEGAL_CONTACT_EMAIL } from "@/lib/data/legal";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "How Pho Ta Restaurant uses cookies and similar technologies on this website.",
};

export default function CookiesPage() {
  return (
    <LegalLayout
      currentPath="/cookies"
      title="Cookie Policy"
      description="What cookies we use and how you can control them."
    >
      <LegalSection title="1. What are cookies?">
        <p>
          Cookies are small text files stored on your device when you visit a
          website. They help the site work properly and remember preferences.
          Similar technologies (such as local storage) may be used for the same
          purposes.
        </p>
      </LegalSection>

      <LegalSection title="2. Cookies on this website">
        <p>
          Our public guest website is designed to use{" "}
          <strong className="text-foreground">minimal cookies</strong>. We do
          not use advertising or third-party tracking cookies for visitors
          browsing the menu, locations, or booking pages.
        </p>
      </LegalSection>

      <LegalSection title="3. Cookies we use">
        <div className="overflow-x-auto">
          <table className="mt-4 w-full min-w-[520px] border-collapse text-base">
            <thead>
              <tr className="border-b border-gold/20 text-left text-sm uppercase tracking-[0.1em] text-gold">
                <th className="py-3 pr-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Purpose</th>
                <th className="py-3 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-gold/10">
                <td className="py-4 pr-4 font-mono text-sm text-foreground">
                  pho_ta_admin_session
                </td>
                <td className="py-4 pr-4">
                  Staff admin login only — keeps authorised users signed in to
                  the booking dashboard. Not set for ordinary guests.
                </td>
                <td className="py-4">Session (until logout or expiry)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-6">
          Our hosting provider (Vercel) may process technical logs and
          essential infrastructure cookies necessary to deliver the Site
          securely. See Vercel&apos;s privacy documentation for details.
        </p>
      </LegalSection>

      <LegalSection title="4. Managing cookies">
        <LegalList
          items={[
            "You can block or delete cookies through your browser settings",
            "Blocking all cookies may affect how some websites work",
            "The admin session cookie is required for staff to use the dashboard — it is not used on public pages for guests",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. More information">
        <p>
          For how we handle personal data, see our{" "}
          <a href="/privacy" className="text-gold hover:underline">
            Privacy policy
          </a>
          . Questions:{" "}
          <a
            href={`mailto:${LEGAL_CONTACT_EMAIL}`}
            className="text-gold hover:underline"
          >
            {LEGAL_CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
