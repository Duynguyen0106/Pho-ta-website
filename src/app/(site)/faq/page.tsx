import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqCategories } from "@/lib/data/faq";

export const metadata: Metadata = {
  title: "Questions & Answers",
  description:
    "Frequently asked questions about reservations, dining, menus, and visiting Pho Ta in London.",
};

export default function FaqPage() {
  return (
    <>
      <section className="border-b border-gold/15 bg-surface-alt/60">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <SectionHeading
            eyebrow="Guest information"
            title="Questions & Answers"
            description="Everything you need to know before your visit — from booking to dietary requirements."
          />
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
        <div className="space-y-16">
          {faqCategories.map((category) => (
            <section key={category.title}>
              <h2 className="font-display text-4xl font-normal text-foreground">
                {category.title}
              </h2>
              <div className="gold-line mt-4 w-16" />
              <div className="mt-8">
                <FaqAccordion items={category.items} />
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 luxury-card p-8 text-center sm:p-10">
          <p className="font-display text-3xl text-foreground">
            Still have a question?
          </p>
          <p className="mt-4 text-xl text-muted">
            Call your nearest branch or ask when you book — we are always happy
            to help.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/book"
              className="inline-flex border border-gold px-8 py-3.5 text-base font-medium uppercase tracking-[0.1em] text-gold transition hover:bg-gold hover:text-white"
            >
              Book a table
            </Link>
            <Link
              href="/food-safety"
              className="inline-flex border border-foreground/25 px-8 py-3.5 text-base font-medium uppercase tracking-[0.1em] text-foreground transition hover:border-gold hover:text-gold"
            >
              Food hygiene & allergies
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
