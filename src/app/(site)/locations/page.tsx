import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { locations } from "@/lib/data/locations";

export const metadata: Metadata = {
  title: "Locations",
  description: "Find Pho Ta at Kentish Town and Finchley Road, London.",
};

export default function LocationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-serif text-4xl text-[#1a3c34]">Our Locations</h1>
        <p className="mx-auto mt-4 max-w-lg text-[#5c534a]">
          Two branches serving authentic Vietnamese cuisine across North London.
        </p>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        {locations.map((location) => (
          <article
            key={location.slug}
            className="overflow-hidden rounded-2xl border border-[#e8e0d4] bg-white shadow-sm"
          >
            <div className="aspect-[16/9] bg-[#1a3c34]/5">
              <iframe
                title={`Map of ${location.name}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${location.address}, ${location.postcode}`)}&output=embed`}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="p-8">
              <h2 className="font-serif text-2xl text-[#1a3c34]">{location.name}</h2>
              <ul className="mt-6 space-y-3 text-sm text-[#5c534a]">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-[#c9a962]" />
                  {location.address}, {location.postcode}
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="shrink-0 text-[#c9a962]" />
                  <a href={`tel:${location.phone.replace(/\s/g, "")}`} className="hover:text-[#1a3c34]">
                    {location.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="shrink-0 text-[#c9a962]" />
                  <a href={`mailto:${location.email}`} className="hover:text-[#1a3c34]">
                    {location.email}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Clock size={18} className="shrink-0 text-[#c9a962]" />
                  Mon – Sun, 11:30am – 9:30pm
                </li>
              </ul>
              <Link href={`/book?location=${location.slug}`} className="mt-8 inline-block">
                <Button>Book at {location.shortName}</Button>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
