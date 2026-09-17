import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Clock, HelpCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredDishes } from "@/lib/data/menu";
import { location } from "@/lib/data/locations";
import { siteImages } from "@/lib/data/images";
import { faqCategories } from "@/lib/data/faq";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-end">
        <Image
          src={siteImages.hero}
          alt="Pho Ta Finchley Road restaurant interior"
          fill
          className="object-cover brightness-[0.92] saturate-[1.05]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0b]/88 via-[#0f0d0b]/45 to-[#0f0d0b]/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0d0b]/55 to-transparent" />

        <div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-32">
          <p className="text-base font-medium uppercase tracking-[0.2em] text-gold-light">
            London · Finchley Road
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-normal leading-[1.08] tracking-wide text-white sm:text-6xl md:text-8xl">
            The art of Vietnamese dining
          </h1>
          <p className="mt-8 max-w-xl text-xl leading-relaxed text-white/90">
            An elevated journey through Vietnam&apos;s most cherished flavours —
            from fragrant pho to the refined traditions of Hanoi. Where
            authenticity meets elegance.
          </p>
          <div className="mt-12 flex flex-wrap gap-5">
            <Link href="/book">
              <Button size="lg">Reserve a Table</Button>
            </Link>
            <Link href="/menu">
              <Button
                size="lg"
                variant="outline"
                className="border-white/50 text-white hover:border-white hover:bg-white/10 hover:text-white"
              >
                View Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="border-t border-gold/10 bg-background py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 md:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Our Story"
              title="A taste of distinction"
              description="Pho Ta curates the finest Vietnamese traditions for the discerning London palate — fresh ingredients, meticulous preparation, and an atmosphere of quiet luxury."
            />
            <p className="mt-8 text-lg leading-relaxed text-muted">
              Whether an intimate dinner or a celebratory gathering, our kitchens
              honour the depth and nuance of Vietnamese cuisine with grace and
              precision.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 border border-gold/25" />
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={siteImages.about}
                alt="Pho Ta Finchley Road cherry blossom interior"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Signature dishes */}
      <section className="border-t border-gold/10 bg-surface-alt py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="The Menu"
            title="Signature selections"
            description="Handcrafted dishes that define the Pho Ta experience."
          />

          <div className="mt-20 grid gap-10 md:grid-cols-3">
            {featuredDishes.map((dish) => (
              <article key={dish.name} className="group luxury-card overflow-hidden">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="border-t border-gold/15 p-8">
                  <h3 className="font-serif text-3xl font-normal text-foreground">
                    {dish.name}
                  </h3>
                  <p className="mt-3 text-lg leading-relaxed text-muted">
                    {dish.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-3 text-base font-medium uppercase tracking-[0.1em] text-gold transition hover:text-gold-light"
            >
              View full menu <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="border-t border-gold/10 bg-background py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="Visit Us"
            title="Pho Ta Finchley Road"
            description="South Hampstead — the full Pho Ta experience in one welcoming dining room."
          />

          <article className="mx-auto mt-20 max-w-2xl luxury-card p-10 transition duration-500">
            <h3 className="font-serif text-4xl font-normal text-foreground">
              {location.shortName}
            </h3>
            <div className="gold-line my-6 w-12" />
            <div className="space-y-3 text-lg text-muted">
              <p className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-gold" strokeWidth={1.5} />
                {location.address}, {location.postcode}
              </p>
              <p className="flex items-center gap-3">
                <Clock size={18} className="shrink-0 text-gold" strokeWidth={1.5} />
                Mon – Sun · 11:30am – 9:30pm
              </p>
              <a
                href={`tel:${location.phone.replace(/\s/g, "")}`}
                className="block text-foreground transition hover:text-gold"
              >
                {location.phone}
              </a>
            </div>
            <Link
              href="/book"
              className="mt-8 inline-flex items-center gap-2 text-base font-medium uppercase tracking-[0.1em] text-gold transition hover:text-gold-light"
            >
              Reserve a table <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </article>
        </div>
      </section>

      {/* Guest information */}
      <section className="border-t border-gold/10 bg-surface-alt py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="Plan your visit"
            title="Questions, hygiene & allergies"
            description="Helpful information before you dine with us."
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            <Link
              href="/faq"
              className="group luxury-card p-10 transition duration-300"
            >
              <HelpCircle
                size={32}
                className="text-gold"
                strokeWidth={1.25}
              />
              <h3 className="mt-6 font-display text-4xl font-normal text-foreground">
                Questions & Answers
              </h3>
              <p className="mt-4 text-xl leading-relaxed text-muted">
                Reservations, opening hours, dietary requirements, parking, and
                more —{" "}
                {faqCategories.reduce((n, c) => n + c.items.length, 0)} topics
                covered.
              </p>
              <span className="mt-8 inline-flex items-center gap-2 text-base font-medium uppercase tracking-[0.1em] text-gold group-hover:text-gold-light">
                Read Q&A <ArrowRight size={16} strokeWidth={1.5} />
              </span>
            </Link>

            <Link
              href="/food-safety"
              className="group luxury-card p-10 transition duration-300"
            >
              <ShieldCheck
                size={32}
                className="text-gold"
                strokeWidth={1.25}
              />
              <h3 className="mt-6 font-display text-4xl font-normal text-foreground">
                Food hygiene & allergies
              </h3>
              <p className="mt-4 text-xl leading-relaxed text-muted">
                Our food safety standards and allergen guidance for the 14 major
                allergens — please read if you or a guest has dietary needs.
              </p>
              <span className="mt-8 inline-flex items-center gap-2 text-base font-medium uppercase tracking-[0.1em] text-gold group-hover:text-gold-light">
                Allergen info <ArrowRight size={16} strokeWidth={1.5} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gold/10 bg-background py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="text-base uppercase tracking-[0.16em] text-gold">
            Reservations
          </p>
          <h2 className="mt-4 font-serif text-5xl font-normal text-foreground">
            We look forward to welcoming you
          </h2>
          <p className="mt-5 text-xl leading-relaxed text-muted">
            Secure your table in moments. Select your preferred seating and
            receive confirmation by email.
          </p>
          <Link href="/book" className="mt-10 inline-block">
            <Button size="lg">Book a Table</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
