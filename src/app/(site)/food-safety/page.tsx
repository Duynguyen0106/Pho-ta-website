import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  allergenGroups,
  allergyAdvice,
  hygienePoints,
} from "@/lib/data/food-safety";

export const metadata: Metadata = {
  title: "Food Hygiene & Allergies",
  description:
    "Food safety standards and allergen information for Pho Ta Vietnamese restaurants in London.",
};

export default function FoodSafetyPage() {
  return (
    <>
      <section className="border-b border-gold/15 bg-surface-alt/60">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <SectionHeading
            eyebrow="Your wellbeing"
            title="Food Hygiene & Allergies"
            description="We take food safety seriously. Please read this information if you or a guest has allergies or dietary requirements."
          />
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
        <div className="mb-12 flex items-start gap-4 rounded border border-gold/30 bg-gold/10 p-6">
          <AlertTriangle
            size={28}
            className="mt-0.5 shrink-0 text-gold"
            strokeWidth={1.5}
          />
          <p className="text-xl leading-relaxed text-foreground">
            If you have a <strong>severe food allergy</strong>, please speak to
            a manager before ordering. We cannot guarantee an allergen-free
            kitchen environment.
          </p>
        </div>

        <section className="space-y-8">
          <h2 className="font-display text-4xl font-normal text-foreground">
            Our hygiene commitment
          </h2>
          <div className="gold-line w-16" />
          <ul className="mt-8 space-y-6">
            {hygienePoints.map((point) => (
              <li key={point.title} className="luxury-card p-8">
                <div className="flex items-start gap-4">
                  <ShieldCheck
                    size={28}
                    className="shrink-0 text-gold"
                    strokeWidth={1.5}
                  />
                  <div>
                    <h3 className="font-display text-2xl text-foreground">
                      {point.title}
                    </h3>
                    <p className="mt-3 text-xl leading-relaxed text-muted">
                      {point.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20">
          <h2 className="font-display text-4xl font-normal text-foreground">
            Allergen information
          </h2>
          <p className="mt-4 text-xl text-muted">
            Under UK law, we provide information on 14 major allergens. The
            following may be present in our menu:
          </p>
          <div className="gold-line mt-6 w-16" />

          <ul className="mt-10 space-y-4">
            {allergenGroups.map((group) => (
              <li
                key={group.name}
                className="border border-gold/15 bg-surface-alt/40 p-6"
              >
                <h3 className="font-display text-2xl text-foreground">
                  {group.name}
                </h3>
                <p className="mt-2 text-xl leading-relaxed text-muted">
                  {group.details}
                </p>
                {group.dishes && (
                  <p className="mt-2 text-lg text-gold/90">
                    Examples: {group.dishes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20 luxury-card p-8 sm:p-10">
          <h2 className="font-display text-3xl text-foreground">
            Important advice
          </h2>
          <ul className="mt-6 space-y-4 text-xl leading-relaxed text-muted">
            {allergyAdvice.map((line) => (
              <li key={line} className="flex gap-3">
                <span className="text-gold">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/faq"
            className="text-base font-medium uppercase tracking-[0.1em] text-gold hover:text-gold-light"
          >
            ← Questions & Answers
          </Link>
          <Link
            href="/book"
            className="text-base font-medium uppercase tracking-[0.1em] text-muted hover:text-gold"
          >
            Book with dietary notes →
          </Link>
          <Link
            href="/privacy"
            className="text-base font-medium uppercase tracking-[0.1em] text-muted hover:text-gold"
          >
            Privacy policy
          </Link>
        </div>
      </div>
    </>
  );
}
