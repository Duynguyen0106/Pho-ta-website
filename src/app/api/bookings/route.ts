import { NextRequest, NextResponse } from "next/server";
import { isSlotAvailable } from "@/lib/bookings/availability";
import {
  bookingPersistenceError,
  canPersistBookings,
} from "@/lib/db/persistence";
import { createBooking } from "@/lib/db/store";
import { sendBookingConfirmation } from "@/lib/notifications/send";
import { bookingSchema } from "@/lib/validation/booking";

export async function POST(request: NextRequest) {
  try {
    if (!canPersistBookings()) {
      return NextResponse.json(
        { error: bookingPersistenceError() },
        { status: 503 },
      );
    }

    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid booking data" },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const available = await isSlotAvailable(
      data.locationSlug,
      data.date,
      data.time,
      data.partySize,
    );

    if (!available) {
      return NextResponse.json(
        { error: "This time slot is no longer available. Please choose another." },
        { status: 409 },
      );
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
    });

    try {
      await sendBookingConfirmation(booking);
    } catch (notifyError) {
      // Booking is saved — do not fail the request if email/SMS fails
      console.error("[api/bookings:notify]", notifyError);
    }

    return NextResponse.json({
      id: booking.id,
      referenceCode: booking.referenceCode,
    });
  } catch (error) {
    console.error("[api/bookings]", error);
    const message =
      error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json(
      { error: message.includes("Supabase") ? bookingPersistenceError() : message },
      { status: 500 },
    );
  }
}
