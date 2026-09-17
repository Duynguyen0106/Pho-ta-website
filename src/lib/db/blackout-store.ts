import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getDataDir } from "./data-dir";
import {
  createServerClient,
  isSupabaseConfigured,
} from "../supabase/client";
import type { BlackoutDate, LocationSlug } from "../types";

function blackoutsFile(): string {
  return path.join(getDataDir(), "blackouts.json");
}

let cache: BlackoutDate[] | null = null;

function useSupabase(): boolean {
  return isSupabaseConfigured();
}

function getSupabase() {
  return createServerClient();
}

function mapRow(row: Record<string, unknown>): BlackoutDate {
  return {
    id: row.id as string,
    locationSlug: (row.location_slug as LocationSlug) || undefined,
    date: row.blackout_date as string,
    reason: (row.reason as string) || undefined,
  };
}

async function readLocal(): Promise<BlackoutDate[]> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(blackoutsFile(), "utf-8");
    cache = JSON.parse(raw) as BlackoutDate[];
  } catch {
    cache = [];
  }
  return cache;
}

async function writeLocal(blackouts: BlackoutDate[]): Promise<void> {
  cache = blackouts;
  const dataDir = getDataDir();
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(blackoutsFile(), JSON.stringify(blackouts, null, 2));
}

export async function listBlackoutDates(filters?: {
  locationSlug?: string;
  from?: string;
  to?: string;
}): Promise<BlackoutDate[]> {
  if (useSupabase()) {
    const supabase = getSupabase();
    let query = supabase
      .from("blackout_dates")
      .select("*")
      .order("blackout_date", { ascending: true });

    if (filters?.from) query = query.gte("blackout_date", filters.from);
    if (filters?.to) query = query.lte("blackout_date", filters.to);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    let rows = (data ?? []).map(mapRow);
    if (filters?.locationSlug) {
      rows = rows.filter(
        (b) => !b.locationSlug || b.locationSlug === filters.locationSlug,
      );
    }
    return rows;
  }

  const blackouts = await readLocal();
  return blackouts
    .filter((b) => {
      if (filters?.locationSlug && b.locationSlug && b.locationSlug !== filters.locationSlug) {
        return false;
      }
      if (filters?.from && b.date < filters.from) return false;
      if (filters?.to && b.date > filters.to) return false;
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function isDateBlackout(
  locationSlug: LocationSlug,
  date: string,
): Promise<boolean> {
  const blackouts = await listBlackoutDates({ from: date, to: date });
  return blackouts.some(
    (b) => b.date === date && (!b.locationSlug || b.locationSlug === locationSlug),
  );
}

export async function createBlackoutDate(input: {
  locationSlug?: LocationSlug;
  date: string;
  reason?: string;
}): Promise<BlackoutDate> {
  if (useSupabase()) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("blackout_dates")
      .insert({
        location_slug: input.locationSlug ?? null,
        blackout_date: input.date,
        reason: input.reason?.trim() || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRow(data);
  }

  const blackouts = await readLocal();
  const entry: BlackoutDate = {
    id: randomUUID(),
    locationSlug: input.locationSlug,
    date: input.date,
    reason: input.reason?.trim(),
  };
  blackouts.push(entry);
  await writeLocal(blackouts);
  return entry;
}

export async function deleteBlackoutDate(id: string): Promise<boolean> {
  if (useSupabase()) {
    const supabase = getSupabase();
    const { error } = await supabase.from("blackout_dates").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  }

  const blackouts = await readLocal();
  const next = blackouts.filter((b) => b.id !== id);
  if (next.length === blackouts.length) return false;
  await writeLocal(next);
  return true;
}
