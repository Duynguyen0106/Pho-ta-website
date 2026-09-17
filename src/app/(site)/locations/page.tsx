import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { location } from "@/lib/data/locations";

export const metadata: Metadata = {
  title: "Visit",
  description: "Pho Ta fine Vietnamese dining at Finchley Road, London.",
};

export default function LocationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow="Visit"
        title="Pho Ta Finchley Road"
        description="South Hampstead — refined Vietnamese dining in North London."
      />

      <article className="mt-20 luxury-card overflow-hidden">
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
          <h2 className="font-serif text-4xl font-normal text-foreground">
            {location.name}
          </h2>
          <div className="gold-line my-6 w-12" />
          <ul className="space-y-4 text-lg text-muted">
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
          <Link href="/book" className="mt-10 inline-block">
            <Button>Reserve a table</Button>
          </Link>
        </div>
      </article>
    </div>
  );
}
