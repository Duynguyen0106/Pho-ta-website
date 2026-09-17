"use client";

import { useEffect, useState } from "react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { BOOKING_SOURCE_LABELS } from "@/lib/constants";

interface Stats {
  totalBookings: number;
  totalCovers: number;
  cancelled: number;
  noShow: number;
  bySource: Record<string, number>;
}

export function AdminReports() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetch(`/api/admin/stats?days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {});
  }, [days]);

  if (!stats) {
    return (
      <div className="luxury-card p-8 text-xl text-muted">
        Loading reports…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-4xl font-normal text-foreground">
            Reports
          </h2>
          <p className="mt-2 text-xl text-muted">
            Booking activity over the last {days} days
          </p>
        </div>
        <label className="block">
          <span className="label-caps">Period</span>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="luxury-input mt-2 min-w-[160px]"
          >
            <option value={7} className="bg-surface">
              Last 7 days
            </option>
            <option value={14} className="bg-surface">
              Last 14 days
            </option>
            <option value={30} className="bg-surface">
              Last 30 days
            </option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Bookings" value={stats.totalBookings} />
        <AdminStatCard label="Total covers" value={stats.totalCovers} />
        <AdminStatCard label="Cancelled" value={stats.cancelled} />
        <AdminStatCard label="No-shows" value={stats.noShow} />
      </div>

      <div className="luxury-card p-8">
        <p className="label-caps">Bookings by source</p>
        <ul className="mt-6 space-y-4 text-lg">
          {Object.entries(BOOKING_SOURCE_LABELS).map(([key, label]) => (
            <li
              key={key}
              className="flex items-center justify-between border-b border-gold/10 pb-3"
            >
              <span className="text-muted">{label}</span>
              <span className="font-display text-2xl text-foreground">
                {stats.bySource[key] ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
