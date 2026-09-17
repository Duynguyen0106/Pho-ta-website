import { formatPricePence, priceRangeLabel } from "./format";
import type {
  BranchMenu,
  MenuData,
  MenuLocationSlug,
  MenuType,
} from "./types";
import { locations } from "../data/locations";

function formatItem(item: {
  name: string;
  description: string;
  tags: string[];
  featured: boolean;
  variants: { protein: string; pricePence: number }[];
}): string {
  const price = priceRangeLabel(item.variants) ?? "Price on request";
  const tags = item.tags.length ? ` [${item.tags.join(", ")}]` : "";
  const sig = item.featured ? " (Signature)" : "";
  const desc = item.description ? ` — ${item.description}` : "";
  const variants =
    item.variants.length > 1
      ? ` Variants: ${item.variants.map((v) => `${v.protein || "standard"} ${formatPricePence(v.pricePence)}`).join("; ")}`
      : "";
  return `- ${item.name}${sig}${tags}: ${price}${desc}${variants}`;
}

export function buildMenuContextText(
  menu: MenuData,
  locationSlug: MenuLocationSlug,
  menuType: MenuType,
): string {
  const branch = menu.branches[locationSlug];
  const location = locations.find((l) => l.slug === locationSlug);
  const categories =
    menuType === "daily" ? branch.daily : branch.lunch;

  const lines = [
    `Venue: Pho Ta ${location?.shortName ?? locationSlug}`,
    `Menu: ${menuType === "daily" ? "Daily menu" : "Lunch menu"}`,
    menuType === "lunch" && branch.lunchNote ? `Lunch hours: ${branch.lunchNote}` : "",
    "",
  ];

  for (const category of categories) {
    lines.push(`## ${category.name}${category.note ? ` (${category.note})` : ""}`);
    for (const item of category.items) {
      lines.push(formatItem(item));
    }
    lines.push("");
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
  const categories =
    menuType === "daily" ? branch.daily : branch.lunch;
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const scored: { item: (typeof categories)[0]["items"][0]; score: number }[] =
    [];

  for (const category of categories) {
    for (const item of category.items) {
      const haystack = [
        item.name,
        item.description,
        ...item.tags,
        category.name,
      ]
        .join(" ")
        .toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (haystack.includes(term)) score += 1;
      }
      if (item.featured && terms.some((t) => ["signature", "popular", "best"].includes(t))) {
        score += 2;
      }
      if (score > 0) scored.push({ item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 4);

  if (top.length === 0) {
    return "I couldn't find a close match on the menu. Try asking about pho, starters, vegetarian dishes, or gluten-free options — or browse the categories above.";
  }

  const location = locations.find((l) => l.slug === locationSlug);
  const intro = `Here are some dishes at Pho Ta ${location?.shortName ?? locationSlug} that may help:\n\n`;
  const body = top.map(({ item }) => formatItem(item)).join("\n");
  const footer =
    "\n\nFor allergies or severe dietary needs, please read our Food hygiene & allergies page and speak to your server before ordering.";

  return intro + body + footer;
}
