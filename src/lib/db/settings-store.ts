import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "./data-dir";
import { locations } from "../data/locations";
import {
  createServerClient,
  isSupabaseConfigured,
} from "../supabase/client";
import type { Location, LocationSlug } from "../types";

export interface LocationSettings {
  openTime: string;
  closeTime: string;
  slotIntervalMinutes: number;
  maxCoversPerSlot: number;
  maxPartySize: number;
}

export interface SiteSettings {
  locations: Record<LocationSlug, LocationSettings>;
}

function settingsFile(): string {
  return path.join(getDataDir(), "site-settings.json");
}

let cache: SiteSettings | null = null;

function defaultsFromCode(): SiteSettings {
  return {
    locations: Object.fromEntries(
      locations.map((loc) => [
        loc.slug,
        {
          openTime: loc.openTime,
          closeTime: loc.closeTime,
          slotIntervalMinutes: loc.slotIntervalMinutes,
          maxCoversPerSlot: loc.maxCoversPerSlot,
          maxPartySize: 12,
        },
      ]),
    ) as Record<LocationSlug, LocationSettings>,
  };
}

async function readLocal(): Promise<SiteSettings | null> {
  try {
    const raw = await fs.readFile(settingsFile(), "utf-8");
    return JSON.parse(raw) as SiteSettings;
  } catch {
    return null;
  }
}

async function writeLocal(settings: SiteSettings): Promise<void> {
  cache = settings;
  const dataDir = getDataDir();
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(settingsFile(), JSON.stringify(settings, null, 2));
}

async function readSupabase(): Promise<SiteSettings | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("data")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    if (error.message.includes("site_settings") || error.code === "PGRST205") {
      return null;
    }
    throw new Error(error.message);
  }

  return (data?.data as SiteSettings) ?? null;
}

async function writeSupabase(settings: SiteSettings): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from("site_settings").upsert({
    id: "default",
    data: settings,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    if (error.message.includes("site_settings") || error.code === "PGRST205") {
      await writeLocal(settings);
      return;
    }
    throw new Error(error.message);
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (cache) return cache;

  const base = defaultsFromCode();
  let stored: SiteSettings | null = null;

  if (isSupabaseConfigured()) {
    stored = await readSupabase();
  } else {
    stored = await readLocal();
  }

  if (!stored) {
    cache = base;
    return base;
  }

  cache = {
    locations: {
      "kentish-town": { ...base.locations["kentish-town"], ...stored.locations["kentish-town"] },
      "finchley-road": { ...base.locations["finchley-road"], ...stored.locations["finchley-road"] },
    },
  };
  return cache;
}

export async function saveSiteSettings(
  updates: Partial<Record<LocationSlug, Partial<LocationSettings>>>,
): Promise<SiteSettings> {
  const current = await getSiteSettings();
  for (const slug of ["kentish-town", "finchley-road"] as const) {
    if (updates[slug]) {
      current.locations[slug] = {
        ...current.locations[slug],
        ...updates[slug],
      };
    }
  }

  cache = current;
  if (isSupabaseConfigured()) {
    await writeSupabase(current);
  } else {
    await writeLocal(current);
  }
  return current;
}

export async function getResolvedLocation(slug: LocationSlug): Promise<Location> {
  const base = locations.find((l) => l.slug === slug)!;
  const settings = await getSiteSettings();
  const override = settings.locations[slug];
  return { ...base, ...override };
}

export async function getResolvedLocations(): Promise<Location[]> {
  const slugs: LocationSlug[] = ["kentish-town", "finchley-road"];
  return Promise.all(slugs.map((slug) => getResolvedLocation(slug)));
}
