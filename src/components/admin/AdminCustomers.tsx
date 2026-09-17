"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/Button";
import { BOOKING_SOURCE_LABELS } from "@/lib/constants";
import { locations } from "@/lib/data/locations";
import type { Booking, Customer } from "@/lib/types";

export function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [history, setHistory] = useState<Booking[]>([]);
  const [stats, setStats] = useState<{
    totalBookings: number;
    noShowCount: number;
    cancelledCount: number;
  } | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    const res = await fetch(`/api/admin/customers?${params}`);
    const data = await res.json();
    if (res.ok) setCustomers(data.customers);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(fetchCustomers, 250);
    return () => window.clearTimeout(timer);
  }, [fetchCustomers]);

  async function selectCustomer(customer: Customer) {
    setSelected(customer);
    setNotes(customer.notes ?? "");
    setError("");
    setStats(null);
    const res = await fetch(`/api/admin/customers?id=${customer.id}`);
    const data = await res.json();
    if (res.ok) {
      setHistory(data.bookings);
      setStats(data.stats ?? null);
    }
  }

  async function saveNotes() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSelected(data.customer);
      fetchCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-4xl font-normal text-foreground">
          Customers
        </h2>
        <p className="mt-2 text-xl text-muted">
          Guest profiles, notes, and booking history
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search
          size={20}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold/70"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, or phone…"
          className="luxury-input pl-12"
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_400px]">
        <div>
          {loading ? (
            <p className="text-xl text-muted">Loading customers…</p>
          ) : customers.length === 0 ? (
            <div className="luxury-card px-8 py-16 text-center text-xl text-muted">
              No customers found
            </div>
          ) : (
            <div className="space-y-3">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => selectCustomer(customer)}
                  className={`luxury-card w-full p-6 text-left transition ${
                    selected?.id === customer.id
                      ? "border-gold ring-1 ring-gold/40"
                      : ""
                  }`}
                >
                  <p className="font-display text-2xl text-foreground">
                    {customer.name}
                  </p>
                  <p className="mt-2 text-lg text-muted">{customer.email}</p>
                  <p className="text-lg text-muted">{customer.phone}</p>
                  {customer.notes && (
                    <p className="mt-3 text-base text-gold/80 line-clamp-2">
                      {customer.notes}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="luxury-card h-fit p-8 xl:sticky xl:top-36">
          {selected ? (
            <div className="space-y-6">
              <div>
                <p className="label-caps">Guest profile</p>
                <h3 className="mt-2 font-display text-3xl text-foreground">
                  {selected.name}
                </h3>
                <p className="mt-2 text-lg text-muted">{selected.email}</p>
                <p className="text-lg text-muted">{selected.phone}</p>
                {stats && (
                  <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded border border-gold/15 bg-surface-alt/40 p-3">
                      <dt className="text-sm uppercase tracking-[0.1em] text-gold">
                        Visits
                      </dt>
                      <dd className="mt-1 font-display text-2xl text-foreground">
                        {stats.totalBookings}
                      </dd>
                    </div>
                    <div className="rounded border border-orange-500/25 bg-orange-500/10 p-3">
                      <dt className="text-sm uppercase tracking-[0.1em] text-orange-300">
                        No-shows
                      </dt>
                      <dd className="mt-1 font-display text-2xl text-orange-300">
                        {stats.noShowCount}
                      </dd>
                    </div>
                    <div className="rounded border border-red-500/25 bg-red-500/10 p-3">
                      <dt className="text-sm uppercase tracking-[0.1em] text-red-300">
                        Cancelled
                      </dt>
                      <dd className="mt-1 font-display text-2xl text-red-300">
                        {stats.cancelledCount}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>

              <div>
                <p className="label-caps">Staff notes</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="VIP guest, allergies, preferences…"
                  className="luxury-input mt-3 resize-none"
                />
                {error && (
                  <p className="mt-2 text-base text-red-300">{error}</p>
                )}
                <Button
                  type="button"
                  size="sm"
                  className="mt-3"
                  disabled={saving}
                  onClick={saveNotes}
                >
                  {saving ? "Saving…" : "Save notes"}
                </Button>
              </div>

              <div className="border-t border-gold/15 pt-6">
                <p className="label-caps">Booking history</p>
                {history.length === 0 ? (
                  <p className="mt-3 text-lg text-muted">No bookings yet</p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {history.map((booking) => (
                      <li
                        key={booking.id}
                        className="rounded border border-gold/15 bg-surface-alt/40 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg text-foreground">
                              {booking.date} · {booking.time}
                            </p>
                            <p className="mt-1 text-base text-muted">
                              {locations.find(
                                (l) => l.slug === booking.locationSlug,
                              )?.shortName}{" "}
                              · {booking.partySize} guests ·{" "}
                              {BOOKING_SOURCE_LABELS[booking.source]}
                            </p>
                            <p className="mt-1 font-serif text-base text-gold/80">
                              {booking.referenceCode}
                            </p>
                          </div>
                          <AdminStatusBadge status={booking.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xl leading-relaxed text-muted">
              Select a customer to view their profile, add notes, and see past
              reservations.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
