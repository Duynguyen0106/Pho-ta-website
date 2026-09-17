"use client";

import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SEATING_PREFERENCES, MAX_PARTY_SIZE } from "@/lib/constants";
import { locations } from "@/lib/data/locations";
import type { LocationSlug, SeatingPreference } from "@/lib/types";

interface ManualBookingFormProps {
  onCreated: () => void;
}

export function ManualBookingForm({ onCreated }: ManualBookingFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [locationSlug, setLocationSlug] = useState<LocationSlug>("finchley-road");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState("19:00");
  const [partySize, setPartySize] = useState(2);
  const [seatingPreference, setSeatingPreference] =
    useState<SeatingPreference>("no_preference");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationSlug,
          date,
          time,
          partySize,
          seatingPreference,
          name,
          email: email || "walkin@photarestaurants.com",
          phone,
          specialRequests: specialRequests || undefined,
          source: "phone",
          sendConfirmation: Boolean(email && phone),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create booking");

      setOpen(false);
      setName("");
      setEmail("");
      setPhone("");
      setSpecialRequests("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        + Add phone booking
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-xl border border-[#e8e0d4] bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-[#1a3c34]">Phone / walk-in booking</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-[#5c534a] hover:text-[#1a3c34]"
        >
          Cancel
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[#5c534a]">Location</span>
          <select
            value={locationSlug}
            onChange={(e) => setLocationSlug(e.target.value as LocationSlug)}
            className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-3 py-2"
          >
            {locations.map((loc) => (
              <option key={loc.slug} value={loc.slug}>
                {loc.shortName}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[#5c534a]">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-[#5c534a]">Time</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-[#5c534a]">Guests</span>
          <select
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-3 py-2"
          >
            {Array.from({ length: MAX_PARTY_SIZE }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-[#5c534a]">Seating preference</span>
          <select
            value={seatingPreference}
            onChange={(e) =>
              setSeatingPreference(e.target.value as SeatingPreference)
            }
            className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-3 py-2"
          >
            {SEATING_PREFERENCES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[#5c534a]">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-[#5c534a]">Phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-[#5c534a]">Email (optional — for confirmation)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-3 py-2"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-[#5c534a]">Notes</span>
          <input
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-3 py-2"
          />
        </label>
      </div>

      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? "Saving…" : "Save booking"}
      </Button>
    </form>
  );
}
