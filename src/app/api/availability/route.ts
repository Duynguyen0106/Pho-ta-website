import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/lib/bookings/availability";
import type { LocationSlug } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const location = searchParams.get("location") as LocationSlug | null;
  const date = searchParams.get("date");
  const partySize = parseInt(searchParams.get("partySize") ?? "2", 10);

  if (!location || !date) {
    return NextResponse.json(
      { error: "location and date are required" },
      { status: 400 },
    );
  }

  if (location !== "finchley-road") {
    return NextResponse.json({ error: "Invalid location" }, { status: 400 });
  }

  const slots = await getAvailability(location, date, partySize);
  return NextResponse.json({ slots });
}
