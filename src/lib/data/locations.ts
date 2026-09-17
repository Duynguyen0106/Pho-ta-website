import type { Location } from "../types";

export const locations: Location[] = [
  {
    slug: "kentish-town",
    name: "Pho Ta Kentish Town",
    shortName: "Kentish Town",
    address: "85 Willes Rd",
    city: "London",
    postcode: "NW5 3DN",
    phone: "020 7428 9898",
    email: "Phovagrill@gmail.com",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=85+Willes+Rd+London+NW5+3DN",
    maxCoversPerSlot: 40,
    openTime: "11:30",
    closeTime: "21:30",
    slotIntervalMinutes: 30,
  },
  {
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
  },
];

export function getLocation(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}
