import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { location } from "@/lib/data/locations";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gold/15 bg-surface-alt">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo href="/" />
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Refined Vietnamese cuisine at Pho Ta Finchley Road. Fresh ingredients,
            authentic flavours, and warm hospitality in South Hampstead.
          </p>
        </div>

        <div>
          <h4 className="text-base font-medium uppercase tracking-[0.16em] text-gold">
            Visit us
          </h4>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            {location.address}
            <br />
            {location.postcode}
          </p>
          <a
            href={`tel:${location.phone.replace(/\s/g, "")}`}
            className="mt-3 block text-lg text-foreground transition hover:text-gold"
          >
            {location.phone}
          </a>
          <a
            href={`mailto:${location.email}`}
            className="mt-1 block text-lg text-muted transition hover:text-gold"
          >
            {location.email}
          </a>
        </div>

        <div>
          <h4 className="text-base font-medium uppercase tracking-[0.16em] text-gold">
            Guest information
          </h4>
          <ul className="mt-4 space-y-3 text-lg">
            <li>
              <Link href="/faq" className="text-muted transition hover:text-gold">
                Questions & answers
              </Link>
            </li>
            <li>
              <Link
                href="/food-safety"
                className="text-muted transition hover:text-gold"
              >
                Food hygiene & allergies
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-muted transition hover:text-gold">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-muted transition hover:text-gold">
                Terms of use
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="text-muted transition hover:text-gold">
                Cookie policy
              </Link>
            </li>
          </ul>
          <Link
            href="/book"
            className="mt-6 inline-flex border border-gold px-5 py-2.5 text-base font-medium uppercase tracking-[0.1em] text-gold transition hover:bg-gold hover:text-white"
          >
            Reserve
          </Link>
          <p className="mt-6 text-lg text-muted">
            Mon – Sun · 11:30am – 9:30pm
          </p>
        </div>
      </div>
      <div className="gold-line mx-auto max-w-6xl" />
      <div className="px-6 py-6 text-center text-base text-muted">
        <p className="uppercase tracking-[0.1em]">
          © {new Date().getFullYear()} Pho Ta Restaurant
        </p>
        <p className="mt-3 text-sm leading-relaxed">
          <Link href="/privacy" className="hover:text-gold">
            Privacy
          </Link>
          {" · "}
          <Link href="/terms" className="hover:text-gold">
            Terms
          </Link>
          {" · "}
          <Link href="/cookies" className="hover:text-gold">
            Cookies
          </Link>
        </p>
      </div>
    </footer>
  );
}
