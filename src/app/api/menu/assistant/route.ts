import { NextRequest, NextResponse } from "next/server";
import { askMenuAssistant } from "@/lib/menu/assistant";
import type { MenuLocationSlug, MenuType } from "@/lib/menu/types";

const VALID_LOCATIONS = new Set<MenuLocationSlug>([
  "kentish-town",
  "finchley-road",
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body.message ?? "").trim();

    if (!message || message.length > 1000) {
      return NextResponse.json(
        { error: "Message is required (max 1000 characters)" },
        { status: 400 },
      );
    }

    const locationSlug = body.locationSlug as MenuLocationSlug;
    if (!VALID_LOCATIONS.has(locationSlug)) {
      return NextResponse.json(
        { error: "Invalid location" },
        { status: 400 },
      );
    }

    const menuType: MenuType =
      body.menuType === "lunch" ? "lunch" : "daily";

    const history = Array.isArray(body.history)
      ? body.history
          .filter(
            (m: unknown) =>
              m &&
              typeof m === "object" &&
              "role" in m &&
              "content" in m &&
              (m.role === "user" || m.role === "assistant") &&
              typeof (m as { content: unknown }).content === "string",
          )
          .map((m: { role: "user" | "assistant"; content: string }) => ({
            role: m.role,
            content: m.content.slice(0, 2000),
          }))
      : undefined;

    const result = await askMenuAssistant({
      message,
      locationSlug,
      menuType,
      history,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/menu/assistant]", error);
    return NextResponse.json(
      { error: "Could not answer right now. Please try again." },
      { status: 500 },
    );
  }
}
