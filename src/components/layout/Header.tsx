"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/locations", label: "Locations" },
  { href: "/book", label: "Reservations" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
        scrolled
          ? "border-[#c9a962]/20 bg-[#0a0908]/95 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="group text-center">
          <span className="font-serif text-3xl font-light tracking-[0.15em] text-[#f5f0e6]">
            Pho Ta
          </span>
          <span className="mt-1 block text-[9px] uppercase tracking-[0.45em] text-[#c9a962]">
            Fine Vietnamese
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[11px] uppercase tracking-[0.25em] transition-colors duration-300",
                pathname === link.href
                  ? "text-[#c9a962]"
                  : "text-[#9a9085] hover:text-[#f5f0e6]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/book"
          className="hidden border border-[#c9a962] px-6 py-2.5 text-[10px] uppercase tracking-[0.25em] text-[#c9a962] transition hover:bg-[#c9a962] hover:text-[#0a0908] md:inline-block"
        >
          Reserve
        </Link>

        <button
          type="button"
          className="text-[#c9a962] md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} strokeWidth={1} /> : <Menu size={22} strokeWidth={1} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-[#c9a962]/15 bg-[#0a0908] px-6 py-6 md:hidden">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "text-[11px] uppercase tracking-[0.25em]",
                  pathname === link.href
                    ? "text-[#c9a962]"
                    : "text-[#9a9085]",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
