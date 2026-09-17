/**
 * Public Supabase project defaults.
 * The publishable key is client-facing — safe to embed when Vercel env vars are unset.
 */
export const DEFAULT_SUPABASE_URL =
  "https://sccrvdqrllsgnxctyrhr.supabase.co";

export const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_TgjoQQxJW0tN17Ad8s6zJA_Irzwq727";

export function resolveSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL
  );
}

export function resolveSupabasePublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY
  );
}

export function isUsingDefaultSupabaseConfig(): boolean {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    )
  );
}
