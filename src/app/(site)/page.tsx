import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { featuredDishes } from "@/lib/data/menu";
import { locations } from "@/lib/data/locations";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center">
        <Image
          src="https://images.unsplash.com/photo-1591814468924-caf87d6592d3?w=1920&q=80"
          alt="Pho Ta Vietnamese cuisine"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a3c34]/90 via-[#1a3c34]/70 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <p className="text-sm uppercase tracking-[0.3em] text-[#c9a962]">
            The Soul of Vietnamese
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-5xl leading-tight text-[#faf7f2] sm:text-6xl">
            Fresh flavours, warm hospitality
          </h1>
          <p className="mt-6 max-w-lg text-lg text-[#c9d5d0]">
            Pho Ta brings authentic Vietnamese cuisine to London — from rich,
            fragrant pho to Hanoi-style bun cha. Dine in or take away at
            Kentish Town and Finchley Road.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/book">
              <Button size="lg" variant="secondary">
                Book a Table
              </Button>
            </Link>
            <Link href="/menu">
              <Button
                size="lg"
                variant="outline"
                className="border-[#faf7f2] text-[#faf7f2] hover:bg-[#faf7f2] hover:text-[#1a3c34]"
              >
                View Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl text-[#1a3c34] sm:text-4xl">
              About Pho Ta
            </h2>
            <p className="mt-6 leading-relaxed text-[#5c534a]">
              Pho Ta is known for discovering unique flavours from Vietnam and
              sharing them with the London area. We take pride in fresh
              ingredients, healthy options, and catering to all dietary
              requirements — vegetarian, vegan, and gluten-free choices
              available.
            </p>
            <p className="mt-4 leading-relaxed text-[#5c534a]">
              Whether you&apos;re craving a warming bowl of pho or our
              signature bun cha, join us for an authentic taste of Vietnam.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80"
              alt="Vietnamese bun cha dish"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured dishes */}
      <section className="bg-[#1a3c34] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-[#c9a962]">
              Featured Dishes
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[#faf7f2] sm:text-4xl">
              Customer favourites
            </h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {featuredDishes.map((dish) => (
              <article
                key={dish.name}
                className="group overflow-hidden rounded-2xl bg-[#245046]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl text-[#faf7f2]">
                    {dish.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#c9d5d0]">
                    {dish.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-[#c9a962] transition hover:text-[#faf7f2]"
            >
              See full menu <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center font-serif text-3xl text-[#1a3c34] sm:text-4xl">
          Our Locations
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[#5c534a]">
          Two branches across North London. Book online or walk in.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {locations.map((location) => (
            <article
              key={location.slug}
              className="rounded-2xl border border-[#e8e0d4] bg-white p-8 shadow-sm"
            >
              <h3 className="font-serif text-2xl text-[#1a3c34]">
                {location.name}
              </h3>
              <div className="mt-4 space-y-2 text-sm text-[#5c534a]">
                <p className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[#c9a962]" />
                  {location.address}, {location.postcode}
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={16} className="text-[#c9a962]" />
                  Mon – Sun, 11:30am – 9:30pm
                </p>
                <a
                  href={`tel:${location.phone.replace(/\s/g, "")}`}
                  className="block hover:text-[#1a3c34]"
                >
                  {location.phone}
                </a>
              </div>
              <Link
                href={`/book?location=${location.slug}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#1a3c34] hover:text-[#c9a962]"
              >
                Book at {location.shortName} <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#e8e0d4] bg-[#faf7f2] py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="font-serif text-3xl text-[#1a3c34]">
            Ready to dine with us?
          </h2>
          <p className="mt-4 text-[#5c534a]">
            Reserve your table in under a minute. Choose your seating preference
            and we&apos;ll confirm by email and SMS.
          </p>
          <Link href="/book" className="mt-8 inline-block">
            <Button size="lg">Book a Table</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
