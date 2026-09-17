export type MenuType = "daily" | "lunch";

export type MenuLocationSlug = "finchley-road";

export const MENU_LOCATION_SLUGS: MenuLocationSlug[] = ["finchley-road"];

export interface MenuVariant {
  id: string;
  protein: string;
  pricePence: number;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  tags: string[];
  featured: boolean;
  sortOrder: number;
  variants: MenuVariant[];
}

export interface MenuCategory {
  id: string;
  menuType: MenuType;
  name: string;
  note?: string;
  sortOrder: number;
  items: MenuItem[];
}

export interface BranchMenu {
  daily: MenuCategory[];
  lunch: MenuCategory[];
  lunchNote: string;
}

export interface MenuData {
  branches: Record<MenuLocationSlug, BranchMenu>;
}

export interface CreateMenuCategoryInput {
  locationSlug: MenuLocationSlug;
  menuType: MenuType;
  name: string;
  note?: string;
}

export interface CreateMenuItemInput {
  locationSlug: MenuLocationSlug;
  categoryId: string;
  name: string;
  description: string;
  tags?: string[];
  featured?: boolean;
  variants: { protein: string; pricePence: number }[];
}

export interface UpdateMenuItemInput {
  name?: string;
  description?: string;
  tags?: string[];
  featured?: boolean;
  variants?: { id?: string; protein: string; pricePence: number }[];
}
