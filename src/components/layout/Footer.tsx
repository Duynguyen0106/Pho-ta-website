import Link from "next/link";
import { locations } from "@/lib/data/locations";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#e8e0d4] bg-[#1a3c34] text-[#faf7f2]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <h3 className="font-serif text-xl">Pho Ta</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#c9d5d0]">
            Authentic Vietnamese cuisine in London. Fresh ingredients, bold
            flavours, and warm hospitality at Kentish Town and Finchley Road.
          </p>
        </div>

        {locations.map((location) => (
          <div key={location.slug}>
            <h4 className="text-sm font-medium uppercase tracking-wider text-[#c9a962]">
              {location.shortName}
            </h4>
            <p className="mt-3 text-sm text-[#c9d5d0]">
              {location.address}
              <br />
              {location.postcode}
            </p>
            <a
              href={`tel:${location.phone.replace(/\s/g, "")}`}
              className="mt-2 block text-sm hover:text-[#c9a962]"
            >
              {location.phone}
            </a>
            <a
              href={`mailto:${location.email}`}
              className="mt-1 block text-sm hover:text-[#c9a962]"
            >
              {location.email}
            </a>
          </div>
        ))}

        <div>
          <h4 className="text-sm font-medium uppercase tracking-wider text-[#c9a962]">
            Opening Hours
          </h4>
          <p className="mt-3 text-sm text-[#c9d5d0]">
            Monday – Sunday
            <br />
            11:30am – 9:30pm
          </p>
          <Link
            href="/book"
            className="mt-4 inline-block rounded-full border border-[#c9a962] px-4 py-2 text-sm text-[#c9a962] transition hover:bg-[#c9a962] hover:text-[#1a3c34]"
          >
            Book a Table
          </Link>
        </div>
      </div>
      <div className="border-t border-[#245046] py-4 text-center text-xs text-[#8aa39a]">
        © {new Date().getFullYear()} Pho Ta Restaurant. All rights reserved.
      </div>
    </footer>
  );
}
