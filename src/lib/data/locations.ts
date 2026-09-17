import type { Location } from "../types";

export const location: Location = {
  slug: "finchley-road",
  name: "Pho Ta Finchley Road",
  shortName: "Finchley Road",
  address: "2 Canfield Gardens, South Hampstead",
  city: "London",
  postcode: "NW6 3BS",
  phone: "020 7625 6889",
  email: "Photafinchley@gmail.com",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=2+Canfield+Gardens+London+NW6+3BS",
  maxCoversPerSlot: 36,
  openTime: "11:30",
  closeTime: "21:30",
  slotIntervalMinutes: 30,
};

/** @deprecated Use `location` — kept for imports that iterate a single venue */
export const locations: Location[] = [location];

export function getLocation(slug: string): Location | undefined {
  if (slug === location.slug) return location;
  return undefined;
}
