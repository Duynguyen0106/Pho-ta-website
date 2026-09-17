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

const labelClass = "text-base font-medium uppercase tracking-[0.1em] text-gold";
const stepTitleClass = "font-serif text-3xl font-normal text-foreground";
const stepDescClass = "mt-2 text-lg text-muted";

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

  const selectCard = (selected: boolean) =>
    cn(
      "border p-5 text-left transition duration-300",
      selected
        ? "border-gold bg-gold/5"
        : "border-gold/20 hover:border-gold/50",
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="flex items-center justify-center gap-3">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              "h-px w-10 transition-all duration-500",
              step >= s ? "bg-gold" : "bg-gold/20",
            )}
          />
        ))}
      </div>

      {error && (
        <div className="border border-red-900/50 bg-red-950/30 px-4 py-3 text-base text-red-300">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-8">
          <div>
            <h2 className={stepTitleClass}>Select your venue</h2>
            <p className={stepDescClass}>Location, date, and party size</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {locations.map((loc) => (
              <button
                key={loc.slug}
                type="button"
                onClick={() => setLocationSlug(loc.slug)}
                className={selectCard(locationSlug === loc.slug)}
              >
                <span className="font-serif text-2xl text-foreground">{loc.shortName}</span>
                <p className="mt-1 text-lg text-muted">{loc.address}</p>
              </button>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Date</span>
              <input
                type="date"
                value={date}
                min={format(new Date(), "yyyy-MM-dd")}
                max={maxDate}
                onChange={(e) => setDate(e.target.value)}
                className="luxury-input mt-2"
                required
              />
            </label>
            <label className="block">
              <span className={labelClass}>Guests</span>
              <select
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                className="luxury-input mt-2"
              >
                {Array.from({ length: MAX_PARTY_SIZE }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n} className="bg-surface-alt">
                    {n} {n === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Button type="button" onClick={() => setStep(2)}>
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <div>
            <h2 className={stepTitleClass}>Select a time</h2>
            <p className={stepDescClass}>
              {location.shortName} · {partySize} guests ·{" "}
              {format(new Date(date), "EEE d MMM yyyy")}
            </p>
          </div>

          {slotsLoading ? (
            <p className="text-lg text-muted">Loading availability…</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setTime(slot.time)}
                  className={cn(
                    "border px-3 py-3.5 text-base tracking-wider transition",
                    !slot.available && "cursor-not-allowed opacity-30",
                    time === slot.time
                      ? "border-gold bg-gold text-white"
                      : slot.available
                        ? "border-gold/25 text-foreground hover:border-gold"
                        : "border-gold/10 text-muted",
                  )}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="button" disabled={!time} onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8">
          <div>
            <h2 className={stepTitleClass}>Seating preference</h2>
            <p className={stepDescClass}>We shall endeavour to honour your request</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {SEATING_PREFERENCES.map((pref) => (
              <button
                key={pref.value}
                type="button"
                onClick={() => setSeatingPreference(pref.value)}
                className={selectCard(seatingPreference === pref.value)}
              >
                <span className="text-lg text-foreground">{pref.label}</span>
                <p className="mt-1 text-lg text-muted">{pref.description}</p>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="button" onClick={() => setStep(4)}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-8">
          <div>
            <h2 className={stepTitleClass}>Your details</h2>
            <p className={stepDescClass}>Confirmation will be sent by email and SMS</p>
          </div>

          <div className="border border-gold/20 bg-surface-alt p-5 text-lg">
            <p className={labelClass}>Summary</p>
            <p className="mt-3 text-lg text-muted">
              {location.shortName} · {partySize} guests · {date} at {time}
              <br />
              {SEATING_PREFERENCES.find((p) => p.value === seatingPreference)?.label}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={labelClass}>Full name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="luxury-input mt-2"
                required
              />
            </label>
            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="luxury-input mt-2"
                required
              />
            </label>
            <label className="block">
              <span className={labelClass}>Mobile</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07xxx xxxxxx"
                className="luxury-input mt-2"
                required
              />
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>Special requests</span>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                placeholder="Dietary requirements, celebrations, accessibility…"
                className="luxury-input mt-2 resize-none"
              />
            </label>
          </div>

          <label className="flex items-start gap-3 text-lg text-muted">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 accent-gold"
              required
            />
            <span>
              I agree to receive confirmations and reminders by email and SMS.{" "}
              <a href="/privacy" className="text-gold underline-offset-2 hover:underline">
                Privacy policy
              </a>
            </span>
          </label>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button type="submit" disabled={loading || !consent}>
              {loading ? "Confirming…" : "Confirm Reservation"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
