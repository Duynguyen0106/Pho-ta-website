"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const navLinks: { href: string; label: string; exact?: boolean }[] = [
  { href: "/", label: "Home", exact: true },
  { href: "/menu", label: "Menu" },
  { href: "/locations", label: "Visit" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const onHero = isHome && !scrolled;
  const onBook = pathname.startsWith("/book");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkClass = (href: string, exact?: boolean) =>
    cn(
      "relative text-base font-medium uppercase tracking-[0.12em] transition-colors duration-300",
      isActive(pathname, href, exact)
        ? "text-gold"
        : onHero
          ? "text-white/95 hover:text-white"
          : "text-muted hover:text-foreground",
      isActive(pathname, href, exact) &&
        "after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:bg-gold/70",
    );

  const reserveClass = cn(
    "inline-flex items-center justify-center border px-6 py-3 text-base font-medium uppercase tracking-[0.1em] transition duration-300",
    onHero && !onBook
      ? "border-white text-white hover:bg-white hover:text-foreground"
      : "border-gold bg-gold/10 text-gold hover:bg-gold hover:text-white",
    onBook && "border-gold bg-gold text-white",
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition duration-500",
        onHero
          ? "border-transparent bg-transparent"
          : "border-gold/15 bg-background/95 backdrop-blur-xl shadow-sm",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Logo priority={isHome} />

        <nav
          aria-label="Main"
          className="hidden items-center gap-10 lg:flex xl:gap-12"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href, link.exact)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/book" className={cn(reserveClass, "hidden lg:inline-flex")}>
            Reserve
          </Link>

          <button
            type="button"
            className={cn(
              "flex min-h-11 min-w-11 items-center justify-center rounded border transition lg:hidden",
              onHero
                ? "border-white/30 text-white hover:border-white"
                : "border-gold/30 text-gold hover:border-gold",
            )}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <X size={24} strokeWidth={1.5} />
            ) : (
              <Menu size={24} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className="border-t border-gold/15 bg-background/98 px-6 py-8 backdrop-blur-xl lg:hidden"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded px-3 py-4 text-lg font-medium uppercase tracking-[0.1em] transition",
                  isActive(pathname, link.href, link.exact)
                    ? "bg-gold/10 text-gold"
                    : "text-muted hover:bg-surface-alt hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 border-t border-gold/15 pt-6">
            <Link href="/book" className={cn(reserveClass, "w-full text-center")}>
              Reserve a table
            </Link>
            <div className="mt-4 flex flex-col gap-1">
              <Link
                href="/faq"
                className="flex min-h-11 items-center justify-center rounded px-3 text-base text-muted transition hover:bg-surface-alt hover:text-gold"
              >
                Questions & answers
              </Link>
              <Link
                href="/food-safety"
                className="flex min-h-11 items-center justify-center rounded px-3 text-base text-muted transition hover:bg-surface-alt hover:text-gold"
              >
                Allergies & hygiene
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
