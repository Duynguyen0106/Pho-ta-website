"use client";

import { format, parseISO } from "date-fns";
import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";

function downloadButtonClass(variant: "primary" | "outline" = "primary") {
  return cn(
    "inline-flex min-h-11 w-full items-center justify-center gap-2 font-sans text-base font-medium uppercase tracking-[0.14em] transition duration-300",
    variant === "primary"
      ? "border border-gold bg-gold text-white hover:border-gold-light hover:bg-gold-light"
      : "border border-foreground/25 bg-transparent text-foreground hover:border-gold hover:text-gold",
  );
}

function StaffScheduleForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [monthKey, setMonthKey] = useState(
    searchParams.get("month") ?? format(new Date(), "yyyy-MM"),
  );

  const disabled = !token;
  const csvUrl = `/api/rota/download?token=${encodeURIComponent(token)}&month=${encodeURIComponent(monthKey)}&format=csv`;
  const txtUrl = `/api/rota/download?token=${encodeURIComponent(token)}&month=${encodeURIComponent(monthKey)}&format=txt`;

  return (
    <div className="mx-auto min-w-0 max-w-lg px-4 py-16 sm:px-6 sm:py-24">
      <p className="label-caps text-center">Staff schedule</p>
      <h1 className="mt-4 text-center font-display text-4xl text-foreground">
        Download your rota
      </h1>
      <p className="mx-auto mt-4 max-w-md text-center text-lg text-muted">
        Enter the personal link code from your manager and choose the month to
        download your work schedule.
      </p>

      <div className="luxury-card mt-10 space-y-6 p-6 sm:p-8">
        <label className="block min-w-0">
          <span className="label-caps">Your access code</span>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value.trim())}
            className="luxury-input mt-3 font-mono text-sm"
            placeholder="Paste code from manager"
            required
          />
        </label>
        <label className="block min-w-0">
          <span className="label-caps">Month</span>
          <input
            type="month"
            value={monthKey}
            onChange={(e) => setMonthKey(e.target.value)}
            className="luxury-input mt-3"
            required
          />
        </label>

        <div className="flex flex-col gap-3 pt-2">
          <a
            href={csvUrl}
            aria-disabled={disabled}
            className={cn(downloadButtonClass("primary"), disabled && "pointer-events-none opacity-40")}
          >
            <Download size={18} />
            Download CSV ({format(parseISO(`${monthKey}-01`), "MMMM yyyy")})
          </a>
          <a
            href={txtUrl}
            aria-disabled={disabled}
            className={cn(downloadButtonClass("outline"), disabled && "pointer-events-none opacity-40")}
          >
            Download text version
          </a>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Need help? Ask your manager for a new schedule link from Admin → Rota.
      </p>
    </div>
  );
}

export default function StaffSchedulePage() {
  return (
    <Suspense fallback={<div className="px-6 py-24 text-center text-muted">Loading…</div>}>
      <StaffScheduleForm />
    </Suspense>
  );
}
