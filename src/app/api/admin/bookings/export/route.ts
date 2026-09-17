import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { SEATING_LABELS, BOOKING_STATUS_LABELS, BOOKING_SOURCE_LABELS } from "@/lib/constants";
import { listBookings } from "@/lib/db/store";
import type { BookingStatus } from "@/lib/types";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get("date") ?? undefined;
    const status = searchParams.get("status") as BookingStatus | undefined;

    const bookings = await listBookings({
      date,
      locationSlug: "finchley-road",
      status,
    });

    const headers = [
      "Reference",
      "Date",
      "Time",
      "Guest",
      "Email",
      "Phone",
      "Guests",
      "Seating",
      "Status",
      "Source",
      "Table",
      "Special requests",
    ];

    const rows = bookings.map((b) => [
      b.referenceCode,
      b.date,
      b.time,
      b.customerName,
      b.customerEmail,
      b.customerPhone,
      String(b.partySize),
      SEATING_LABELS[b.seatingPreference],
      BOOKING_STATUS_LABELS[b.status],
      BOOKING_SOURCE_LABELS[b.source],
      b.seatedAtTable ?? "",
      b.specialRequests ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
      .join("\n");

    const filename = `pho-ta-bookings-${date ?? "all"}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[admin/bookings/export:GET]", error);
    return NextResponse.json(
      { error: "Failed to export bookings" },
      { status: 500 },
    );
  }
}
