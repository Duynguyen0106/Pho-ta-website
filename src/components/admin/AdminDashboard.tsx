"use client";

import {
  addDays,
  format,
  parse,
  startOfWeek,
} from "date-fns";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminBlackouts } from "@/components/admin/AdminBlackouts";
import { AdminBookingEdit } from "@/components/admin/AdminBookingEdit";
import { AdminConfirmationEmailModal } from "@/components/admin/AdminConfirmationEmailModal";
import { AdminCalendar } from "@/components/admin/AdminCalendar";
import { AdminCustomers } from "@/components/admin/AdminCustomers";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminHelp } from "@/components/admin/AdminHelp";
import { AdminMobileDetailSheet } from "@/components/admin/AdminMobileDetailSheet";
import { AdminMenuManager } from "@/components/admin/AdminMenuManager";
import { AdminReports } from "@/components/admin/AdminReports";
import { AdminShell, type AdminView } from "@/components/admin/AdminShell";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { ManualBookingForm } from "@/components/admin/ManualBookingForm";
import { Button } from "@/components/ui/Button";
import {
  BOOKING_SOURCE_LABELS,
  BOOKING_STATUS_LABELS,
  SEATING_LABELS,
} from "@/lib/constants";
import type { Booking, BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: (BookingStatus | "")[] = [
  "",
  "confirmed",
  "seated",
  "completed",
  "cancelled",
  "no_show",
];

export function AdminDashboard() {
  const [view, setView] = useState<AdminView>("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [savingTable, setSavingTable] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [emailBooking, setEmailBooking] = useState<Booking | null>(null);
  const [bookingsLayout, setBookingsLayout] = useState<
    "list" | "day" | "week"
  >("list");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (bookingsLayout === "week") {
      const anchor = parse(date, "yyyy-MM-dd", new Date());
      const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      params.set("from", format(weekStart, "yyyy-MM-dd"));
      params.set("to", format(weekEnd, "yyyy-MM-dd"));
    } else {
      params.set("date", date);
    }
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/bookings?${params}`);
    const data = await res.json();
    if (res.ok) setBookings(data.bookings);
    setLoading(false);
  }, [date, statusFilter, bookingsLayout]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    setTableNumber(selected?.seatedAtTable ?? "");
  }, [selected]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return bookings;
    return bookings.filter(
      (b) =>
        b.customerName.toLowerCase().includes(query) ||
        b.referenceCode.toLowerCase().includes(query) ||
        b.customerPhone.includes(query) ||
        b.customerEmail.toLowerCase().includes(query),
    );
  }, [bookings, search]);

  async function updateStatus(
    id: string,
    status: BookingStatus,
    notifyGuest = false,
  ) {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, notifyGuest }),
    });
    if (res.ok) {
      fetchBookings();
      if (selected?.id === id) {
        const data = await res.json();
        setSelected(data.booking);
      }
    }
  }

  async function saveTableNumber() {
    if (!selected) return;
    setSavingTable(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          seatedAtTable: tableNumber.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelected(data.booking);
        fetchBookings();
      }
    } finally {
      setSavingTable(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }


  function exportCsv() {
    const params = new URLSearchParams({ date });
    if (statusFilter) params.set("status", statusFilter);
    window.location.href = `/api/admin/bookings/export?${params}`;
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const activeBookings = bookings.filter((b) => b.status !== "cancelled");
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const seatedCount = bookings.filter((b) => b.status === "seated").length;
  const totalCovers = activeBookings.reduce((sum, b) => sum + b.partySize, 0);

  return (
    <AdminShell view={view} onViewChange={setView} onLogout={handleLogout}>
      <AdminHelp />

      {view === "menu" ? (
        <AdminMenuManager />
      ) : view === "customers" ? (
        <AdminCustomers />
      ) : view === "blackouts" ? (
        <AdminBlackouts />
      ) : view === "settings" ? (
        <AdminSettings />
      ) : view === "notifications" ? (
        <AdminNotifications />
      ) : view === "reports" ? (
        <AdminReports />
      ) : (
        <div className="space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl font-normal text-foreground">
                Today&apos;s service
              </h2>
              <p className="mt-2 text-xl text-muted">
                Manage reservations, seating, and walk-ins
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={exportCsv}>
                Export CSV
              </Button>
              <ManualBookingForm onCreated={fetchBookings} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <AdminStatCard
              label="Bookings"
              value={activeBookings.length}
            />
            <AdminStatCard
              label="Confirmed / Seated"
              value={`${confirmedCount} / ${seatedCount}`}
            />
            <AdminStatCard label="Total covers" value={totalCovers} />
          </div>

          <div className="fine-dining-panel p-6">
            <div className="flex flex-wrap gap-4">
              <label className="min-w-[180px] flex-1">
                <span className="label-caps">Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="luxury-input mt-3"
                />
              </label>
              <label className="min-w-[180px] flex-1">
                <span className="label-caps">Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as BookingStatus | "")
                  }
                  className="luxury-input mt-3"
                >
                  <option value="" className="bg-surface">
                    All statuses
                  </option>
                  {STATUS_OPTIONS.filter(Boolean).map((status) => (
                    <option key={status} value={status} className="bg-surface">
                      {BOOKING_STATUS_LABELS[status as BookingStatus]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant={date === today ? "primary" : "outline"}
                size="sm"
                onClick={() => setDate(today)}
              >
                Today
              </Button>
              <div className="flex gap-2">
                {(
                  [
                    ["list", "List"],
                    ["day", "Day"],
                    ["week", "Week"],
                  ] as const
                ).map(([layout, label]) => (
                  <Button
                    key={layout}
                    type="button"
                    variant={bookingsLayout === layout ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setBookingsLayout(layout)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              <div className="relative min-w-0 w-full flex-1 sm:min-w-[240px]">
                <Search
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold/70"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, reference, phone…"
                  className="luxury-input pl-12"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
            <div>
              {loading ? (
                <div className="flex items-center gap-3 py-12 text-xl text-muted">
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
                  Loading bookings…
                </div>
              ) : bookingsLayout === "day" || bookingsLayout === "week" ? (
                <AdminCalendar
                  bookings={filteredBookings}
                  anchorDate={date}
                  mode={bookingsLayout}
                  selectedId={selected?.id}
                  onSelect={setSelected}
                  onAnchorChange={setDate}
                />
              ) : filteredBookings.length === 0 ? (
                <div className="luxury-card px-8 py-16 text-center text-xl text-muted">
                  No bookings match your filters
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() => setSelected(booking)}
                        className={cn(
                          "luxury-card w-full p-6 text-left transition",
                          selected?.id === booking.id &&
                            "border-gold ring-1 ring-gold/40",
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-display text-2xl text-foreground">
                              {booking.time}{" "}
                              <span className="text-gold">·</span>{" "}
                              {booking.customerName}
                            </p>
                            <p className="mt-2 text-lg text-muted">
                              {booking.partySize}{" "}
                              {booking.partySize === 1 ? "guest" : "guests"}{" "}
                              · {SEATING_LABELS[booking.seatingPreference]}
                              {booking.seatedAtTable
                                ? ` · Table ${booking.seatedAtTable}`
                                : ""}
                            </p>
                            <p className="mt-1 font-serif text-lg text-gold/80">
                              {booking.referenceCode}
                            </p>
                            <p className="mt-1 text-base text-muted">
                              {BOOKING_SOURCE_LABELS[booking.source]}
                            </p>
                          </div>
                          <AdminStatusBadge status={booking.status} />
                        </div>
                      </button>
                  ))}
                </div>
              )}
            </div>

            <aside className="hidden luxury-card h-fit p-8 xl:block xl:sticky xl:top-36">
              {selected ? (
                <BookingDetailPanel
                  booking={selected}
                  tableNumber={tableNumber}
                  savingTable={savingTable}
                  onTableNumberChange={setTableNumber}
                  onSaveTable={saveTableNumber}
                  onEdit={() => setEditingBooking(selected)}
                  onResendEmail={() => setEmailBooking(selected)}
                  onUpdateStatus={updateStatus}
                />
              ) : (
                <p className="text-xl leading-relaxed text-muted">
                  Select a booking to view guest details, assign a table, and
                  update status.
                </p>
              )}
            </aside>
          </div>

          <AdminMobileDetailSheet
            open={Boolean(selected)}
            onClose={() => setSelected(null)}
            title="Booking details"
          >
            {selected && (
              <BookingDetailPanel
                booking={selected}
                tableNumber={tableNumber}
                savingTable={savingTable}
                onTableNumberChange={setTableNumber}
                onSaveTable={saveTableNumber}
                onEdit={() => setEditingBooking(selected)}
                onResendEmail={() => setEmailBooking(selected)}
                onUpdateStatus={updateStatus}
              />
            )}
          </AdminMobileDetailSheet>
        </div>
      )}

      {editingBooking && (
        <AdminBookingEdit
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSaved={(booking) => {
            setSelected(booking);
            fetchBookings();
          }}
        />
      )}

      {emailBooking && (
        <AdminConfirmationEmailModal
          booking={emailBooking}
          onClose={() => setEmailBooking(null)}
          onSent={(updated) => {
            fetchBookings();
            if (updated && selected?.id === updated.id) {
              setSelected(updated);
            }
          }}
        />
      )}
    </AdminShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label-caps">{label}</dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}

function BookingDetailPanel({
  booking,
  tableNumber,
  savingTable,
  onTableNumberChange,
  onSaveTable,
  onEdit,
  onResendEmail,
  onUpdateStatus,
}: {
  booking: Booking;
  tableNumber: string;
  savingTable: boolean;
  onTableNumberChange: (value: string) => void;
  onSaveTable: () => void;
  onEdit: () => void;
  onResendEmail: () => void;
  onUpdateStatus: (
    id: string,
    status: BookingStatus,
    notifyGuest?: boolean,
  ) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="label-caps">Guest</p>
        <h3 className="mt-2 font-display text-3xl text-foreground">
          {booking.customerName}
        </h3>
        <AdminStatusBadge status={booking.status} className="mt-4" />
        <p className="mt-3 text-lg text-muted">
          Source: {BOOKING_SOURCE_LABELS[booking.source]}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          Edit booking
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onResendEmail}>
          Resend email
        </Button>
      </div>

      <dl className="space-y-4 text-lg">
        <DetailRow label="Reference" value={booking.referenceCode} />
        <DetailRow
          label="When"
          value={`${booking.date} at ${booking.time}`}
        />
        <DetailRow label="Guests" value={String(booking.partySize)} />
        <DetailRow
          label="Seating"
          value={SEATING_LABELS[booking.seatingPreference]}
        />
        <div>
          <dt className="label-caps">Contact</dt>
          <dd className="mt-2 space-y-1 text-foreground">
            <a
              href={`mailto:${booking.customerEmail}`}
              className="block min-h-11 leading-[2.75rem] hover:text-gold"
            >
              {booking.customerEmail}
            </a>
            <a
              href={`tel:${booking.customerPhone.replace(/\s/g, "")}`}
              className="block min-h-11 leading-[2.75rem] hover:text-gold"
            >
              {booking.customerPhone}
            </a>
          </dd>
        </div>
        {booking.specialRequests && (
          <DetailRow label="Requests" value={booking.specialRequests} />
        )}
      </dl>

      <div className="border-t border-gold/15 pt-6">
        <p className="label-caps">Table number</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={tableNumber}
            onChange={(e) => onTableNumberChange(e.target.value)}
            placeholder="e.g. 12"
            className="luxury-input flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={savingTable}
            onClick={onSaveTable}
          >
            {savingTable ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="border-t border-gold/15 pt-6">
        <p className="label-caps">Update status</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["confirmed", "seated", "completed", "no_show"] as const).map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => onUpdateStatus(booking.id, status)}
                className={cn(
                  "min-h-11 rounded-full border px-4 py-2.5 text-base transition",
                  booking.status === status
                    ? "border-gold bg-gold text-background"
                    : "border-gold/25 text-muted hover:border-gold hover:text-foreground",
                )}
              >
                {BOOKING_STATUS_LABELS[status]}
              </button>
            ),
          )}
        </div>
        {booking.status !== "cancelled" && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onUpdateStatus(booking.id, "cancelled")}
              className="min-h-11 rounded-full border border-red-500/35 px-4 py-2.5 text-base text-red-300 transition hover:border-red-400 hover:bg-red-500/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(booking.id, "cancelled", true)}
              className="min-h-11 rounded-full border border-red-500/35 px-4 py-2.5 text-base text-red-300 transition hover:border-red-400 hover:bg-red-500/10"
            >
              Cancel & email guest
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
