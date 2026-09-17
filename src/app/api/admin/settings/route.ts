import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import {
  getSiteSettings,
  saveSiteSettings,
  type LocationSettings,
} from "@/lib/db/settings-store";
import type { LocationSlug } from "@/lib/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const locations = body.locations as
      | Partial<Record<LocationSlug, Partial<LocationSettings>>>
      | undefined;
    const features = body.features as
      | Partial<{ menuAssistantEnabled: boolean }>
      | undefined;

    if (!locations && !features) {
      return NextResponse.json(
        { error: "locations or features is required" },
        { status: 400 },
      );
    }

    const settings = await saveSiteSettings({ locations, features });
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[admin/settings:PATCH]", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 },
    );
  }
}
