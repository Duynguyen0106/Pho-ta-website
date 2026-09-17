export type LocationSlug = "finchley-road";

export type SeatingPreference =
  | "side"
  | "centre"
  | "near_window"
  | "quiet"
  | "no_preference";

export type BookingStatus =
  | "confirmed"
  | "seated"
  | "completed"
  | "cancelled"
  | "no_show";

export type BookingSource = "website" | "phone" | "walk_in";

export interface BlackoutDate {
  id: string;
  locationSlug?: LocationSlug;
  date: string;
  reason?: string;
}

export interface Location {
  slug: LocationSlug;
  name: string;
  shortName: string;
  address: string;
  city: string;
  postcode: string;
  phone: string;
  email: string;
  mapUrl: string;
  maxCoversPerSlot: number;
  openTime: string;
  closeTime: string;
  slotIntervalMinutes: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  referenceCode: string;
  locationSlug: LocationSlug;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number;
  seatingPreference: SeatingPreference;
  specialRequests?: string;
  status: BookingStatus;
  source: BookingSource;
  reminderSentAt?: string;
  confirmationSentAt?: string;
  seatedAtTable?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  locationSlug: LocationSlug;
  date: string;
  time: string;
  partySize: number;
  seatingPreference: SeatingPreference;
  name: string;
  email: string;
  phone: string;
  specialRequests?: string;
  source?: BookingSource;
}

export interface AvailabilitySlot {
  time: string;
  available: boolean;
  remainingCovers: number;
}
