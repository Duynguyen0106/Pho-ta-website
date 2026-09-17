import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LEGAL_LAST_UPDATED, LEGAL_PAGES } from "@/lib/data/legal";
import { cn } from "@/lib/utils";

interface LegalLayoutProps {
  eyebrow?: string;
  title: string;
  description?: string;
  currentPath: string;
  children: React.ReactNode;
}

export function LegalLayout({
  eyebrow = "Legal",
  title,
  description,
  currentPath,
  children,
}: LegalLayoutProps) {
  return (
    <>
      <section className="border-b border-gold/15 bg-surface-alt/60">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={
              description ??
              `Last updated ${LEGAL_LAST_UPDATED}. Please read carefully before booking or using this website.`
            }
          />
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        <nav
          aria-label="Legal documents"
          className="mb-12 flex flex-wrap gap-2 border-b border-gold/15 pb-8"
        >
          {LEGAL_PAGES.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={currentPath === href ? "page" : undefined}
              className={cn(
                "rounded-full border px-4 py-2 text-sm uppercase tracking-[0.08em] transition",
                currentPath === href
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-gold/20 text-muted hover:border-gold/40 hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="space-y-12 text-lg leading-relaxed text-muted">
          {children}
        </div>

        <div className="mt-16 flex flex-wrap gap-6 border-t border-gold/15 pt-8">
          <Link
            href="/book"
            className="text-base font-medium uppercase tracking-[0.1em] text-gold hover:text-gold-light"
          >
            ← Book a table
          </Link>
          <Link
            href="/faq"
            className="text-base font-medium uppercase tracking-[0.1em] text-muted hover:text-gold"
          >
            Questions & answers
          </Link>
        </div>
      </div>
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-3xl font-normal text-foreground">
        {title}
      </h2>
      <div className="gold-line mt-4 w-12" />
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
