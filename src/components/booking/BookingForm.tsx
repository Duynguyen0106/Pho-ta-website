"use client";

import { format, addDays } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { BookingSummary } from "@/components/booking/BookingSummary";
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
  const location = locations.find((l) => l.slug === locationSlug)!;

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

  const availableSlots = slots.filter((s) => s.available);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
      <form onSubmit={handleSubmit} className="min-w-0 space-y-10">
        <BookingStepper currentStep={step} />

        {error && (
          <div
            role="alert"
            className="border border-red-800/40 bg-red-950/25 px-5 py-4 text-base text-red-200"
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8">
            <header>
              <h2 className="font-display text-4xl font-normal text-foreground">
                Select your venue
              </h2>
              <p className="mt-2 text-lg text-muted">
                Choose a location, date, and party size to begin
              </p>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              {locations.map((loc) => (
                <button
                  key={loc.slug}
                  type="button"
                  data-selected={locationSlug === loc.slug}
                  onClick={() => setLocationSlug(loc.slug)}
                  className="booking-select-card p-6 text-left"
                >
                  <span className="font-display text-2xl text-foreground">
                    {loc.shortName}
                  </span>
                  <p className="mt-2 text-base text-muted">{loc.address}</p>
                  <p className="mt-1 text-sm text-gold/80">{loc.phone}</p>
                </button>
              ))}
            </div>

            <div className="grid gap-6 border-t border-gold/15 pt-8 sm:grid-cols-2">
              <label className="block">
                <span className="label-caps">Date</span>
                <input
                  type="date"
                  value={date}
                  min={format(new Date(), "yyyy-MM-dd")}
                  max={maxDate}
                  onChange={(e) => setDate(e.target.value)}
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
                  {Array.from({ length: MAX_PARTY_SIZE }, (_, i) => i + 1).map(
                    (n) => (
                      <option key={n} value={n} className="bg-surface">
                        {n} {n === 1 ? "guest" : "guests"}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="button" size="lg" onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <header>
              <h2 className="font-display text-4xl font-normal text-foreground">
                Select a time
              </h2>
              <p className="mt-2 text-lg text-muted">
                {location.shortName} · {partySize}{" "}
                {partySize === 1 ? "guest" : "guests"} ·{" "}
                {format(new Date(`${date}T12:00:00`), "EEE d MMM yyyy")}
              </p>
            </header>

            {slotsLoading ? (
              <div className="flex items-center gap-3 py-8 text-muted">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
                Checking availability…
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="rounded border border-gold/20 bg-surface-alt px-5 py-4 text-muted">
                No tables available for this date. Please try another day.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setTime(slot.time)}
                    className={cn(
                      "border py-3.5 font-sans text-base tracking-widest transition duration-200",
                      !slot.available && "cursor-not-allowed opacity-25",
                      time === slot.time
                        ? "border-gold bg-gold text-background shadow-lg shadow-gold/20"
                        : slot.available
                          ? "border-gold/25 text-foreground hover:border-gold hover:bg-gold/5"
                          : "border-gold/10 text-muted",
                    )}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-4 border-t border-gold/15 pt-6">
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
            <header>
              <h2 className="font-display text-4xl font-normal text-foreground">
                Seating preference
              </h2>
              <p className="mt-2 text-lg text-muted">
                We shall endeavour to honour your request
              </p>
            </header>

            <div className="grid gap-3 sm:grid-cols-2">
              {SEATING_PREFERENCES.map((pref) => (
                <button
                  key={pref.value}
                  type="button"
                  data-selected={seatingPreference === pref.value}
                  onClick={() => setSeatingPreference(pref.value)}
                  className="booking-select-card p-5 text-left"
                >
                  <span className="font-medium text-foreground">{pref.label}</span>
                  <p className="mt-1.5 text-base leading-relaxed text-muted">
                    {pref.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 border-t border-gold/15 pt-6">
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
            <header>
              <h2 className="font-display text-4xl font-normal text-foreground">
                Your details
              </h2>
              <p className="mt-2 text-lg text-muted">
                Almost done — we will send your confirmation by email
              </p>
            </header>

            <BookingSummary
              compact
              locationSlug={locationSlug}
              date={date}
              time={time}
              partySize={partySize}
              seatingPreference={seatingPreference}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="label-caps">Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="luxury-input mt-3"
                  autoComplete="name"
                  required
                />
              </label>
              <label className="block">
                <span className="label-caps">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="luxury-input mt-3"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="block">
                <span className="label-caps">Phone</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07xxx xxxxxx"
                  className="luxury-input mt-3"
                  autoComplete="tel"
                  required
                />
                <span className="mt-2 block text-sm text-muted">
                  In case we need to reach you about your booking
                </span>
              </label>
              <label className="block sm:col-span-2">
                <span className="label-caps">Special requests</span>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  placeholder="Dietary requirements, celebrations, accessibility…"
                  className="luxury-input mt-3 resize-none"
                />
              </label>
            </div>

            <label className="flex items-start gap-3 rounded border border-gold/15 bg-surface-alt/50 p-4 text-base leading-relaxed text-muted">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 accent-gold"
                required
              />
              <span>
                I agree to receive booking confirmations and reminders by email.{" "}
                <a href="/privacy" className="text-gold underline-offset-2 hover:underline">
                  Privacy policy
                </a>
              </span>
            </label>

            <div className="flex flex-wrap gap-4 border-t border-gold/15 pt-6">
              <Button type="button" variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button type="submit" size="lg" disabled={loading || !consent}>
                {loading ? "Confirming…" : "Confirm Reservation"}
              </Button>
            </div>
          </div>
        )}
      </form>

      <div className="hidden lg:block">
        <BookingSummary
          locationSlug={locationSlug}
          date={date}
          time={time}
          partySize={partySize}
          seatingPreference={seatingPreference}
        />
      </div>
    </div>
  );
}
