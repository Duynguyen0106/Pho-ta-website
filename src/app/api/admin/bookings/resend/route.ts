import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getBookingById, getBookingByReference } from "@/lib/db/store";
import { buildConfirmationEmailFromBooking } from "@/lib/notifications/confirmation-template";
import { resendBookingConfirmationEmail } from "@/lib/notifications/send";

async function loadBooking(id?: string, referenceCode?: string) {
  if (referenceCode) {
    const byRef = await getBookingByReference(referenceCode);
    if (byRef) return byRef;
  }
  if (id) {
    return getBookingById(id);
  }
  return null;
}

/** Preview filled confirmation template for admin review. */
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id") ?? undefined;
  const referenceCode = searchParams.get("referenceCode") ?? undefined;

  const booking = await loadBooking(id, referenceCode);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const preview = buildConfirmationEmailFromBooking(booking);
  return NextResponse.json({
    preview: {
      subject: preview.subject,
      html: preview.html,
      text: preview.text,
      recipient: preview.recipient,
      context: preview.context,
    },
  });
}

/** Send filled confirmation template to the guest email. */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, referenceCode } = await request.json();
    const booking = await loadBooking(id, referenceCode);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const result = await resendBookingConfirmationEmail(booking);

    if (!result.sent) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error,
          recipient: result.recipient,
          skipped: result.skipped,
        },
        { status: 502 },
      );
    }

    const updated = await getBookingById(booking.id);

    return NextResponse.json({
      ok: true,
      recipient: result.recipient,
      booking: updated ?? booking,
      message: `Confirmation email sent to ${result.recipient}`,
    });
  } catch (error) {
    console.error("[admin/bookings/resend:POST]", error);
    return NextResponse.json(
      { error: "Failed to resend confirmation" },
      { status: 500 },
    );
  }
}
