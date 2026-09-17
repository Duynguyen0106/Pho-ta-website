import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import {
  createBlackoutDate,
  deleteBlackoutDate,
  listBlackoutDates,
} from "@/lib/db/blackout-store";
import type { LocationSlug } from "@/lib/types";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const blackouts = await listBlackoutDates({
      locationSlug: searchParams.get("location") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });
    return NextResponse.json({ blackouts });
  } catch (error) {
    console.error("[admin/blackouts:GET]", error);
    return NextResponse.json(
      { error: "Failed to load blackout dates" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, locationSlug, reason } = body as {
      date?: string;
      locationSlug?: LocationSlug | "";
      reason?: string;
    };

    if (!date) {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    const blackout = await createBlackoutDate({
      date,
      locationSlug: locationSlug || undefined,
      reason,
    });

    return NextResponse.json({ blackout });
  } catch (error) {
    console.error("[admin/blackouts:POST]", error);
    return NextResponse.json(
      { error: "Failed to create blackout date" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const ok = await deleteBlackoutDate(id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/blackouts:DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete blackout date" },
      { status: 500 },
    );
  }
}
