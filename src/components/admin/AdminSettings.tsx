"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { locations } from "@/lib/data/locations";
import type { LocationSlug } from "@/lib/types";

interface LocationSettings {
  openTime: string;
  closeTime: string;
  slotIntervalMinutes: number;
  maxCoversPerSlot: number;
  maxPartySize: number;
}

interface SiteFeatures {
  menuAssistantEnabled: boolean;
}

type SettingsMap = Record<LocationSlug, LocationSettings>;

export function AdminSettings() {
  const [settings, setSettings] = useState<SettingsMap | null>(null);
  const [features, setFeatures] = useState<SiteFeatures>({
    menuAssistantEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    if (res.ok) {
      setSettings(data.settings.locations);
      setFeatures(
        data.settings.features ?? { menuAssistantEnabled: true },
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  function updateField(
    slug: LocationSlug,
    field: keyof LocationSettings,
    value: string | number,
  ) {
    if (!settings) return;
    setSettings({
      ...settings,
      [slug]: { ...settings[slug], [field]: value },
    });
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations: settings, features }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSettings(data.settings.locations);
      setFeatures(data.settings.features ?? features);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return <p className="text-xl text-muted">Loading settings…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-4xl font-normal text-foreground">
          Venue settings
        </h2>
        <p className="mt-2 text-xl text-muted">
          Opening hours, booking capacity, and website features
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="fine-dining-panel p-6">
          <h3 className="font-display text-2xl text-foreground">Website</h3>
          <p className="mt-1 text-base text-muted">
            Control guest-facing features on the public menu page
          </p>
          <label className="mt-6 flex cursor-pointer items-start gap-4">
            <input
              type="checkbox"
              checked={features.menuAssistantEnabled}
              onChange={(e) => {
                setFeatures({
                  ...features,
                  menuAssistantEnabled: e.target.checked,
                });
                setSaved(false);
              }}
              className="mt-1 h-5 w-5 accent-gold"
            />
            <span>
              <span className="block text-lg text-foreground">
                Menu AI helper
              </span>
              <span className="mt-1 block text-base text-muted">
                Show the floating chat on /menu. Prepared answers still work
                without an API key; disable to hide the helper entirely.
              </span>
            </span>
          </label>
        </section>

        {locations.map((loc) => {
          const s = settings[loc.slug as LocationSlug];
          return (
            <section key={loc.slug} className="fine-dining-panel p-6">
              <h3 className="font-display text-2xl text-foreground">
                {loc.shortName}
              </h3>
              <p className="mt-1 text-base text-muted">{loc.address}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label>
                  <span className="label-caps">Opens</span>
                  <input
                    type="time"
                    value={s.openTime}
                    onChange={(e) =>
                      updateField(loc.slug as LocationSlug, "openTime", e.target.value)
                    }
                    className="luxury-input mt-3"
                    required
                  />
                </label>
                <label>
                  <span className="label-caps">Closes</span>
                  <input
                    type="time"
                    value={s.closeTime}
                    onChange={(e) =>
                      updateField(loc.slug as LocationSlug, "closeTime", e.target.value)
                    }
                    className="luxury-input mt-3"
                    required
                  />
                </label>
                <label>
                  <span className="label-caps">Slot interval (minutes)</span>
                  <input
                    type="number"
                    min={15}
                    max={60}
                    step={15}
                    value={s.slotIntervalMinutes}
                    onChange={(e) =>
                      updateField(
                        loc.slug as LocationSlug,
                        "slotIntervalMinutes",
                        Number(e.target.value),
                      )
                    }
                    className="luxury-input mt-3"
                    required
                  />
                </label>
                <label>
                  <span className="label-caps">Max covers per slot</span>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={s.maxCoversPerSlot}
                    onChange={(e) =>
                      updateField(
                        loc.slug as LocationSlug,
                        "maxCoversPerSlot",
                        Number(e.target.value),
                      )
                    }
                    className="luxury-input mt-3"
                    required
                  />
                </label>
                <label>
                  <span className="label-caps">Max party size</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={s.maxPartySize}
                    onChange={(e) =>
                      updateField(
                        loc.slug as LocationSlug,
                        "maxPartySize",
                        Number(e.target.value),
                      )
                    }
                    className="luxury-input mt-3"
                    required
                  />
                </label>
              </div>
            </section>
          );
        })}

        {error && <p className="text-base text-red-300">{error}</p>}
        {saved && (
          <p className="text-base text-emerald-300">Settings saved.</p>
        )}

        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </form>
    </div>
  );
}
