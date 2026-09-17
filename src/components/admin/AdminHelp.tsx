"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AdminStatus {
  storage: string;
  services: {
    database: string;
    email: string;
    sms: string;
    warnings: string[];
  };
}

export function AdminHelp() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<AdminStatus | null>(null);

  useEffect(() => {
    fetch("/api/admin/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  return (
    <div className="mb-6 rounded-xl border border-[#e8e0d4] bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-medium text-[#1a3c34]">Staff guide & system status</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className="border-t border-[#e8e0d4] px-5 py-4 text-sm text-[#5c534a]">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-[#1a3c34]">Daily workflow</h4>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Open today&apos;s date and your location filter</li>
                <li>When a guest arrives, select their booking and tap <strong>Seated</strong></li>
                <li>After they leave, mark <strong>Completed</strong></li>
                <li>For phone bookings, use <strong>Add phone booking</strong></li>
                <li>Check seating preference (window, quiet, etc.) before seating</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-[#1a3c34]">Seating preferences</h4>
              <ul className="mt-2 space-y-1">
                <li><strong>Near window</strong> — window tables first</li>
                <li><strong>Quiet table</strong> — away from kitchen and door</li>
                <li><strong>Centre / Side</strong> — main floor or side area</li>
                <li><strong>No preference</strong> — any suitable table</li>
              </ul>
            </div>
          </div>

          {status && (
            <div className="mt-4 rounded-lg bg-[#f5f2ed] p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-[#8a7f72]">
                System status
              </p>
              <p className="mt-1">
                Storage: {status.storage} · Email: {status.services.email} · SMS:{" "}
                {status.services.sms}
              </p>
              {status.services.warnings.length > 0 && (
                <ul className="mt-2 text-xs text-orange-700">
                  {status.services.warnings.map((w) => (
                    <li key={w}>⚠ {w}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
