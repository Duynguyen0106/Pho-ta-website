import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { checkSlotCapacity } from "@/lib/bookings/slot-capacity";
import {
  createBooking,
  getBookingById,
  listBookings,
  updateBooking,
} from "@/lib/db/store";
import {
  sendBookingCancellation,
  sendBookingConfirmation,
} from "@/lib/notifications/send";
import {
  adminCreateBookingSchema,
  adminUpdateBookingSchema,
} from "@/lib/validation/admin-booking";
import type { BookingStatus } from "@/lib/types";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const status = searchParams.get("status") as BookingStatus | undefined;

  try {
    const bookings = await listBookings({
      locationSlug: "finchley-road",
      date,
      from,
      to,
      status,
    });
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("[admin/bookings:GET]", error);
    return NextResponse.json({ error: "Failed to load bookings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = adminCreateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid booking data" },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (!data.overrideCapacity) {
      const capacity = await checkSlotCapacity({
        locationSlug: data.locationSlug,
        date: data.date,
        time: data.time,
        partySize: data.partySize,
      });
      if (!capacity.ok) {
        return NextResponse.json({ error: capacity.reason }, { status: 409 });
      }
    }

    const booking = await createBooking({
      locationSlug: data.locationSlug,
      date: data.date,
      time: data.time,
      partySize: data.partySize,
      seatingPreference: data.seatingPreference,
      name: data.name,
      email: data.email,
      phone: data.phone,
      specialRequests: data.specialRequests,
      source: data.source ?? "phone",
    });

    if (data.sendConfirmation !== false) {
      await sendBookingConfirmation(booking);
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("[admin/bookings:POST]", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = adminUpdateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid update" },
        { status: 400 },
      );
    }

    const { id, notifyGuest, overrideCapacity, ...updates } = parsed.data;
    const existing = await getBookingById(id);
    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const nextDate = updates.date ?? existing.date;
    const nextTime = updates.time ?? existing.time;
    const nextPartySize = updates.partySize ?? existing.partySize;
    const locationSlug = updates.locationSlug ?? existing.locationSlug;

    const slotChanged =
      updates.date !== undefined ||
      updates.time !== undefined ||
      updates.partySize !== undefined;

    if (slotChanged && !overrideCapacity && updates.status !== "cancelled") {
      const capacity = await checkSlotCapacity({
        locationSlug,
        date: nextDate,
        time: nextTime,
        partySize: nextPartySize,
        excludeBookingId: id,
      });
      if (!capacity.ok) {
        return NextResponse.json({ error: capacity.reason }, { status: 409 });
      }
    }

    const booking = await updateBooking(id, updates);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (updates.status === "cancelled" && notifyGuest) {
      await sendBookingCancellation(booking);
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("[admin/bookings:PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}