import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  resolveSupabasePublishableKey,
  resolveSupabaseUrl,
} from "./config";

export function getSupabaseUrl(): string {
  return resolveSupabaseUrl();
}

/** Server-side key: service role preferred, publishable key as fallback */
export function getSupabaseServerKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    resolveSupabasePublishableKey()
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServerKey());
}

export function createServerClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseServerKey();

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
