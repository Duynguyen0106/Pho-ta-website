"use client";

import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type AdminView =
  | "bookings"
  | "menu"
  | "customers"
  | "blackouts"
  | "reports";

const NAV_ITEMS: { id: AdminView; label: string }[] = [
  { id: "bookings", label: "Bookings" },
  { id: "menu", label: "Menu" },
  { id: "customers", label: "Customers" },
  { id: "blackouts", label: "Closures" },
  { id: "reports", label: "Reports" },
];

interface AdminShellProps {
  view: AdminView;
  onViewChange: (view: AdminView) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AdminShell({
  view,
  onViewChange,
  onLogout,
  children,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-gold/15 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <Logo href="/" />
            <p className="mt-2 text-base uppercase tracking-[0.2em] text-gold">
              Staff admin
            </p>
          </div>
          <Button variant="outline" size="md" onClick={onLogout}>
            Log out
          </Button>
        </div>

        <nav
          aria-label="Admin sections"
          className="border-t border-gold/10 bg-surface-alt/50"
        >
          <div className="mx-auto flex max-w-7xl flex-wrap gap-1 px-6">
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => onViewChange(id)}
                aria-current={view === id ? "page" : undefined}
                className={cn(
                  "border-b-2 px-6 py-4 text-lg font-medium uppercase tracking-[0.12em] transition",
                  view === id
                    ? "border-gold text-gold"
                    : "border-transparent text-muted hover:border-gold/40 hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
