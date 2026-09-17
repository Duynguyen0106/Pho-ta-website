"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { AdminHelp } from "@/components/admin/AdminHelp";
import { AdminMenuManager } from "@/components/admin/AdminMenuManager";
import { ManualBookingForm } from "@/components/admin/ManualBookingForm";
import { Button } from "@/components/ui/Button";
import {
  BOOKING_STATUS_LABELS,
  SEATING_LABELS,
} from "@/lib/constants";
import { locations } from "@/lib/data/locations";
import type { Booking, BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: "bg-blue-100 text-blue-800",
  seated: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-orange-100 text-orange-800",
};

type AdminView = "bookings" | "menu";

export function AdminDashboard() {
  const [view, setView] = useState<AdminView>("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [location, setLocation] = useState<string>("");
  const [selected, setSelected] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ date });
    if (location) params.set("location", location);
    const res = await fetch(`/api/admin/bookings?${params}`);
    const data = await res.json();
    if (res.ok) setBookings(data.bookings);
    setLoading(false);
  }, [date, location]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function updateStatus(id: string, status: BookingStatus) {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      fetchBookings();
      if (selected?.id === id) {
        const data = await res.json();
        setSelected(data.booking);
      }
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const seatedCount = bookings.filter((b) => b.status === "seated").length;
  const totalCovers = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.partySize, 0);

  return (
    <div className="min-h-screen bg-[#f5f2ed]">
      <header className="border-b border-[#e8e0d4] bg-[#1a3c34] px-4 py-4 text-[#faf7f2] sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="font-serif text-xl">Pho Ta Admin</h1>
            <p className="text-sm text-[#c9d5d0]">
              Bookings & menu management
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-[#c9a962] text-[#c9a962] hover:bg-[#c9a962] hover:text-[#1a3c34]"
          >
            Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <AdminHelp />

        <div className="mb-6 inline-flex rounded-lg border border-[#e8e0d4] bg-white p-1">
          {(
            [
              { id: "bookings" as const, label: "Bookings" },
              { id: "menu" as const, label: "Menu" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={cn(
                "rounded-md px-5 py-2 text-sm transition",
                view === id
                  ? "bg-[#1a3c34] text-white"
                  : "text-[#5c534a] hover:bg-[#f5f2ed]",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {view === "menu" ? (
          <AdminMenuManager />
        ) : (
          <>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <ManualBookingForm onCreated={fetchBookings} />
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-[#5c534a]">Today&apos;s bookings</p>
            <p className="mt-1 text-2xl font-semibold text-[#1a3c34]">
              {bookings.filter((b) => b.status !== "cancelled").length}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-[#5c534a]">Confirmed / Seated</p>
            <p className="mt-1 text-2xl font-semibold text-[#1a3c34]">
              {confirmedCount} / {seatedCount}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-[#5c534a]">Total covers</p>
            <p className="mt-1 text-2xl font-semibold text-[#1a3c34]">
              {totalCovers}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-[#e8e0d4] bg-white px-4 py-2"
          />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-lg border border-[#e8e0d4] bg-white px-4 py-2"
          >
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc.slug} value={loc.slug}>
                {loc.shortName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {loading ? (
              <p className="text-[#5c534a]">Loading bookings…</p>
            ) : bookings.length === 0 ? (
              <div className="rounded-xl bg-white p-8 text-center text-[#5c534a] shadow-sm">
                No bookings for this date
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => setSelected(booking)}
                    className={cn(
                      "w-full rounded-xl bg-white p-4 text-left shadow-sm transition hover:shadow-md",
                      selected?.id === booking.id && "ring-2 ring-[#1a3c34]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-[#1a3c34]">
                          {booking.time} · {booking.customerName}
                        </p>
                        <p className="mt-1 text-sm text-[#5c534a]">
                          {booking.partySize} guests ·{" "}
                          {SEATING_LABELS[booking.seatingPreference]} ·{" "}
                          {locations.find((l) => l.slug === booking.locationSlug)?.shortName}
                        </p>
                        <p className="mt-1 text-xs text-[#8a7f72]">
                          {booking.referenceCode}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                          STATUS_COLORS[booking.status],
                        )}
                      >
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            {selected ? (
              <div className="space-y-4">
                <h3 className="font-serif text-lg text-[#1a3c34]">
                  {selected.customerName}
                </h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-[#8a7f72]">Reference</dt>
                    <dd>{selected.referenceCode}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8a7f72]">Time</dt>
                    <dd>
                      {selected.date} at {selected.time}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#8a7f72]">Guests</dt>
                    <dd>{selected.partySize}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8a7f72]">Seating preference</dt>
                    <dd>{SEATING_LABELS[selected.seatingPreference]}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8a7f72]">Contact</dt>
                    <dd>
                      <a href={`mailto:${selected.customerEmail}`} className="text-[#1a3c34]">
                        {selected.customerEmail}
                      </a>
                      <br />
                      <a href={`tel:${selected.customerPhone}`} className="text-[#1a3c34]">
                        {selected.customerPhone}
                      </a>
                    </dd>
                  </div>
                  {selected.specialRequests && (
                    <div>
                      <dt className="text-[#8a7f72]">Special requests</dt>
                      <dd>{selected.specialRequests}</dd>
                    </div>
                  )}
                </dl>

                <div className="border-t border-[#e8e0d4] pt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#8a7f72]">
                    Update status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      ["confirmed", "seated", "completed", "cancelled", "no_show"] as const
                    ).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateStatus(selected.id, status)}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs transition",
                          selected.status === status
                            ? "bg-[#1a3c34] text-white"
                            : "bg-[#f5f2ed] text-[#5c534a] hover:bg-[#e8e0d4]",
                        )}
                      >
                        {BOOKING_STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#5c534a]">
                Select a booking to view details and update status
              </p>
            )}
          </div>
        </div>
          </>
        )}
      </main>
    </div>
  );
}
