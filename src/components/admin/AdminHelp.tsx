"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
interface AdminStatus {
  storage: string;
  services: {
    database: string;
    email: string;
    emailProvider?: string;
    sms: string;
    warnings: string[];
  };
}

export function AdminHelp() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<AdminStatus | null>(null);

  useEffect(() => {
    fetch("/api/admin/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  return (
    <div className="mb-8 luxury-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <span className="font-display text-2xl text-foreground">
          Staff guide & system status
        </span>
        {open ? (
          <ChevronUp size={24} className="text-gold" />
        ) : (
          <ChevronDown size={24} className="text-gold" />
        )}
      </button>

      {open && (
        <div className="border-t border-gold/15 px-6 py-6 text-lg text-muted">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="font-display text-xl text-foreground">
                Daily workflow
              </h4>
              <ol className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed">
                <li>Open today&apos;s date to see reservations</li>
                <li>
                  When a guest arrives, select their booking and tap{" "}
                  <strong className="text-foreground">Seated</strong>
                </li>
                <li>
                  Enter their table number and tap{" "}
                  <strong className="text-foreground">Save</strong>
                </li>
                <li>
                  After they leave, mark{" "}
                  <strong className="text-foreground">Completed</strong>
                </li>
                <li>
                  For phone bookings, use{" "}
                  <strong className="text-foreground">Add phone booking</strong>
                </li>
              </ol>
            </div>
            <div>
              <h4 className="font-display text-xl text-foreground">
                Menu, customers & closures
              </h4>
              <ul className="mt-4 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-foreground">Menu</strong> — edit
                  dishes, prices, and category order
                </li>
                <li>
                  <strong className="text-foreground">Customers</strong> — guest
                  notes and booking history
                </li>
                <li>
                  <strong className="text-foreground">Closures</strong> — block
                  dates when the restaurant is closed
                </li>
                <li>
                  <strong className="text-foreground">Staff & Rota</strong> — add
                  employees (name, visa, right to work), generate monthly schedules,
                  and export shifts
                </li>
                <li>
                  <strong className="text-foreground">Reports</strong> — weekly
                  booking summary and export CSV from Bookings
                </li>
              </ul>
            </div>
          </div>

          {status && (
            <div className="mt-6 rounded border border-gold/15 bg-surface-alt/80 p-5">
              <p className="label-caps">System status</p>
              <p className="mt-3 text-lg text-foreground">
                Storage: {status.storage} · Email: {status.services.email}
                {status.services.emailProvider
                  ? ` (${status.services.emailProvider})`
                  : ""}
              </p>
              {status.services.warnings.length > 0 && (
                <ul className="mt-4 space-y-2 text-base text-orange-300">
                  {status.services.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
