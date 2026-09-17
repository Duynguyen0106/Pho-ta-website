export type MenuType = "daily" | "lunch";

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

export interface MenuData {
  daily: MenuCategory[];
  lunch: MenuCategory[];
  lunchNote: string;
}

export interface CreateMenuCategoryInput {
  menuType: MenuType;
  name: string;
  note?: string;
}

export interface CreateMenuItemInput {
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
