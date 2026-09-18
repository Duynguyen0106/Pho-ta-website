"use client";

import { format } from "date-fns";
import { MapPin, Users, Clock, Armchair } from "lucide-react";
import { SEATING_PREFERENCES } from "@/lib/constants";
import { locations } from "@/lib/data/locations";
import type { LocationSlug, SeatingPreference } from "@/lib/types";

interface BookingSummaryProps {
  locationSlug: LocationSlug;
  date: string;
  time: string;
  partySize: number;
  seatingPreference: SeatingPreference;
  compact?: boolean;
}

export function BookingSummary({
  locationSlug,
  date,
  time,
  partySize,
  seatingPreference,
  compact = false,
}: BookingSummaryProps) {
  const location = locations.find((l) => l.slug === locationSlug);
  const seating = SEATING_PREFERENCES.find((p) => p.value === seatingPreference);

  const formattedDate = date
    ? format(new Date(`${date}T12:00:00`), "EEEE, d MMMM yyyy")
    : "—";

  return (
    <aside
      className={
        compact
          ? "border border-gold/20 bg-surface-alt/80 p-5"
          : "luxury-card p-8 lg:sticky lg:top-28"
      }
    >
      <p className="label-caps">Your reservation</p>
      <h3 className="mt-3 font-display text-2xl font-normal text-foreground">
        {location?.shortName ?? "Select venue"}
      </h3>
      <div className="gold-line my-5 w-12" />

      <ul className="space-y-4 text-base text-muted">
        <li className="flex items-start gap-3">
          <MapPin
            size={18}
            className="mt-0.5 shrink-0 text-gold"
            strokeWidth={1.25}
          />
          <span>{location ? `${location.address}, ${location.postcode}` : "—"}</span>
        </li>
        <li className="flex items-center gap-3">
          <Users size={18} className="shrink-0 text-gold" strokeWidth={1.25} />
          <span>
            {partySize} {partySize === 1 ? "guest" : "guests"}
          </span>
        </li>
        <li className="flex min-w-0 items-start gap-3">
          <Clock size={18} className="mt-0.5 shrink-0 text-gold" strokeWidth={1.25} />
          <span className="min-w-0 break-words">
            {time ? `${formattedDate} at ${time}` : formattedDate}
          </span>
        </li>
        <li className="flex items-start gap-3">
          <Armchair
            size={18}
            className="mt-0.5 shrink-0 text-gold"
            strokeWidth={1.25}
          />
          <span>{seating?.label ?? "No preference"}</span>
        </li>
      </ul>

      {!compact && (
        <p className="mt-6 border-t border-gold/15 pt-5 text-sm leading-relaxed text-muted">
          You will receive a booking reference on the next screen. The restaurant
          is notified immediately; guest email and SMS follow once enabled.
        </p>
      )}
    </aside>
  );
}
