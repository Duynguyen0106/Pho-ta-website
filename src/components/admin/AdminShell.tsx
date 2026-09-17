"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type AdminView =
  | "bookings"
  | "menu"
  | "customers"
  | "blackouts"
  | "settings"
  | "notifications"
  | "reports";

const NAV_ITEMS: { id: AdminView; label: string }[] = [
  { id: "bookings", label: "Bookings" },
  { id: "menu", label: "Menu" },
  { id: "customers", label: "Customers" },
  { id: "blackouts", label: "Closures" },
  { id: "settings", label: "Settings" },
  { id: "notifications", label: "Notifications" },
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-6">
          <div className="min-w-0">
            <Logo href="/" />
            <p className="mt-1 text-sm uppercase tracking-[0.2em] text-gold sm:mt-2 sm:text-base">
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
          <div className="admin-nav-rail mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-px [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => onViewChange(id)}
                aria-current={view === id ? "page" : undefined}
                className={cn(
                  "min-h-11 shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium uppercase tracking-[0.12em] transition sm:px-6 sm:py-4 sm:text-lg",
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

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
