import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import {
  createMenuCategory,
  createMenuItem,
  deleteMenuCategory,
  deleteMenuItem,
  getMenu,
  saveMenu,
  updateLunchNote,
  updateMenuCategory,
  updateMenuItem,
} from "@/lib/db/menu-store";
import type { MenuData } from "@/lib/menu/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const menu = await getMenu();
    return NextResponse.json(menu);
  } catch (error) {
    console.error("[admin/menu:GET]", error);
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const menu = (await request.json()) as MenuData;
    const saved = await saveMenu(menu);
    return NextResponse.json(saved);
  } catch (error) {
    console.error("[admin/menu:PUT]", error);
    return NextResponse.json({ error: "Failed to save menu" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body as { action: string };

    switch (action) {
      case "createCategory": {
        const category = await createMenuCategory(body);
        return NextResponse.json({ category });
      }
      case "updateCategory": {
        const category = await updateMenuCategory(body.id, body);
        if (!category) {
          return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }
        return NextResponse.json({ category });
      }
      case "deleteCategory": {
        const ok = await deleteMenuCategory(body.id);
        if (!ok) {
          return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }
        return NextResponse.json({ ok: true });
      }
      case "createItem": {
        const item = await createMenuItem(body);
        if (!item) {
          return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }
        return NextResponse.json({ item });
      }
      case "updateItem": {
        const item = await updateMenuItem(body.id, body);
        if (!item) {
          return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }
        return NextResponse.json({ item });
      }
      case "deleteItem": {
        const ok = await deleteMenuItem(body.id);
        if (!ok) {
          return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }
        return NextResponse.json({ ok: true });
      }
      case "updateLunchNote": {
        const locationSlug = body.locationSlug as
          | "kentish-town"
          | "finchley-road"
          | undefined;
        if (!locationSlug) {
          return NextResponse.json(
            { error: "locationSlug is required" },
            { status: 400 },
          );
        }
        await updateLunchNote(locationSlug, body.note ?? "");
        const menu = await getMenu();
        return NextResponse.json({
          lunchNote: menu.branches[locationSlug].lunchNote,
        });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[admin/menu:POST]", error);
    return NextResponse.json({ error: "Menu action failed" }, { status: 500 });
  }
}
