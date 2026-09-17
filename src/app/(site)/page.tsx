import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredDishes } from "@/lib/data/menu";
import { locations } from "@/lib/data/locations";
import { siteImages } from "@/lib/data/images";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-end">
        <Image
          src={siteImages.hero}
          alt="Pho Ta fine Vietnamese dining"
          fill
          className="object-cover brightness-[0.55] saturate-[0.85]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-[#0a0908]/60 to-[#0a0908]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0908]/80 to-transparent" />

        <div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-32">
          <p className="text-[11px] font-medium uppercase tracking-[0.45em] text-[#c9a962]">
            London · Kentish Town · Finchley Road
          </p>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl font-light leading-[1.1] tracking-wide text-[#f5f0e6] sm:text-7xl">
            The art of Vietnamese dining
          </h1>
          <p className="mt-8 max-w-lg text-base leading-relaxed text-[#9a9085]">
            An elevated journey through Vietnam&apos;s most cherished flavours —
            from fragrant pho to the refined traditions of Hanoi. Where
            authenticity meets elegance.
          </p>
          <div className="mt-12 flex flex-wrap gap-5">
            <Link href="/book">
              <Button size="lg">Reserve a Table</Button>
            </Link>
            <Link href="/menu">
              <Button size="lg" variant="outline">
                View Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="border-t border-[#c9a962]/10 bg-[#0a0908] py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 md:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Our Story"
              title="A taste of distinction"
              description="Pho Ta curates the finest Vietnamese traditions for the discerning London palate — fresh ingredients, meticulous preparation, and an atmosphere of quiet luxury."
            />
            <p className="mt-8 text-sm leading-relaxed text-[#9a9085]">
              Whether an intimate dinner or a celebratory gathering, our kitchens
              honour the depth and nuance of Vietnamese cuisine with grace and
              precision.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 border border-[#c9a962]/25" />
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={siteImages.about}
                alt="Signature Vietnamese dish"
                fill
                className="object-cover brightness-90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Signature dishes */}
      <section className="border-t border-[#c9a962]/10 bg-[#080706] py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="The Menu"
            title="Signature selections"
            description="Handcrafted dishes that define the Pho Ta experience."
          />

          <div className="mt-20 grid gap-10 md:grid-cols-3">
            {featuredDishes.map((dish) => (
              <article key={dish.name} className="group luxury-card">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    className="object-cover brightness-75 transition duration-700 group-hover:scale-105 group-hover:brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-transparent to-transparent" />
                </div>
                <div className="border-t border-[#c9a962]/15 p-8">
                  <h3 className="font-serif text-2xl font-light text-[#f5f0e6]">
                    {dish.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#9a9085]">
                    {dish.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-[#c9a962] transition hover:text-[#dfc488]"
            >
              Explore full menu <ArrowRight size={14} strokeWidth={1} />
            </Link>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="border-t border-[#c9a962]/10 py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="Visit Us"
            title="Two London addresses"
            description="Each location offers the same commitment to excellence."
          />

          <div className="mt-20 grid gap-8 md:grid-cols-2">
            {locations.map((location) => (
              <article
                key={location.slug}
                className="luxury-card p-10 transition duration-500"
              >
                <h3 className="font-serif text-3xl font-light text-[#f5f0e6]">
                  {location.shortName}
                </h3>
                <div className="gold-line my-6 w-12" />
                <div className="space-y-3 text-sm text-[#9a9085]">
                  <p className="flex items-start gap-3">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-[#c9a962]" strokeWidth={1} />
                    {location.address}, {location.postcode}
                  </p>
                  <p className="flex items-center gap-3">
                    <Clock size={15} className="shrink-0 text-[#c9a962]" strokeWidth={1} />
                    Mon – Sun · 11:30am – 9:30pm
                  </p>
                  <a
                    href={`tel:${location.phone.replace(/\s/g, "")}`}
                    className="block text-[#f5f0e6] transition hover:text-[#c9a962]"
                  >
                    {location.phone}
                  </a>
                </div>
                <Link
                  href={`/book?location=${location.slug}`}
                  className="mt-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#c9a962] transition hover:text-[#dfc488]"
                >
                  Reserve at {location.shortName}{" "}
                  <ArrowRight size={12} strokeWidth={1} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#c9a962]/10 bg-[#080706] py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#c9a962]">
            Reservations
          </p>
          <h2 className="mt-4 font-serif text-4xl font-light text-[#f5f0e6]">
            We look forward to welcoming you
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-[#9a9085]">
            Secure your table in moments. Select your preferred seating and
            receive confirmation by email and SMS.
          </p>
          <Link href="/book" className="mt-10 inline-block">
            <Button size="lg">Book a Table</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
