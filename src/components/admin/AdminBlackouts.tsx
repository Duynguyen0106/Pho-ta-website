"use client";

import { format, addDays } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { locations } from "@/lib/data/locations";
import type { BlackoutDate } from "@/lib/types";

export function AdminBlackouts() {
  const [blackouts, setBlackouts] = useState<BlackoutDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [locationSlug, setLocationSlug] = useState<string>("");
  const [reason, setReason] = useState("");

  const fetchBlackouts = useCallback(async () => {
    setLoading(true);
    const from = format(new Date(), "yyyy-MM-dd");
    const res = await fetch(`/api/admin/blackouts?from=${from}`);
    const data = await res.json();
    if (res.ok) setBlackouts(data.blackouts);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBlackouts();
  }, [fetchBlackouts]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blackouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          locationSlug: locationSlug || undefined,
          reason: reason || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add");
      setReason("");
      await fetchBlackouts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this closure date?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/blackouts?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchBlackouts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-4xl font-normal text-foreground">
          Closure dates
        </h2>
        <p className="mt-2 text-xl text-muted">
          Block online bookings on specific dates — for holidays, private
          events, or maintenance
        </p>
      </div>

      <form onSubmit={handleAdd} className="luxury-card p-8">
        <p className="label-caps">Add closure</p>
        {error && (
          <p className="mt-4 border border-red-800/40 bg-red-950/25 px-5 py-3 text-lg text-red-200">
            {error}
          </p>
        )}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="label-caps">Date</span>
            <input
              type="date"
              value={date}
              min={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => setDate(e.target.value)}
              className="luxury-input mt-3"
              required
            />
          </label>
          <label className="block">
            <span className="label-caps">Location</span>
            <select
              value={locationSlug}
              onChange={(e) => setLocationSlug(e.target.value)}
              className="luxury-input mt-3"
            >
              <option value="" className="bg-surface">
                Both branches
              </option>
              {locations.map((loc) => (
                <option key={loc.slug} value={loc.slug} className="bg-surface">
                  {loc.shortName} only
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="label-caps">Reason (optional)</span>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Bank holiday, private event…"
              className="luxury-input mt-3"
            />
          </label>
        </div>
        <Button type="submit" disabled={saving} className="mt-6">
          {saving ? "Adding…" : "Add closure date"}
        </Button>
      </form>

      <div>
        <p className="label-caps">Upcoming closures</p>
        {loading ? (
          <p className="mt-4 text-xl text-muted">Loading…</p>
        ) : blackouts.length === 0 ? (
          <div className="mt-4 luxury-card px-8 py-12 text-center text-xl text-muted">
            No closure dates scheduled
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {blackouts.map((blackout) => (
              <li
                key={blackout.id}
                className="luxury-card flex flex-wrap items-center justify-between gap-4 p-6"
              >
                <div>
                  <p className="font-display text-2xl text-foreground">
                    {format(
                      new Date(`${blackout.date}T12:00:00`),
                      "EEE d MMM yyyy",
                    )}
                  </p>
                  <p className="mt-2 text-lg text-muted">
                    {blackout.locationSlug
                      ? locations.find((l) => l.slug === blackout.locationSlug)
                          ?.shortName
                      : "Both branches"}
                    {blackout.reason ? ` · ${blackout.reason}` : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={() => handleDelete(blackout.id)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
