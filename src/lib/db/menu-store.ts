import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { buildSeedMenu } from "@/lib/menu/normalize";
import {
  createServerClient,
  isSupabaseConfigured,
} from "../supabase/client";
import type {
  CreateMenuCategoryInput,
  CreateMenuItemInput,
  MenuCategory,
  MenuData,
  MenuItem,
  MenuType,
  UpdateMenuItemInput,
} from "@/lib/menu/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const MENU_FILE = path.join(DATA_DIR, "menu.json");

let menuCache: MenuData | null = null;

function useSupabase(): boolean {
  return isSupabaseConfigured();
}

function getSupabase() {
  return createServerClient();
}

async function readLocalMenu(): Promise<MenuData | null> {
  try {
    const raw = await fs.readFile(MENU_FILE, "utf-8");
    return JSON.parse(raw) as MenuData;
  } catch {
    return null;
  }
}

async function writeLocalMenu(menu: MenuData): Promise<void> {
  menuCache = menu;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(MENU_FILE, JSON.stringify(menu, null, 2));
}

async function readSupabaseMenu(): Promise<MenuData | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("menu_settings")
    .select("lunch_note, data")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    // Table not migrated yet — fall back to seed on first getMenu()
    if (
      error.message.includes("menu_settings") ||
      error.code === "PGRST205"
    ) {
      return null;
    }
    throw new Error(error.message);
  }
  if (!data) return null;

  return {
    ...(data.data as Omit<MenuData, "lunchNote">),
    lunchNote: data.lunch_note as string,
  };
}

async function writeSupabaseMenu(menu: MenuData): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("menu_settings").upsert({
    id: "default",
    lunch_note: menu.lunchNote,
    data: {
      daily: menu.daily,
      lunch: menu.lunch,
    },
    updated_at: new Date().toISOString(),
  });

  if (error) {
    if (
      error.message.includes("menu_settings") ||
      error.code === "PGRST205"
    ) {
      await writeLocalMenu(menu);
      return;
    }
    throw new Error(error.message);
  }
}

async function persistMenu(menu: MenuData): Promise<void> {
  menuCache = menu;
  if (useSupabase()) {
    await writeSupabaseMenu(menu);
  } else {
    await writeLocalMenu(menu);
  }
}

function categoriesForType(menu: MenuData, menuType: MenuType): MenuCategory[] {
  return menuType === "daily" ? menu.daily : menu.lunch;
}

function findItem(menu: MenuData, itemId: string): {
  menuType: MenuType;
  category: MenuCategory;
  item: MenuItem;
} | null {
  for (const menuType of ["daily", "lunch"] as const) {
    for (const category of categoriesForType(menu, menuType)) {
      const item = category.items.find((i) => i.id === itemId);
      if (item) return { menuType, category, item };
    }
  }
  return null;
}

export async function getMenu(): Promise<MenuData> {
  if (menuCache) return menuCache;

  let menu: MenuData | null = null;
  if (useSupabase()) {
    menu = await readSupabaseMenu();
  } else {
    menu = await readLocalMenu();
  }

  if (!menu) {
    menu = buildSeedMenu();
    await persistMenu(menu);
  }

  menuCache = menu;
  return menu;
}

export async function saveMenu(menu: MenuData): Promise<MenuData> {
  await persistMenu(menu);
  return menu;
}

export async function createMenuCategory(
  input: CreateMenuCategoryInput,
): Promise<MenuCategory> {
  const menu = await getMenu();
  const list = categoriesForType(menu, input.menuType);
  const category: MenuCategory = {
    id: `cat-${randomUUID().slice(0, 8)}`,
    menuType: input.menuType,
    name: input.name.trim(),
    note: input.note?.trim() || undefined,
    sortOrder: list.length,
    items: [],
  };
  list.push(category);
  await persistMenu(menu);
  return category;
}

export async function updateMenuCategory(
  categoryId: string,
  updates: { name?: string; note?: string },
): Promise<MenuCategory | null> {
  const menu = await getMenu();
  for (const menuType of ["daily", "lunch"] as const) {
    const category = categoriesForType(menu, menuType).find(
      (c) => c.id === categoryId,
    );
    if (!category) continue;
    if (updates.name !== undefined) category.name = updates.name.trim();
    if (updates.note !== undefined) {
      category.note = updates.note.trim() || undefined;
    }
    await persistMenu(menu);
    return category;
  }
  return null;
}

export async function deleteMenuCategory(categoryId: string): Promise<boolean> {
  const menu = await getMenu();
  for (const menuType of ["daily", "lunch"] as const) {
    const list = categoriesForType(menu, menuType);
    const index = list.findIndex((c) => c.id === categoryId);
    if (index === -1) continue;
    list.splice(index, 1);
    await persistMenu(menu);
    return true;
  }
  return false;
}

export async function createMenuItem(
  input: CreateMenuItemInput,
): Promise<MenuItem | null> {
  const menu = await getMenu();
  const category = [...menu.daily, ...menu.lunch].find(
    (c) => c.id === input.categoryId,
  );
  if (!category) return null;

  const item: MenuItem = {
    id: randomUUID(),
    categoryId: category.id,
    name: input.name.trim(),
    description: input.description.trim(),
    tags: input.tags ?? [],
    featured: input.featured ?? false,
    sortOrder: category.items.length,
    variants: input.variants.map((v, i) => ({
      id: randomUUID(),
      protein: v.protein.trim(),
      pricePence: v.pricePence,
      sortOrder: i,
    })),
  };

  category.items.push(item);
  await persistMenu(menu);
  return item;
}

export async function updateMenuItem(
  itemId: string,
  updates: UpdateMenuItemInput,
): Promise<MenuItem | null> {
  const menu = await getMenu();
  const found = findItem(menu, itemId);
  if (!found) return null;

  const { item } = found;
  if (updates.name !== undefined) item.name = updates.name.trim();
  if (updates.description !== undefined) {
    item.description = updates.description.trim();
  }
  if (updates.tags !== undefined) item.tags = updates.tags;
  if (updates.featured !== undefined) item.featured = updates.featured;
  if (updates.variants !== undefined) {
    item.variants = updates.variants.map((v, i) => ({
      id: v.id ?? randomUUID(),
      protein: v.protein.trim(),
      pricePence: v.pricePence,
      sortOrder: i,
    }));
  }

  await persistMenu(menu);
  return item;
}

export async function deleteMenuItem(itemId: string): Promise<boolean> {
  const menu = await getMenu();
  const found = findItem(menu, itemId);
  if (!found) return false;

  found.category.items = found.category.items.filter((i) => i.id !== itemId);
  await persistMenu(menu);
  return true;
}

export async function updateLunchNote(note: string): Promise<void> {
  const menu = await getMenu();
  menu.lunchNote = note.trim();
  await persistMenu(menu);
}
