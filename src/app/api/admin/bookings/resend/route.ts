import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import {
  getBookingById,
  getBookingByReference,
  updateBooking,
} from "@/lib/db/store";
import { sendBookingConfirmation } from "@/lib/notifications/send";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, referenceCode } = await request.json();

    let booking = null;
    if (referenceCode) {
      booking = await getBookingByReference(referenceCode);
    }

    if (!booking && id) {
      booking = await getBookingById(id);
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await sendBookingConfirmation(booking);
    const updated = await updateBooking(booking.id, {
      confirmationSentAt: new Date().toISOString(),
    });

    return NextResponse.json({ booking: updated ?? booking, ok: true });
  } catch (error) {
    console.error("[admin/bookings/resend:POST]", error);
    return NextResponse.json(
      { error: "Failed to resend confirmation" },
      { status: 500 },
    );
  }
}
