import { z } from "zod";
import { MAX_PARTY_SIZE, MIN_PARTY_SIZE } from "../constants";

export const bookingSchema = z.object({
  locationSlug: z.enum(["kentish-town", "finchley-road"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  partySize: z.coerce.number().int().min(MIN_PARTY_SIZE).max(MAX_PARTY_SIZE),
  seatingPreference: z.enum([
    "side",
    "centre",
    "near_window",
    "quiet",
    "no_preference",
  ]),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  specialRequests: z.string().max(500).optional(),
  consentNotifications: z.literal(true, {
    error: "You must agree to receive booking confirmations and reminders",
  }),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
