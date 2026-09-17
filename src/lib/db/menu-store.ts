import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { buildSeedMenu } from "@/lib/menu/normalize";
import { getBranchMenu, normalizeMenuData } from "@/lib/menu/migrate";
import { getDataDir } from "@/lib/db/data-dir";
import {
  createServerClient,
  isSupabaseConfigured,
} from "../supabase/client";
import type {
  BranchMenu,
  CreateMenuCategoryInput,
  CreateMenuItemInput,
  MenuCategory,
  MenuData,
  MenuItem,
  MenuLocationSlug,
  MenuType,
  UpdateMenuItemInput,
} from "@/lib/menu/types";

function menuFile(): string {
  return path.join(getDataDir(), "menu.json");
}

let menuCache: MenuData | null = null;

function useSupabase(): boolean {
  return isSupabaseConfigured();
}

function getSupabase() {
  return createServerClient();
}

async function readLocalMenu(): Promise<MenuData | null> {
  try {
    const raw = await fs.readFile(menuFile(), "utf-8");
    return normalizeMenuData(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function writeLocalMenu(menu: MenuData): Promise<void> {
  menuCache = menu;
  const dataDir = getDataDir();
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(menuFile(), JSON.stringify(menu, null, 2));
}

async function readSupabaseMenu(): Promise<MenuData | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("menu_settings")
    .select("lunch_note, data")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    if (
      error.message.includes("menu_settings") ||
      error.code === "PGRST205"
    ) {
      return null;
    }
    throw new Error(error.message);
  }
  if (!data) return null;

  const menu = normalizeMenuData(data.data);

  if (
    !menu.branches["kentish-town"].lunchNote &&
    typeof data.lunch_note === "string"
  ) {
    menu.branches["kentish-town"].lunchNote = data.lunch_note;
    menu.branches["finchley-road"].lunchNote = data.lunch_note;
  }

  return menu;
}

async function writeSupabaseMenu(menu: MenuData): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("menu_settings").upsert({
    id: "default",
    lunch_note: menu.branches["kentish-town"].lunchNote,
    data: menu,
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

function categoriesForType(
  branch: BranchMenu,
  menuType: MenuType,
): MenuCategory[] {
  return menuType === "daily" ? branch.daily : branch.lunch;
}

function findItem(
  menu: MenuData,
  itemId: string,
): {
  locationSlug: MenuLocationSlug;
  menuType: MenuType;
  category: MenuCategory;
  item: MenuItem;
} | null {
  for (const locationSlug of ["kentish-town", "finchley-road"] as const) {
    const branch = getBranchMenu(menu, locationSlug);
    for (const menuType of ["daily", "lunch"] as const) {
      for (const category of categoriesForType(branch, menuType)) {
        const item = category.items.find((i) => i.id === itemId);
        if (item) return { locationSlug, menuType, category, item };
      }
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

export async function getBranchMenuForLocation(
  locationSlug: MenuLocationSlug,
): Promise<BranchMenu> {
  const menu = await getMenu();
  return getBranchMenu(menu, locationSlug);
}

export async function saveMenu(menu: MenuData): Promise<MenuData> {
  const normalized = normalizeMenuData(menu);
  await persistMenu(normalized);
  return normalized;
}

export async function createMenuCategory(
  input: CreateMenuCategoryInput,
): Promise<MenuCategory> {
  const menu = await getMenu();
  const branch = getBranchMenu(menu, input.locationSlug);
  const list = categoriesForType(branch, input.menuType);
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
  for (const locationSlug of ["kentish-town", "finchley-road"] as const) {
    const branch = getBranchMenu(menu, locationSlug);
    for (const menuType of ["daily", "lunch"] as const) {
      const category = categoriesForType(branch, menuType).find(
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
  }
  return null;
}

export async function deleteMenuCategory(categoryId: string): Promise<boolean> {
  const menu = await getMenu();
  for (const locationSlug of ["kentish-town", "finchley-road"] as const) {
    const branch = getBranchMenu(menu, locationSlug);
    for (const menuType of ["daily", "lunch"] as const) {
      const list = categoriesForType(branch, menuType);
      const index = list.findIndex((c) => c.id === categoryId);
      if (index === -1) continue;
      list.splice(index, 1);
      await persistMenu(menu);
      return true;
    }
  }
  return false;
}

export async function createMenuItem(
  input: CreateMenuItemInput,
): Promise<MenuItem | null> {
  const menu = await getMenu();
  const branch = getBranchMenu(menu, input.locationSlug);
  const category = [...branch.daily, ...branch.lunch].find(
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

export async function updateLunchNote(
  locationSlug: MenuLocationSlug,
  note: string,
): Promise<void> {
  const menu = await getMenu();
  getBranchMenu(menu, locationSlug).lunchNote = note.trim();
  await persistMenu(menu);
}

function reorderList<T extends { sortOrder: number }>(
  list: T[],
  id: string,
  direction: "up" | "down",
  getId: (item: T) => string,
): boolean {
  const index = list.findIndex((item) => getId(item) === id);
  if (index === -1) return false;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= list.length) return false;
  [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  list.forEach((item, i) => {
    item.sortOrder = i;
  });
  return true;
}

export async function reorderMenuCategory(
  categoryId: string,
  direction: "up" | "down",
): Promise<boolean> {
  const menu = await getMenu();
  for (const locationSlug of ["kentish-town", "finchley-road"] as const) {
    const branch = getBranchMenu(menu, locationSlug);
    for (const menuType of ["daily", "lunch"] as const) {
      const list = categoriesForType(branch, menuType);
      if (reorderList(list, categoryId, direction, (c) => c.id)) {
        await persistMenu(menu);
        return true;
      }
    }
  }
  return false;
}

export async function reorderMenuItem(
  itemId: string,
  direction: "up" | "down",
): Promise<boolean> {
  const menu = await getMenu();
  const found = findItem(menu, itemId);
  if (!found) return false;

  if (
    reorderList(
      found.category.items,
      itemId,
      direction,
      (item) => item.id,
    )
  ) {
    await persistMenu(menu);
    return true;
  }
  return false;
}
