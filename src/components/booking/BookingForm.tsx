"use client";

import { format, addDays } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { BookingSummary } from "@/components/booking/BookingSummary";
import {
  LOCATION_SLUG,
  MAX_PARTY_SIZE,
  MIN_LEAD_MINUTES,
  SEATING_PREFERENCES,
} from "@/lib/constants";
import { location } from "@/lib/data/locations";
import type { AvailabilitySlot, SeatingPreference } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BookingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

  const locationSlug = LOCATION_SLUG;
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

  const availableSlots = slots.filter((s) => s.available);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-14">
      <form onSubmit={handleSubmit} className="min-w-0 space-y-8 sm:space-y-10">
        <div className="space-y-3">
          <BookingStepper currentStep={step} />
          <p className="text-center text-sm text-muted sm:hidden">
            Step {step} of 4 ·{" "}
            {step === 1
              ? "Date & guests"
              : step === 2
                ? "Select a time"
                : step === 3
                  ? "Seating"
                  : "Your details"}
          </p>
        </div>

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
              <h2 className="font-display text-3xl font-normal text-foreground sm:text-4xl">
                Date & guests
              </h2>
              <p className="mt-2 text-lg text-muted">
                Pho Ta {location.shortName} · {location.address}
              </p>
            </header>

            <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
              <label className="block min-w-0">
                <span className="label-caps">Date</span>
                <input
                  type="date"
                  value={date}
                  min={format(new Date(), "yyyy-MM-dd")}
                  max={maxDate}
                  onChange={(e) => setDate(e.target.value)}
                  className="luxury-input luxury-input-date mt-3"
                  required
                />
              </label>
              <label className="block min-w-0">
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

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <header>
              <h2 className="font-display text-3xl font-normal text-foreground sm:text-4xl">
                Select a time
              </h2>
              <p className="mt-2 text-lg leading-relaxed text-muted">
                Pho Ta {location.shortName} · {partySize}{" "}
                {partySize === 1 ? "guest" : "guests"}
                <span className="block sm:inline">
                  <span className="hidden sm:inline"> · </span>
                  {format(new Date(`${date}T12:00:00`), "EEE d MMM yyyy")}
                </span>
              </p>
              <p className="mt-2 text-base text-muted">
                Times must be at least {MIN_LEAD_MINUTES / 60} hours from now.
                Need something sooner? Call {location.phone}.
              </p>
            </header>

            {slotsLoading ? (
              <div className="flex items-center gap-3 py-8 text-muted">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
                Checking availability…
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="rounded border border-gold/20 bg-surface-alt px-5 py-4 text-muted">
                {date === format(new Date(), "yyyy-MM-dd")
                  ? `No times available at least ${MIN_LEAD_MINUTES / 60} hours from now. Try a later time today, another day, or call ${location.phone}.`
                  : "No tables available for this date. Please try another day."}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5 md:grid-cols-5">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setTime(slot.time)}
                    className={cn(
                      "min-h-11 border py-3 font-sans text-sm tracking-widest transition duration-200 sm:py-3.5 sm:text-base",
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

            <div className="flex flex-col-reverse gap-3 border-t border-gold/15 pt-6 sm:flex-row sm:flex-wrap sm:gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="button"
                disabled={!time}
                className="w-full sm:w-auto"
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <header>
              <h2 className="font-display text-3xl font-normal text-foreground sm:text-4xl">
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
                  className="booking-select-card min-h-11 p-5 text-left"
                >
                  <span className="font-medium text-foreground">{pref.label}</span>
                  <p className="mt-1.5 text-base leading-relaxed text-muted">
                    {pref.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gold/15 pt-6 sm:flex-row sm:flex-wrap sm:gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => setStep(4)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <header>
              <h2 className="font-display text-3xl font-normal text-foreground sm:text-4xl">
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

            <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
              <label className="block min-w-0 md:col-span-2">
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

            <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded border border-gold/15 bg-surface-alt/50 p-4 text-base leading-relaxed text-muted">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-gold"
                required
              />
              <span className="min-w-0 flex-1">
                I agree to receive booking confirmations and reminders by email,
                and I accept the{" "}
                <a href="/terms" className="text-gold underline-offset-2 hover:underline">
                  Terms of use
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-gold underline-offset-2 hover:underline">
                  Privacy policy
                </a>
                .
              </span>
            </label>

            <div className="flex flex-col-reverse gap-3 border-t border-gold/15 pt-6 sm:flex-row sm:flex-wrap sm:gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setStep(3)}
              >
                Back
              </Button>
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto"
                disabled={loading || !consent}
              >
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
