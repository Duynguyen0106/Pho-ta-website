"use client";

import { format, addDays } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SEATING_PREFERENCES, MAX_PARTY_SIZE } from "@/lib/constants";
import { locations } from "@/lib/data/locations";
import type { AvailabilitySlot, LocationSlug, SeatingPreference } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BookingFormProps {
  defaultLocation?: LocationSlug;
}

export function BookingForm({ defaultLocation }: BookingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

  const [locationSlug, setLocationSlug] = useState<LocationSlug>(
    defaultLocation ?? "finchley-road",
  );
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [partySize, setPartySize] = useState(2);
  const [time, setTime] = useState("");
  const [seatingPreference, setSeatingPreference] =
    useState<SeatingPreference>("no_preference");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [consent, setConsent] = useState(false);

  const maxDate = format(addDays(new Date(), 30), "yyyy-MM-dd");

  const fetchSlots = useCallback(async () => {
    setSlotsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        location: locationSlug,
        date,
        partySize: String(partySize),
      });
      const res = await fetch(`/api/availability?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load times");
      setSlots(data.slots);
      if (!data.slots.some((s: AvailabilitySlot) => s.time === time && s.available)) {
        setTime("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load times");
    } finally {
      setSlotsLoading(false);
    }
  }, [locationSlug, date, partySize, time]);

  useEffect(() => {
    if (step >= 2) fetchSlots();
  }, [step, fetchSlots]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationSlug,
          date,
          time,
          partySize,
          seatingPreference,
          name,
          email,
          phone,
          specialRequests: specialRequests || undefined,
          consentNotifications: consent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");

      router.push(`/book/confirmation?ref=${data.referenceCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  const location = locations.find((l) => l.slug === locationSlug)!;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              "h-2 w-12 rounded-full transition-colors",
              step >= s ? "bg-[#1a3c34]" : "bg-[#e8e0d4]",
            )}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl text-[#1a3c34]">
              Choose your restaurant
            </h2>
            <p className="mt-1 text-sm text-[#5c534a]">
              Select location, date, and party size
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {locations.map((loc) => (
              <button
                key={loc.slug}
                type="button"
                onClick={() => setLocationSlug(loc.slug)}
                className={cn(
                  "rounded-xl border p-4 text-left transition",
                  locationSlug === loc.slug
                    ? "border-[#1a3c34] bg-[#1a3c34]/5 ring-2 ring-[#1a3c34]"
                    : "border-[#e8e0d4] hover:border-[#1a3c34]/40",
                )}
              >
                <span className="font-medium text-[#1a3c34]">{loc.shortName}</span>
                <p className="mt-1 text-xs text-[#5c534a]">{loc.address}</p>
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-[#1a3c34]">Date</span>
              <input
                type="date"
                value={date}
                min={format(new Date(), "yyyy-MM-dd")}
                max={maxDate}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e8e0d4] bg-white px-4 py-3 text-[#2d2d2d] focus:border-[#1a3c34] focus:outline-none focus:ring-1 focus:ring-[#1a3c34]"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#1a3c34]">
                Number of guests
              </span>
              <select
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#e8e0d4] bg-white px-4 py-3 text-[#2d2d2d] focus:border-[#1a3c34] focus:outline-none focus:ring-1 focus:ring-[#1a3c34]"
              >
                {Array.from({ length: MAX_PARTY_SIZE }, (_, i) => i + 1).map(
                  (n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "guest" : "guests"}
                    </option>
                  ),
                )}
              </select>
              {partySize > 8 && (
                <p className="mt-1 text-xs text-[#8a7f72]">
                  For groups over 8, please mention any special requirements in
                  the next step.
                </p>
              )}
            </label>
          </div>

          <Button type="button" onClick={() => setStep(2)} className="w-full sm:w-auto">
            Choose time →
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl text-[#1a3c34]">Pick a time</h2>
            <p className="mt-1 text-sm text-[#5c534a]">
              {location.shortName} · {partySize} guests ·{" "}
              {format(new Date(date), "EEE d MMM yyyy")}
            </p>
          </div>

          {slotsLoading ? (
            <p className="text-sm text-[#5c534a]">Loading available times…</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setTime(slot.time)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-sm transition",
                    !slot.available && "cursor-not-allowed opacity-40",
                    time === slot.time
                      ? "border-[#1a3c34] bg-[#1a3c34] text-[#faf7f2]"
                      : slot.available
                        ? "border-[#e8e0d4] hover:border-[#1a3c34]"
                        : "border-[#e8e0d4]",
                  )}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button
              type="button"
              disabled={!time}
              onClick={() => setStep(3)}
            >
              Seating preference →
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl text-[#1a3c34]">
              Where would you like to sit?
            </h2>
            <p className="mt-1 text-sm text-[#5c534a]">
              We&apos;ll do our best to honour your preference
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {SEATING_PREFERENCES.map((pref) => (
              <button
                key={pref.value}
                type="button"
                onClick={() => setSeatingPreference(pref.value)}
                className={cn(
                  "rounded-xl border p-4 text-left transition",
                  seatingPreference === pref.value
                    ? "border-[#1a3c34] bg-[#1a3c34]/5 ring-2 ring-[#1a3c34]"
                    : "border-[#e8e0d4] hover:border-[#1a3c34]/40",
                )}
              >
                <span className="font-medium text-[#1a3c34]">{pref.label}</span>
                <p className="mt-1 text-xs text-[#5c534a]">{pref.description}</p>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              ← Back
            </Button>
            <Button type="button" onClick={() => setStep(4)}>
              Your details →
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl text-[#1a3c34]">
              Your details
            </h2>
            <p className="mt-1 text-sm text-[#5c534a]">
              We&apos;ll send confirmation to your email and phone
            </p>
          </div>

          <div className="rounded-xl border border-[#e8e0d4] bg-white/50 p-4 text-sm">
            <p className="font-medium text-[#1a3c34]">Booking summary</p>
            <p className="mt-2 text-[#5c534a]">
              {location.shortName} · {partySize} guests · {date} at {time}
              <br />
              Seating:{" "}
              {SEATING_PREFERENCES.find((p) => p.value === seatingPreference)?.label}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-[#1a3c34]">Full name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e8e0d4] bg-white px-4 py-3 focus:border-[#1a3c34] focus:outline-none focus:ring-1 focus:ring-[#1a3c34]"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#1a3c34]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e8e0d4] bg-white px-4 py-3 focus:border-[#1a3c34] focus:outline-none focus:ring-1 focus:ring-[#1a3c34]"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#1a3c34]">Mobile phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07xxx xxxxxx"
                className="mt-1 w-full rounded-lg border border-[#e8e0d4] bg-white px-4 py-3 focus:border-[#1a3c34] focus:outline-none focus:ring-1 focus:ring-[#1a3c34]"
                required
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-[#1a3c34]">
                Special requests (optional)
              </span>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                placeholder="Allergies, high chair, birthday, etc."
                className="mt-1 w-full rounded-lg border border-[#e8e0d4] bg-white px-4 py-3 focus:border-[#1a3c34] focus:outline-none focus:ring-1 focus:ring-[#1a3c34]"
              />
            </label>
          </div>

          <label className="flex items-start gap-3 text-sm text-[#5c534a]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
              required
            />
            <span>
              I agree to receive booking confirmations and reminders by email
              and SMS. See our{" "}
              <a href="/privacy" className="text-[#1a3c34] underline">
                privacy policy
              </a>{" "}
              for how we handle your data.
            </span>
          </label>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
              ← Back
            </Button>
            <Button type="submit" disabled={loading || !consent}>
              {loading ? "Confirming…" : "Confirm booking"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
