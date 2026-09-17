import { formatPricePence, priceRangeLabel } from "./format";
import { CATEGORY_GUIDES } from "./assistant-vietnamese-expertise";
import type {
  BranchMenu,
  MenuCategory,
  MenuData,
  MenuItem,
  MenuLocationSlug,
  MenuType,
} from "./types";
import { locations } from "../data/locations";

function extractMenuCode(name: string): string | null {
  const match = name.match(/\b([SMVK]\d{2}[A-Z]?)\b/i);
  return match ? match[1].toUpperCase() : null;
}

function cleanDishName(name: string): string {
  return name.replace(/^★\s*/, "").trim();
}

function normalizeCategoryKey(name: string): string {
  return name.replace(/[\u2018\u2019']/g, "'").trim().toUpperCase();
}

function categoryGuide(name: string): string | undefined {
  const key = normalizeCategoryKey(name);
  return (
    CATEGORY_GUIDES[key] ??
    CATEGORY_GUIDES[name] ??
    Object.entries(CATEGORY_GUIDES).find(([k]) => key.includes(k))?.[1]
  );
}

function formatItemDetailed(
  item: MenuItem,
  categoryName: string,
): string {
  const code = extractMenuCode(item.name);
  const name = cleanDishName(item.name);
  const price = priceRangeLabel(item.variants) ?? "Price on request";
  const tags = item.tags.length ? item.tags.join(", ") : "—";
  const sig = item.featured ? "Signature" : "—";
  const desc = item.description || "—";

  const variantDetail =
    item.variants.length > 1
      ? item.variants
          .map((v) =>
            v.protein
              ? `${v.protein}: ${formatPricePence(v.pricePence)}`
              : formatPricePence(v.pricePence),
          )
          .join(" | ")
      : item.variants.length === 1 && item.variants[0].protein
        ? item.variants[0].protein
        : null;

  const parts = [
    code ? `[${code}]` : null,
    name,
    `Category: ${categoryName}`,
    `Price: ${price}`,
    variantDetail ? `Proteins/variants: ${variantDetail}` : null,
    `Tags: ${tags}`,
    `Signature: ${sig}`,
    `Description: ${desc}`,
  ].filter(Boolean);

  return parts.join(" | ");
}

function formatCategorySection(
  category: MenuCategory,
  menuLabel: string,
): string[] {
  const guide = categoryGuide(category.name);
  const header = [
    `### ${category.name}${category.note ? ` (${category.note})` : ""} — ${menuLabel}`,
    guide ? `About: ${guide}` : null,
    `Dishes (${category.items.length}):`,
  ].filter(Boolean) as string[];

  const items = category.items.map((item) =>
    `- ${formatItemDetailed(item, category.name)}`,
  );

  return [...header, ...items, ""];
}

function buildBranchMenuSections(
  branch: BranchMenu,
  menuType: MenuType,
  label: string,
): string[] {
  const categories =
    menuType === "daily" ? branch.daily : branch.lunch;
  const lines: string[] = [`## ${label}`];

  if (menuType === "lunch" && branch.lunchNote) {
    lines.push(`Availability: ${branch.lunchNote}`);
    lines.push("");
  }

  for (const category of categories) {
    lines.push(...formatCategorySection(category, label));
  }

  return lines;
}

function countItems(categories: MenuCategory[]): number {
  return categories.reduce((n, c) => n + c.items.length, 0);
}

/** Complete structured menu catalog for the AI — both daily and lunch tabs. */
export function buildFullMenuCatalog(
  menu: MenuData,
  locationSlug: MenuLocationSlug,
): string {
  const branch = menu.branches[locationSlug];
  const location = locations.find((l) => l.slug === locationSlug);
  const dailyCount = countItems(branch.daily);
  const lunchCount = countItems(branch.lunch);

  const lines = [
    `Venue: Pho Ta ${location?.shortName ?? locationSlug}`,
    `Total dishes: ${dailyCount} daily + ${lunchCount} lunch (${dailyCount + lunchCount} unique entries across both menus)`,
    "",
    ...buildBranchMenuSections(branch, "daily", "Daily menu (full à la carte)"),
    ...buildBranchMenuSections(
      branch,
      "lunch",
      "Lunch menu (weekday specials)",
    ),
  ];

  return lines.join("\n");
}

/** Menu context for the tab the guest is currently viewing. */
export function buildMenuContextText(
  menu: MenuData,
  locationSlug: MenuLocationSlug,
  menuType: MenuType,
): string {
  const branch = menu.branches[locationSlug];
  const location = locations.find((l) => l.slug === locationSlug);
  const categories =
    menuType === "daily" ? branch.daily : branch.lunch;
  const label = menuType === "daily" ? "Daily menu" : "Lunch menu";

  const lines = [
    `Guest is viewing: ${label}`,
    `Venue: Pho Ta ${location?.shortName ?? locationSlug}`,
    menuType === "lunch" && branch.lunchNote
      ? `Lunch hours: ${branch.lunchNote}`
      : "",
    "",
  ];

  for (const category of categories) {
    lines.push(...formatCategorySection(category, label));
  }

  return lines.filter(Boolean).join("\n");
}

export function searchMenuFallback(
  menu: MenuData,
  locationSlug: MenuLocationSlug,
  menuType: MenuType,
  query: string,
): string {
  const branch = menu.branches[locationSlug];
  const categories = [
    ...branch.daily.map((c) => ({ ...c, menuLabel: "Daily" as const })),
    ...branch.lunch.map((c) => ({ ...c, menuLabel: "Lunch" as const })),
  ];

  const terms = query
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);

  const scored: {
    item: MenuItem;
    categoryName: string;
    menuLabel: string;
    score: number;
  }[] = [];

  for (const category of categories) {
    for (const item of category.items) {
      const code = extractMenuCode(item.name)?.toLowerCase() ?? "";
      const haystack = [
        item.name,
        item.description,
        ...item.tags,
        category.name,
        code,
        ...item.variants.map((v) => v.protein),
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (haystack.includes(term)) score += 1;
        if (code === term) score += 4;
      }
      if (
        item.featured &&
        terms.some((t) => ["signature", "popular", "best"].includes(t))
      ) {
        score += 2;
      }
      if (score > 0) {
        scored.push({
          item,
          categoryName: category.name,
          menuLabel: category.menuLabel,
          score,
        });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 5);

  if (top.length === 0) {
    return "I couldn't find a close match on the menu. Try asking about pho, bun cha, banh xeo, vegetarian dishes, or gluten-free options — or browse the categories above.";
  }

  const location = locations.find((l) => l.slug === locationSlug);
  const intro = `Here are dishes at Pho Ta ${location?.shortName ?? locationSlug} that may help:\n\n`;
  const body = top
    .map(
      ({ item, categoryName, menuLabel }) =>
        `- ${formatItemDetailed(item, `${categoryName} (${menuLabel})`)}`,
    )
    .join("\n");
  const footer =
    "\n\nFor allergies or severe dietary needs, please read our Food hygiene & allergies page and speak to your server before ordering.";

  return intro + body + footer;
}

const DISH_QUERY_STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "what",
  "whats",
  "tell",
  "about",
  "me",
  "how",
  "much",
  "does",
  "do",
  "have",
  "you",
  "your",
  "dish",
  "food",
]);

/** Look up a single dish by name or menu code for instant answers. */
export function findDishByQuery(
  menu: MenuData,
  locationSlug: MenuLocationSlug,
  query: string,
): {
  item: MenuItem;
  categoryName: string;
  menuLabel: string;
} | null {
  const normalized = query
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return null;

  const keywords = normalized
    .split(" ")
    .filter((w) => w.length > 1 && !DISH_QUERY_STOP_WORDS.has(w));

  const branch = menu.branches[locationSlug];
  const pools = [
    ...branch.daily.map((c) => ({ ...c, menuLabel: "Daily menu" as const })),
    ...branch.lunch.map((c) => ({ ...c, menuLabel: "Lunch menu" as const })),
  ];

  let best: {
    item: MenuItem;
    categoryName: string;
    menuLabel: string;
    score: number;
  } | null = null;

  for (const category of pools) {
    for (const item of category.items) {
      const code = extractMenuCode(item.name)?.toLowerCase() ?? "";
      const name = cleanDishName(item.name).toLowerCase();
      const haystack = [name, item.description.toLowerCase(), code].join(" ");

      let score = 0;
      if (code && normalized.includes(code)) score += 10;
      if (keywords.join(" ") && name.includes(keywords.join(" "))) score += 12;
      if (normalized.includes(name) || name.includes(normalized)) score += 8;
      for (const word of keywords) {
        if (haystack.includes(word)) score += 2;
      }

      if (score >= 4 && (!best || score > best.score)) {
        best = {
          item,
          categoryName: category.name,
          menuLabel: category.menuLabel,
          score,
        };
      }
    }
  }

  return best
    ? {
        item: best.item,
        categoryName: best.categoryName,
        menuLabel: best.menuLabel,
      }
    : null;
}
