import { isSupabaseConfigured } from "../supabase/client";
import { isServerlessRuntime } from "./data-dir";

export function canPersistBookings(): boolean {
  if (isSupabaseConfigured()) return true;
  // Local JSON store is unreliable on serverless (ephemeral /tmp, not shared)
  return !isServerlessRuntime() && process.env.NODE_ENV !== "production";
}

export function bookingPersistenceError(): string {
  if (isServerlessRuntime() || process.env.NODE_ENV === "production") {
    return "Online booking is temporarily unavailable. Please call Kentish Town on 020 7428 9898 or Finchley Road on 020 7625 6889.";
  }
  return "Booking storage is not configured. Add Supabase credentials to .env.local.";
}
