import { NextRequest, NextResponse } from "next/server";
import { getBranchMenuForLocation, getMenu } from "@/lib/db/menu-store";
import type { MenuLocationSlug } from "@/lib/menu/types";

const VALID_LOCATIONS = new Set<MenuLocationSlug>(["finchley-road"]);

export async function GET(request: NextRequest) {
  try {
    const location = request.nextUrl.searchParams.get(
      "location",
    ) as MenuLocationSlug | null;

    if (location && VALID_LOCATIONS.has(location)) {
      const branchMenu = await getBranchMenuForLocation(location);
      return NextResponse.json({ location, ...branchMenu });
    }

    const menu = await getMenu();
    return NextResponse.json(menu);
  } catch (error) {
    console.error("[menu:GET]", error);
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 });
  }
}
