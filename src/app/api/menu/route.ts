import { NextResponse } from "next/server";
import { getMenu } from "@/lib/db/menu-store";

export async function GET() {
  try {
    const menu = await getMenu();
    return NextResponse.json(menu);
  } catch (error) {
    console.error("[menu:GET]", error);
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 });
  }
}
