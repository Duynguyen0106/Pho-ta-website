import Link from "next/link";
import { locations } from "@/lib/data/locations";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gold/15 bg-surface-alt">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-3">
        <div>
          <h3 className="font-serif text-2xl font-normal tracking-wide text-foreground">
            Pho Ta
          </h3>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Refined Vietnamese cuisine in the heart of London. An intimate
            setting, exceptional ingredients, and the art of hospitality.
          </p>
        </div>

        {locations.map((location) => (
          <div key={location.slug}>
            <h4 className="text-sm font-medium uppercase tracking-[0.2em] text-gold">
              {location.shortName}
            </h4>
            <p className="mt-4 text-base leading-relaxed text-muted">
              {location.address}
              <br />
              {location.postcode}
            </p>
            <a
              href={`tel:${location.phone.replace(/\s/g, "")}`}
              className="mt-3 block text-base text-foreground transition hover:text-gold"
            >
              {location.phone}
            </a>
            <a
              href={`mailto:${location.email}`}
              className="mt-1 block text-base text-muted transition hover:text-gold"
            >
              {location.email}
            </a>
          </div>
        ))}

        <div>
          <h4 className="text-sm font-medium uppercase tracking-[0.2em] text-gold">
            Hours
          </h4>
          <p className="mt-4 text-base text-muted">
            Monday – Sunday
            <br />
            11:30am – 9:30pm
          </p>
          <Link
            href="/book"
            className="mt-6 inline-block border border-gold/50 px-6 py-3 text-sm font-medium uppercase tracking-[0.12em] text-gold transition hover:border-gold hover:bg-gold/5"
          >
            Reserve a Table
          </Link>
        </div>
      </div>
      <div className="gold-line mx-auto max-w-6xl" />
      <div className="py-6 text-center text-sm uppercase tracking-[0.12em] text-muted">
        <Link href="/privacy" className="transition hover:text-gold">
          Privacy
        </Link>
        <span className="mx-3 text-gold/30">·</span>
        © {new Date().getFullYear()} Pho Ta
      </div>
    </footer>
  );
}
