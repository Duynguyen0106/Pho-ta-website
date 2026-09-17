"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/locations", label: "Locations" },
  { href: "/book", label: "Book a Table" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e0d4] bg-[#faf7f2]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group flex flex-col">
          <span className="font-serif text-2xl tracking-wide text-[#1a3c34]">
            Pho Ta
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-[#8a7f72]">
            Vietnamese Restaurant
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm uppercase tracking-wider transition-colors hover:text-[#1a3c34]",
                pathname === link.href
                  ? "font-medium text-[#1a3c34]"
                  : "text-[#5c534a]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/book"
          className="hidden rounded-full bg-[#1a3c34] px-5 py-2.5 text-sm font-medium text-[#faf7f2] transition hover:bg-[#245046] md:inline-block"
        >
          Reserve
        </Link>

        <button
          type="button"
          className="md:hidden text-[#1a3c34]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-[#e8e0d4] bg-[#faf7f2] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "py-2 text-sm uppercase tracking-wider",
                  pathname === link.href
                    ? "font-medium text-[#1a3c34]"
                    : "text-[#5c534a]",
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
