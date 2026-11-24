import { z } from "zod";
import { MAX_PARTY_SIZE, MIN_PARTY_SIZE } from "../constants";

const timeRegex = /^\d{2}:\d{2}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const adminCreateBookingSchema = z.object({
  locationSlug: z.literal("finchley-road"),
  date: z.string().regex(dateRegex),
  time: z.string().regex(timeRegex),
  partySize: z.coerce.number().int().min(MIN_PARTY_SIZE).max(MAX_PARTY_SIZE),
  seatingPreference: z.enum([
    "side",
    "centre",
    "near_window",
    "quiet",
    "no_preference",
  ]),
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  phone: z.string().min(10).max(20),
  specialRequests: z.string().max(500).optional(),
  source: z.enum(["website", "phone", "walk_in"]).optional(),
  sendConfirmation: z.boolean().optional(),
  /** Bypass cover / closure checks when staff intentionally override. */
  overrideCapacity: z.boolean().optional(),
});

export const adminUpdateBookingSchema = z
  .object({
    id: z.string().min(1),
    notifyGuest: z.boolean().optional(),
    status: z
      .enum(["confirmed", "seated", "completed", "cancelled", "no_show"])
      .optional(),
    seatedAtTable: z.string().max(20).optional(),
    date: z.string().regex(dateRegex).optional(),
    time: z.string().regex(timeRegex).optional(),
    partySize: z.coerce.number().int().min(MIN_PARTY_SIZE).max(MAX_PARTY_SIZE).optional(),
    seatingPreference: z
      .enum(["side", "centre", "near_window", "quiet", "no_preference"])
      .optional(),
    customerName: z.string().min(2).max(100).optional(),
    customerEmail: z.string().email().max(200).optional(),
    customerPhone: z.string().min(10).max(20).optional(),
    specialRequests: z.string().max(500).optional(),
    locationSlug: z.literal("finchley-road").optional(),
    overrideCapacity: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).some((k) => k !== "id" && k !== "notifyGuest"), {
    message: "No updates provided",
  });