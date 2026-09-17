import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { locations } from "@/lib/data/locations";

export const metadata: Metadata = {
  title: "Locations",
  description: "Pho Ta fine Vietnamese dining at Kentish Town and Finchley Road, London.",
};

export default function LocationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow="Visit"
        title="Our Locations"
        description="Two distinguished addresses in North London, each offering the full Pho Ta experience."
      />

      <div className="mt-20 grid gap-10 lg:grid-cols-2">
        {locations.map((location) => (
          <article key={location.slug} className="luxury-card overflow-hidden">
            <div className="aspect-[16/9] border-b border-gold/15 bg-surface-alt">
              <iframe
                title={`Map of ${location.name}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${location.address}, ${location.postcode}`)}&output=embed`}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="p-10">
              <h2 className="font-serif text-3xl font-normal text-foreground">
                {location.name}
              </h2>
              <div className="gold-line my-6 w-12" />
              <ul className="space-y-4 text-base text-muted">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-gold" strokeWidth={1.5} />
                  {location.address}, {location.postcode}
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="shrink-0 text-gold" strokeWidth={1.5} />
                  <a
                    href={`tel:${location.phone.replace(/\s/g, "")}`}
                    className="text-foreground transition hover:text-gold"
                  >
                    {location.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="shrink-0 text-gold" strokeWidth={1.5} />
                  <a
                    href={`mailto:${location.email}`}
                    className="transition hover:text-gold"
                  >
                    {location.email}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Clock size={18} className="shrink-0 text-gold" strokeWidth={1.5} />
                  Mon – Sun · 11:30am – 9:30pm
                </li>
              </ul>
              <Link href={`/book?location=${location.slug}`} className="mt-10 inline-block">
                <Button>Reserve at {location.shortName}</Button>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
