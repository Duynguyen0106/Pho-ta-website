"use client";

import { format, parseISO } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import type { NotificationLogEntry } from "@/lib/db/notification-log-store";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<NotificationLogEntry["type"], string> = {
  confirmation: "Confirmation",
  reminder: "Reminder",
  cancellation: "Cancellation",
  staff: "Staff alert",
};

const STATUS_STYLES: Record<NotificationLogEntry["status"], string> = {
  sent: "text-emerald-300",
  failed: "text-red-300",
  skipped: "text-orange-300",
};

export function AdminNotifications() {
  const [entries, setEntries] = useState<NotificationLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLog = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/notifications");
    const data = await res.json();
    if (res.ok) setEntries(data.entries);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-4xl font-normal text-foreground">
          Notifications log
        </h2>
        <p className="mt-2 text-xl text-muted">
          Email delivery history for confirmations, reminders, and cancellations
        </p>
      </div>

      {loading ? (
        <p className="text-xl text-muted">Loading log…</p>
      ) : entries.length === 0 ? (
        <div className="luxury-card px-8 py-16 text-center text-xl text-muted">
          No notifications logged yet
        </div>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {entries.map((entry) => (
              <li key={entry.id} className="luxury-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-muted">
                      {format(parseISO(entry.createdAt), "d MMM yyyy HH:mm")}
                    </p>
                    <p className="mt-1 text-lg text-foreground">
                      {TYPE_LABELS[entry.type]}
                    </p>
                    <p className="mt-2 break-all text-base text-muted">
                      {entry.recipient}
                    </p>
                    {entry.referenceCode && (
                      <p className="mt-1 font-serif text-base text-gold/80">
                        {entry.referenceCode}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-medium capitalize",
                      STATUS_STYLES[entry.status],
                    )}
                  >
                    {entry.status}
                  </span>
                </div>
                {entry.error && (
                  <p className="mt-3 text-sm text-muted">{entry.error}</p>
                )}
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-left text-base">
              <thead>
                <tr className="border-b border-gold/15 text-sm uppercase tracking-[0.12em] text-gold">
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Recipient</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gold/10 hover:bg-surface-alt/40"
                  >
                    <td className="px-4 py-4 text-muted">
                      {format(parseISO(entry.createdAt), "d MMM yyyy HH:mm")}
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {TYPE_LABELS[entry.type]}
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {entry.recipient}
                    </td>
                    <td className="px-4 py-4 font-serif text-gold/80">
                      {entry.referenceCode ?? "—"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "font-medium capitalize",
                          STATUS_STYLES[entry.status],
                        )}
                        title={entry.error}
                      >
                        {entry.status}
                      </span>
                      {entry.error && (
                        <p className="mt-1 text-sm text-muted">{entry.error}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
