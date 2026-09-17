import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/** Server-side key: service role preferred, publishable key as fallback */
export function getSupabaseServerKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServerKey());
}

export function createServerClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseServerKey();

  if (!url || !key) {
    throw new Error("Supabase URL and key are required");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
