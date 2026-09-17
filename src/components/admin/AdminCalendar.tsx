"use client";

import {
  addDays,
  format,
  parse,
  startOfWeek,
} from "date-fns";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { SEATING_LABELS } from "@/lib/constants";
import type { Booking } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_BORDER: Record<Booking["status"], string> = {
  confirmed: "border-l-gold",
  seated: "border-l-emerald-400",
  completed: "border-l-muted",
  cancelled: "border-l-red-400",
  no_show: "border-l-orange-400",
};

interface AdminCalendarProps {
  bookings: Booking[];
  anchorDate: string;
  mode: "day" | "week";
  selectedId?: string;
  onSelect: (booking: Booking) => void;
  onAnchorChange: (date: string) => void;
}

export function AdminCalendar({
  bookings,
  anchorDate,
  mode,
  selectedId,
  onSelect,
  onAnchorChange,
}: AdminCalendarProps) {
  const anchor = parse(anchorDate, "yyyy-MM-dd", new Date());

  if (mode === "day") {
    const byTime = groupByTime(
      bookings.filter((b) => b.date === anchorDate),
    );
    const times = Object.keys(byTime).sort();

    return (
      <div className="space-y-4">
        <CalendarNav
          label={format(anchor, "EEE d MMM yyyy")}
          onPrev={() =>
            onAnchorChange(format(addDays(anchor, -1), "yyyy-MM-dd"))
          }
          onNext={() =>
            onAnchorChange(format(addDays(anchor, 1), "yyyy-MM-dd"))
          }
          onToday={() => onAnchorChange(format(new Date(), "yyyy-MM-dd"))}
        />

        {times.length === 0 ? (
          <div className="luxury-card px-8 py-16 text-center text-xl text-muted">
            No bookings on this day
          </div>
        ) : (
          <div className="space-y-6">
            {times.map((time) => (
              <section key={time}>
                <h3 className="label-caps mb-3">{time}</h3>
                <div className="space-y-3">
                  {byTime[time].map((booking) => (
                    <CalendarBookingCard
                      key={booking.id}
                      booking={booking}
                      selected={selectedId === booking.id}
                      onSelect={() => onSelect(booking)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    );
  }

  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-4">
      <CalendarNav
        label={`Week of ${format(weekStart, "d MMM yyyy")}`}
        onPrev={() =>
          onAnchorChange(format(addDays(anchor, -7), "yyyy-MM-dd"))
        }
        onNext={() =>
          onAnchorChange(format(addDays(anchor, 7), "yyyy-MM-dd"))
        }
        onToday={() => onAnchorChange(format(new Date(), "yyyy-MM-dd"))}
      />

      <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-7 lg:overflow-visible lg:pb-0">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayBookings = bookings
            .filter((b) => b.date === dateStr)
            .sort((a, b) => a.time.localeCompare(b.time));
          const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

          return (
            <div
              key={dateStr}
              className={cn(
                "luxury-card min-h-[200px] min-w-[260px] shrink-0 p-4 lg:min-w-0",
                isToday && "border-gold/40 ring-1 ring-gold/30",
              )}
            >
              <button
                type="button"
                onClick={() => onAnchorChange(dateStr)}
                className="mb-3 flex min-h-11 w-full items-center text-left"
              >
                <p className="text-sm uppercase tracking-[0.12em] text-gold">
                  {format(day, "EEE")}
                </p>
                <p className="font-display text-2xl text-foreground">
                  {format(day, "d")}
                </p>
              </button>

              {dayBookings.length === 0 ? (
                <p className="text-sm text-muted">—</p>
              ) : (
                <ul className="space-y-2">
                  {dayBookings.map((booking) => (
                    <li key={booking.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(booking)}
                        className={cn(
                          "min-h-11 w-full rounded border-l-4 bg-surface-alt/50 px-3 py-2.5 text-left text-sm transition hover:bg-surface-alt",
                          STATUS_BORDER[booking.status],
                          selectedId === booking.id &&
                            "ring-1 ring-gold/50",
                        )}
                      >
                        <p className="font-medium text-foreground">
                          {booking.time} · {booking.customerName}
                        </p>
                        <p className="text-xs text-muted">
                          {booking.partySize} guests
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarBookingCard({
  booking,
  selected,
  onSelect,
}: {
  booking: Booking;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "luxury-card w-full border-l-4 p-5 text-left transition",
        STATUS_BORDER[booking.status],
        selected && "border-gold ring-1 ring-gold/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-xl text-foreground">
            {booking.customerName}
          </p>
          <p className="mt-1 text-base text-muted">
            {booking.partySize} guests · {SEATING_LABELS[booking.seatingPreference]}
            {booking.seatedAtTable ? ` · Table ${booking.seatedAtTable}` : ""}
          </p>
          <p className="mt-1 font-serif text-base text-gold/80">
            {booking.referenceCode}
          </p>
        </div>
        <AdminStatusBadge status={booking.status} />
      </div>
    </button>
  );
}

function CalendarNav({
  label,
  onPrev,
  onNext,
  onToday,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex min-h-11 min-w-11 items-center justify-center rounded border border-gold/25 text-base text-muted hover:border-gold hover:text-foreground"
          aria-label="Previous"
        >
          ←
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex min-h-11 min-w-11 items-center justify-center rounded border border-gold/25 text-base text-muted hover:border-gold hover:text-foreground"
          aria-label="Next"
        >
          →
        </button>
        <button
          type="button"
          onClick={onToday}
          className="min-h-11 rounded border border-gold/25 px-4 py-2 text-base text-muted hover:border-gold hover:text-foreground"
        >
          Today
        </button>
      </div>
      <p className="font-display text-2xl text-foreground">{label}</p>
    </div>
  );
}

function groupByTime(bookings: Booking[]): Record<string, Booking[]> {
  const map: Record<string, Booking[]> = {};
  for (const booking of bookings) {
    if (!map[booking.time]) map[booking.time] = [];
    map[booking.time].push(booking);
  }
  for (const time of Object.keys(map)) {
    map[time].sort((a, b) =>
      a.customerName.localeCompare(b.customerName),
    );
  }
  return map;
}
