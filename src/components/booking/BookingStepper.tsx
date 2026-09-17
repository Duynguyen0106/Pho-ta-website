"use client";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Venue" },
  { id: 2, label: "Time" },
  { id: 3, label: "Seating" },
  { id: 4, label: "Details" },
] as const;

interface BookingStepperProps {
  currentStep: number;
}

export function BookingStepper({ currentStep }: BookingStepperProps) {
  return (
    <nav aria-label="Booking progress" className="w-full">
      <ol className="flex items-start justify-between gap-2">
        {STEPS.map((step, index) => {
          const done = currentStep > step.id;
          const active = currentStep === step.id;

          return (
            <li key={step.id} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {index > 0 && (
                  <div
                    className={cn(
                      "h-px flex-1 transition-colors duration-500",
                      done || active ? "bg-gold" : "bg-gold/20",
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center border font-display text-lg transition-all duration-500",
                    done
                      ? "border-gold bg-gold text-background"
                      : active
                        ? "border-gold bg-gold/10 text-gold-light"
                        : "border-gold/25 bg-surface text-muted",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? "✓" : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-px flex-1 transition-colors duration-500",
                      done ? "bg-gold" : "bg-gold/20",
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "mt-3 hidden text-center text-xs uppercase tracking-[0.18em] sm:block",
                  active ? "text-gold-light" : done ? "text-muted" : "text-muted/60",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
