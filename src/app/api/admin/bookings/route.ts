import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { createBooking, listBookings, updateBooking } from "@/lib/db/store";
import { sendBookingConfirmation } from "@/lib/notifications/send";
import type { BookingStatus } from "@/lib/types";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const locationSlug = searchParams.get("location") ?? undefined;
  const date = searchParams.get("date") ?? undefined;
  const status = searchParams.get("status") as BookingStatus | undefined;

  const bookings = await listBookings({ locationSlug, date, status });
  return NextResponse.json({ bookings });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const booking = await createBooking({
      ...body,
      source: body.source ?? "phone",
    });

    if (body.sendConfirmation !== false) {
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
    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const booking = await updateBooking(id, updates);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
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
