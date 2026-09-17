import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import type { BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<BookingStatus, string> = {
  confirmed: "border-gold/45 bg-gold/15 text-gold-light",
  seated: "border-emerald-500/45 bg-emerald-500/15 text-emerald-300",
  completed: "border-foreground/20 bg-surface text-muted-light",
  cancelled: "border-red-500/45 bg-red-500/15 text-red-300",
  no_show: "border-orange-500/45 bg-orange-500/15 text-orange-300",
};

export function AdminStatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border px-4 py-1.5 text-base font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}
