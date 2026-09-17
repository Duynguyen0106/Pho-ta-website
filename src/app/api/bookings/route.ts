import { NextRequest, NextResponse } from "next/server";
import { isSlotAvailable } from "@/lib/bookings/availability";
import { createBooking } from "@/lib/db/store";
import { sendBookingConfirmation } from "@/lib/notifications/send";
import { bookingSchema } from "@/lib/validation/booking";

export async function POST(request: NextRequest) {
  try {
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

    await sendBookingConfirmation(booking);

    return NextResponse.json({
      id: booking.id,
      referenceCode: booking.referenceCode,
    });
  } catch (error) {
    console.error("[api/bookings]", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
