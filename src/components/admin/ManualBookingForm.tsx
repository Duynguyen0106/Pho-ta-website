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
          sendConfirmation: Boolean(email),
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
      <Button variant="secondary" size="md" onClick={() => setOpen(true)}>
        + Add phone booking
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-10 sm:pt-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl luxury-card p-8 sm:p-10"
      >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-3xl text-foreground">
            Phone / walk-in booking
          </h3>
          <p className="mt-2 text-lg text-muted">
            Add a reservation taken by phone or in person
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
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
          <span className="label-caps">Location</span>
          <select
            value={locationSlug}
            onChange={(e) => setLocationSlug(e.target.value as LocationSlug)}
            className="luxury-input mt-3"
          >
            {locations.map((loc) => (
              <option key={loc.slug} value={loc.slug} className="bg-surface">
                {loc.shortName}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label-caps">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="luxury-input mt-3"
            required
          />
        </label>
        <label className="block">
          <span className="label-caps">Time</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="luxury-input mt-3"
            required
          />
        </label>
        <label className="block">
          <span className="label-caps">Guests</span>
          <select
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            className="luxury-input mt-3"
          >
            {Array.from({ length: MAX_PARTY_SIZE }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n} className="bg-surface">
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="label-caps">Seating preference</span>
          <select
            value={seatingPreference}
            onChange={(e) =>
              setSeatingPreference(e.target.value as SeatingPreference)
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
        <label className="block">
          <span className="label-caps">Guest name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="luxury-input mt-3"
            required
          />
        </label>
        <label className="block">
          <span className="label-caps">Phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="luxury-input mt-3"
            required
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="label-caps">Email (optional — for confirmation)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="luxury-input mt-3"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="label-caps">Notes</span>
          <input
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className="luxury-input mt-3"
            placeholder="Dietary requirements, celebrations…"
          />
        </label>
      </div>

      <Button type="submit" disabled={loading} size="lg" className="mt-8">
        {loading ? "Saving…" : "Save booking"}
      </Button>
    </form>
    </div>
  );
}
