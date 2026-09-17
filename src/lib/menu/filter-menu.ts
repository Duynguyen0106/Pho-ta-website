import type { MenuCategory, MenuItem } from "./types";

export type DietaryFilter =
  | "all"
  | "signature"
  | "gluten-free"
  | "vegetarian"
  | "vegan"
  | "mild";

function itemHasTag(item: MenuItem, needle: string): boolean {
  const n = needle.toLowerCase();
  return item.tags.some((t) => t.toLowerCase().includes(n));
}

export function itemMatchesDietaryFilter(
  item: MenuItem,
  filter: DietaryFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "signature") return item.featured;
  if (filter === "gluten-free") return itemHasTag(item, "gluten");
  if (filter === "vegetarian") return itemHasTag(item, "vegetarian");
  if (filter === "vegan") return itemHasTag(item, "vegan");
  if (filter === "mild") return itemHasTag(item, "mild");
  return true;
}

export function itemMatchesSearch(item: MenuItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    item.name,
    item.description,
    ...item.tags,
    ...item.variants.map((v) => v.protein),
  ]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((term) => term.length > 0 && haystack.includes(term));
}

export function filterMenuCategories(
  categories: MenuCategory[],
  search: string,
  dietaryFilter: DietaryFilter,
): MenuCategory[] {
  return categories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          itemMatchesSearch(item, search) &&
          itemMatchesDietaryFilter(item, dietaryFilter),
      ),
    }))
    .filter((category) => category.items.length > 0);
}

export function countMenuItems(categories: MenuCategory[]): number {
  return categories.reduce((sum, cat) => sum + cat.items.length, 0);
}
