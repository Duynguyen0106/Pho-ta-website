import Link from "next/link";
import { locations } from "@/lib/data/locations";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#c9a962]/15 bg-[#080706]">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-3">
        <div>
          <h3 className="font-serif text-2xl font-light tracking-wide text-[#f5f0e6]">
            Pho Ta
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-[#9a9085]">
            Refined Vietnamese cuisine in the heart of London. An intimate
            setting, exceptional ingredients, and the art of hospitality.
          </p>
        </div>

        {locations.map((location) => (
          <div key={location.slug}>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#c9a962]">
              {location.shortName}
            </h4>
            <p className="mt-4 text-sm leading-relaxed text-[#9a9085]">
              {location.address}
              <br />
              {location.postcode}
            </p>
            <a
              href={`tel:${location.phone.replace(/\s/g, "")}`}
              className="mt-3 block text-sm text-[#f5f0e6] transition hover:text-[#c9a962]"
            >
              {location.phone}
            </a>
            <a
              href={`mailto:${location.email}`}
              className="mt-1 block text-sm text-[#9a9085] transition hover:text-[#c9a962]"
            >
              {location.email}
            </a>
          </div>
        ))}

        <div>
          <h4 className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#c9a962]">
            Hours
          </h4>
          <p className="mt-4 text-sm text-[#9a9085]">
            Monday – Sunday
            <br />
            11:30am – 9:30pm
          </p>
          <Link
            href="/book"
            className="mt-6 inline-block border border-[#c9a962]/50 px-6 py-2.5 text-[10px] uppercase tracking-[0.25em] text-[#c9a962] transition hover:border-[#c9a962] hover:bg-[#c9a962]/10"
          >
            Reserve a Table
          </Link>
        </div>
      </div>
      <div className="gold-line mx-auto max-w-6xl" />
      <div className="py-6 text-center text-[10px] uppercase tracking-[0.2em] text-[#6b635a]">
        <Link href="/privacy" className="transition hover:text-[#c9a962]">
          Privacy
        </Link>
        <span className="mx-3 text-[#c9a962]/30">·</span>
        © {new Date().getFullYear()} Pho Ta
      </div>
    </footer>
  );
}
