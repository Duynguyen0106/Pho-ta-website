import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { filterBookingsNeedingReminder } from "../bookings/reminders";
import {
  createServerClient,
  isSupabaseConfigured,
} from "../supabase/client";
import type {
  Booking,
  BookingStatus,
  CreateBookingInput,
  Customer,
} from "../types";

const DATA_DIR = path.join(process.cwd(), ".data");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");
const CUSTOMERS_FILE = path.join(DATA_DIR, "customers.json");

interface LocalStore {
  bookings: Booking[];
  customers: Customer[];
}

let localStoreCache: LocalStore | null = null;

function useSupabase(): boolean {
  return isSupabaseConfigured();
}

function getSupabase() {
  return createServerClient();
}

async function readLocalStore(): Promise<LocalStore> {
  if (localStoreCache) return localStoreCache;

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const [bookingsRaw, customersRaw] = await Promise.all([
      fs.readFile(BOOKINGS_FILE, "utf-8").catch(() => "[]"),
      fs.readFile(CUSTOMERS_FILE, "utf-8").catch(() => "[]"),
    ]);
    localStoreCache = {
      bookings: JSON.parse(bookingsRaw) as Booking[],
      customers: JSON.parse(customersRaw) as Customer[],
    };
  } catch {
    localStoreCache = { bookings: [], customers: [] };
  }

  return localStoreCache;
}

async function writeLocalStore(store: LocalStore): Promise<void> {
  localStoreCache = store;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await Promise.all([
    fs.writeFile(BOOKINGS_FILE, JSON.stringify(store.bookings, null, 2)),
    fs.writeFile(CUSTOMERS_FILE, JSON.stringify(store.customers, null, 2)),
  ]);
}

function generateReferenceCode(locationSlug: string): string {
  const prefix = locationSlug === "kentish-town" ? "KT" : "FR";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `PT-${prefix}-${date}-${suffix}`;
}

function mapSupabaseBooking(row: Record<string, unknown>): Booking {
  return {
    id: row.id as string,
    referenceCode: row.reference_code as string,
    locationSlug: row.location_slug as Booking["locationSlug"],
    customerId: (row.customer_id as string) ?? "",
    customerName: row.customer_name as string,
    customerEmail: row.customer_email as string,
    customerPhone: row.customer_phone as string,
    date: row.booking_date as string,
    time: (row.booking_time as string).slice(0, 5),
    partySize: row.party_size as number,
    seatingPreference: row.seating_preference as Booking["seatingPreference"],
    specialRequests: (row.special_requests as string) || undefined,
    status: row.status as BookingStatus,
    source: row.source as Booking["source"],
    reminderSentAt: (row.reminder_sent_at as string) || undefined,
    confirmationSentAt: (row.confirmation_sent_at as string) || undefined,
    seatedAtTable: (row.seated_at_table as string) || undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function findOrCreateCustomer(input: {
  name: string;
  email: string;
  phone: string;
}): Promise<Customer> {
  const normalizedEmail = input.email.toLowerCase().trim();
  const normalizedPhone = input.phone.replace(/\s/g, "");

  if (useSupabase()) {
    const supabase = getSupabase();
    const { data: existing } = await supabase
      .from("customers")
      .select("*")
      .or(`email.eq.${normalizedEmail},phone.eq.${normalizedPhone}`)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        notes: existing.notes ?? undefined,
        createdAt: existing.created_at,
      };
    }

    const { data, error } = await supabase
      .from("customers")
      .insert({
        name: input.name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      createdAt: data.created_at,
    };
  }

  const store = await readLocalStore();
  let customer = store.customers.find(
    (c) =>
      c.email.toLowerCase() === normalizedEmail ||
      c.phone.replace(/\s/g, "") === normalizedPhone,
  );

  if (!customer) {
    customer = {
      id: randomUUID(),
      name: input.name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      createdAt: new Date().toISOString(),
    };
    store.customers.push(customer);
    await writeLocalStore(store);
  }

  return customer;
}

export async function getBookingsForSlot(
  locationSlug: string,
  date: string,
  time: string,
): Promise<Booking[]> {
  if (useSupabase()) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("location_slug", locationSlug)
      .eq("booking_date", date)
      .eq("booking_time", `${time}:00`)
      .neq("status", "cancelled");

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSupabaseBooking);
  }

  const store = await readLocalStore();
  return store.bookings.filter(
    (b) =>
      b.locationSlug === locationSlug &&
      b.date === date &&
      b.time === time &&
      b.status !== "cancelled",
  );
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<Booking> {
  const customer = await findOrCreateCustomer({
    name: input.name,
    email: input.email,
    phone: input.phone,
  });

  const now = new Date().toISOString();
  const referenceCode = generateReferenceCode(input.locationSlug);

  if (useSupabase()) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        reference_code: referenceCode,
        location_slug: input.locationSlug,
        customer_id: customer.id,
        customer_name: input.name.trim(),
        customer_email: customer.email,
        customer_phone: customer.phone,
        booking_date: input.date,
        booking_time: `${input.time}:00`,
        party_size: input.partySize,
        seating_preference: input.seatingPreference,
        special_requests: input.specialRequests?.trim() || null,
        status: "confirmed",
        source: input.source ?? "website",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapSupabaseBooking(data);
  }

  const booking: Booking = {
    id: randomUUID(),
    referenceCode,
    locationSlug: input.locationSlug,
    customerId: customer.id,
    customerName: input.name.trim(),
    customerEmail: customer.email,
    customerPhone: customer.phone,
    date: input.date,
    time: input.time,
    partySize: input.partySize,
    seatingPreference: input.seatingPreference,
    specialRequests: input.specialRequests?.trim(),
    status: "confirmed",
    source: input.source ?? "website",
    createdAt: now,
    updatedAt: now,
  };

  const store = await readLocalStore();
  store.bookings.push(booking);
  await writeLocalStore(store);
  return booking;
}

export async function getBookingByReference(
  referenceCode: string,
): Promise<Booking | null> {
  if (useSupabase()) {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("reference_code", referenceCode)
      .maybeSingle();
    return data ? mapSupabaseBooking(data) : null;
  }

  const store = await readLocalStore();
  return store.bookings.find((b) => b.referenceCode === referenceCode) ?? null;
}

export async function listBookings(filters?: {
  locationSlug?: string;
  date?: string;
  status?: BookingStatus;
}): Promise<Booking[]> {
  if (useSupabase()) {
    const supabase = getSupabase();
    let query = supabase.from("bookings").select("*").order("booking_date", {
      ascending: true,
    });

    if (filters?.locationSlug) {
      query = query.eq("location_slug", filters.locationSlug);
    }
    if (filters?.date) {
      query = query.eq("booking_date", filters.date);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSupabaseBooking);
  }

  const store = await readLocalStore();
  return store.bookings
    .filter((b) => {
      if (filters?.locationSlug && b.locationSlug !== filters.locationSlug) {
        return false;
      }
      if (filters?.date && b.date !== filters.date) return false;
      if (filters?.status && b.status !== filters.status) return false;
      return true;
    })
    .sort((a, b) =>
      `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
    );
}

export async function updateBooking(
  id: string,
  updates: Partial<
    Pick<
      Booking,
      | "status"
      | "seatedAtTable"
      | "reminderSentAt"
      | "confirmationSentAt"
      | "specialRequests"
    >
  > & { date?: string; time?: string; partySize?: number },
): Promise<Booking | null> {
  if (useSupabase()) {
    const supabase = getSupabase();
    const payload: Record<string, unknown> = {};
    if (updates.status) payload.status = updates.status;
    if (updates.seatedAtTable !== undefined) {
      payload.seated_at_table = updates.seatedAtTable;
    }
    if (updates.reminderSentAt) payload.reminder_sent_at = updates.reminderSentAt;
    if (updates.confirmationSentAt) {
      payload.confirmation_sent_at = updates.confirmationSentAt;
    }
    if (updates.specialRequests !== undefined) {
      payload.special_requests = updates.specialRequests;
    }
    if (updates.date) payload.booking_date = updates.date;
    if (updates.time) payload.booking_time = `${updates.time}:00`;
    if (updates.partySize) payload.party_size = updates.partySize;

    const { data, error } = await supabase
      .from("bookings")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapSupabaseBooking(data);
  }

  const store = await readLocalStore();
  const index = store.bookings.findIndex((b) => b.id === id);
  if (index === -1) return null;

  store.bookings[index] = {
    ...store.bookings[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await writeLocalStore(store);
  return store.bookings[index];
}

export async function getBookingsNeedingReminder(): Promise<Booking[]> {
  const all = await listBookings({ status: "confirmed" });
  return filterBookingsNeedingReminder(all);
}

export function isUsingLocalStore(): boolean {
  return !useSupabase();
}
