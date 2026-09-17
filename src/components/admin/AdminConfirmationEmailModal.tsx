"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Booking } from "@/lib/types";

interface EmailPreview {
  subject: string;
  recipient: string;
  context: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    referenceCode: string;
    venueShortName: string;
    dateTime: string;
    partyLabel: string;
    seating: string;
    specialRequests?: string;
  };
}

interface AdminConfirmationEmailModalProps {
  booking: Booking;
  onClose: () => void;
  onSent: (booking?: Booking) => void;
}

export function AdminConfirmationEmailModal({
  booking,
  onClose,
  onSent,
}: AdminConfirmationEmailModalProps) {
  const [preview, setPreview] = useState<EmailPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/bookings/resend?id=${encodeURIComponent(booking.id)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load template");
      setPreview(data.preview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load template");
    } finally {
      setLoading(false);
    }
  }, [booking.id]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  async function handleSend() {
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/bookings/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: booking.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to send email");
      }
      setSuccess(data.message ?? `Sent to ${data.recipient}`);
      onSent(data.booking as Booking | undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-email-title"
    >
      <div className="luxury-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps">Confirmation email</p>
            <h2
              id="confirmation-email-title"
              className="mt-2 font-display text-3xl text-foreground"
            >
              Send to guest
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-muted hover:text-foreground"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading ? (
          <p className="mt-8 text-lg text-muted">Loading template…</p>
        ) : preview ? (
          <div className="mt-8 space-y-6">
            <div className="rounded border border-gold/15 bg-surface-alt/40 p-5">
              <p className="text-sm uppercase tracking-[0.12em] text-gold">
                Subject
              </p>
              <p className="mt-2 text-lg text-foreground">{preview.subject}</p>
              <p className="mt-4 text-sm uppercase tracking-[0.12em] text-gold">
                To
              </p>
              <p className="mt-2 text-lg text-foreground">{preview.recipient}</p>
            </div>

            <div>
              <p className="label-caps">Filled from booking</p>
              <dl className="mt-4 space-y-3 text-base">
                <PreviewRow label="Guest" value={preview.context.customerName} />
                <PreviewRow label="Email" value={preview.context.customerEmail} />
                <PreviewRow label="Phone" value={preview.context.customerPhone} />
                <PreviewRow
                  label="Reference"
                  value={preview.context.referenceCode}
                />
                <PreviewRow label="Venue" value={preview.context.venueShortName} />
                <PreviewRow label="When" value={preview.context.dateTime} />
                <PreviewRow label="Party" value={preview.context.partyLabel} />
                <PreviewRow label="Seating" value={preview.context.seating} />
                {preview.context.specialRequests ? (
                  <PreviewRow
                    label="Requests"
                    value={preview.context.specialRequests}
                  />
                ) : null}
              </dl>
            </div>
          </div>
        ) : null}

        {error && <p className="mt-6 text-base text-red-300">{error}</p>}
        {success && (
          <p className="mt-6 text-base text-emerald-300">{success}</p>
        )}

        <div className="mt-8 flex flex-wrap gap-3 border-t border-gold/15 pt-6">
          <Button
            type="button"
            disabled={sending || loading || !preview || Boolean(success)}
            onClick={handleSend}
          >
            {sending ? "Sending…" : "Send confirmation email"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            {success ? "Close" : "Cancel"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gold/10 pb-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}
