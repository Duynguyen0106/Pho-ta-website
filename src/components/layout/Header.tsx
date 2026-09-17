"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/locations", label: "Locations" },
  { href: "/faq", label: "Q&A" },
  { href: "/food-safety", label: "Allergies" },
  { href: "/book", label: "Reservations" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const onHero = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition duration-500",
        onHero
          ? "border-transparent bg-transparent"
          : "border-gold/15 bg-background/95 backdrop-blur-xl shadow-sm",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Logo priority={isHome} />

        <nav className="hidden items-center gap-8 lg:flex xl:gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-base font-medium uppercase tracking-[0.12em] transition-colors duration-300",
                pathname === link.href
                  ? "text-gold"
                  : onHero
                    ? "text-white/95 hover:text-white"
                    : "text-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/book"
          className={cn(
            "hidden border px-6 py-3 text-base font-medium uppercase tracking-[0.1em] transition lg:inline-block",
            onHero
              ? "border-white text-white hover:bg-white hover:text-foreground"
              : "border-gold text-gold hover:bg-gold hover:text-white",
          )}
        >
          Reserve
        </Link>

        <button
          type="button"
          className={cn(onHero ? "text-white" : "text-gold")}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-gold/15 bg-background px-6 py-6 lg:hidden">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "text-lg font-medium uppercase tracking-[0.1em]",
                  pathname === link.href ? "text-gold" : "text-muted",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="mt-2 border border-gold px-6 py-3 text-center text-lg font-medium uppercase tracking-[0.1em] text-gold"
            >
              Reserve
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
