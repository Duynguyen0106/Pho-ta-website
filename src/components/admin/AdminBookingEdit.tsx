"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MAX_PARTY_SIZE, SEATING_PREFERENCES } from "@/lib/constants";
import { LOCATION_SLUG } from "@/lib/constants";
import type { Booking, SeatingPreference } from "@/lib/types";

interface AdminBookingEditProps {
  booking: Booking;
  onClose: () => void;
  onSaved: (booking: Booking) => void;
}

export function AdminBookingEdit({
  booking,
  onClose,
  onSaved,
}: AdminBookingEditProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    date: booking.date,
    time: booking.time,
    partySize: booking.partySize,
    seatingPreference: booking.seatingPreference,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    specialRequests: booking.specialRequests ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: booking.id,
          locationSlug: LOCATION_SLUG,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      onSaved(data.booking);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-10 sm:pt-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl luxury-card p-8 sm:p-10"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-3xl text-foreground">
              Edit reservation
            </h3>
            <p className="mt-2 font-serif text-lg text-gold">
              {booking.referenceCode}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-lg text-muted hover:text-gold"
          >
            Close
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-6 border border-red-800/40 bg-red-950/25 px-5 py-4 text-lg text-red-200"
          >
            {error}
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="label-caps">Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="luxury-input mt-3"
              required
            />
          </label>
          <label className="block">
            <span className="label-caps">Time</span>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="luxury-input mt-3"
              required
            />
          </label>
          <label className="block">
            <span className="label-caps">Guests</span>
            <select
              value={form.partySize}
              onChange={(e) =>
                setForm({ ...form, partySize: Number(e.target.value) })
              }
              className="luxury-input mt-3"
            >
              {Array.from({ length: MAX_PARTY_SIZE }, (_, i) => i + 1).map(
                (n) => (
                  <option key={n} value={n} className="bg-surface">
                    {n}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="label-caps">Seating preference</span>
            <select
              value={form.seatingPreference}
              onChange={(e) =>
                setForm({
                  ...form,
                  seatingPreference: e.target.value as SeatingPreference,
                })
              }
              className="luxury-input mt-3"
            >
              {SEATING_PREFERENCES.map((p) => (
                <option key={p.value} value={p.value} className="bg-surface">
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="label-caps">Guest name</span>
            <input
              value={form.customerName}
              onChange={(e) =>
                setForm({ ...form, customerName: e.target.value })
              }
              className="luxury-input mt-3"
              required
            />
          </label>
          <label className="block">
            <span className="label-caps">Email</span>
            <input
              type="email"
              value={form.customerEmail}
              onChange={(e) =>
                setForm({ ...form, customerEmail: e.target.value })
              }
              className="luxury-input mt-3"
              required
            />
          </label>
          <label className="block">
            <span className="label-caps">Phone</span>
            <input
              value={form.customerPhone}
              onChange={(e) =>
                setForm({ ...form, customerPhone: e.target.value })
              }
              className="luxury-input mt-3"
              required
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="label-caps">Special requests</span>
            <textarea
              value={form.specialRequests}
              onChange={(e) =>
                setForm({ ...form, specialRequests: e.target.value })
              }
              rows={3}
              className="luxury-input mt-3 resize-none"
            />
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
