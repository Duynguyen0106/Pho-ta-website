"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminMobileDetailSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function AdminMobileDetailSheet({
  open,
  onClose,
  title,
  children,
  className,
}: AdminMobileDetailSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-label={title}>
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close details"
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[min(85dvh,720px)] flex-col rounded-t-xl border border-gold/20 bg-background shadow-2xl",
          className,
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gold/15 px-5 py-4">
          <p className="label-caps">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded text-muted hover:text-foreground"
            aria-label="Close"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-6">{children}</div>
      </div>
    </div>
  );
}
