import { location } from "@/lib/data/locations";
import { faqCategories } from "@/lib/data/faq";
import { featuredDishes } from "@/lib/data/legacy-menu";
import { findDishByQuery } from "@/lib/menu/assistant-context";
import { formatPricePence, priceRangeLabel } from "@/lib/menu/format";
import { getBranchMenu } from "@/lib/menu/migrate";
import {
  buildFoodSafetyKnowledgeText,
  findAllergenAnswer,
} from "@/lib/menu/assistant-food-safety";
import { VIETNAMESE_EXPERTISE } from "@/lib/menu/assistant-vietnamese-expertise";
import type {
  BranchMenu,
  MenuCategory,
  MenuData,
  MenuItem,
  MenuLocationSlug,
  MenuType,
} from "@/lib/menu/types";

export interface AssistantContext {
  menu: MenuData;
  locationSlug: MenuLocationSlug;
  menuType: MenuType;
}

interface PreparedTopic {
  id: string;
  /** Multi-word phrases checked before single keywords */
  phrases: string[];
  keywords: string[];
  minScore: number;
  answer: (ctx: AssistantContext) => string;
}

function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectItems(
  branch: BranchMenu,
  menuType: MenuType,
): { category: MenuCategory; item: MenuItem }[] {
  const categories = menuType === "daily" ? branch.daily : branch.lunch;
  const rows: { category: MenuCategory; item: MenuItem }[] = [];
  for (const category of categories) {
    for (const item of category.items) {
      rows.push({ category, item });
    }
  }
  return rows;
}

function itemHasTag(item: MenuItem, tag: string): boolean {
  const needle = tag.toLowerCase();
  return item.tags.some((t) => t.toLowerCase().includes(needle));
}

function cleanDisplayName(name: string): string {
  return name.replace(/^★\s*/, "").trim();
}

function formatItemLine(item: MenuItem): string {
  const price = priceRangeLabel(item.variants) ?? "Price on request";
  const tags = item.tags.length ? ` (${item.tags.join(", ")})` : "";
  const sig = item.featured ? "★ " : "";
  const desc = item.description ? ` — ${item.description}` : "";
  const name = cleanDisplayName(item.name);
  const variants =
    item.variants.length > 1
      ? ` — options: ${item.variants.map((v) => (v.protein ? `${v.protein} ${formatPricePence(v.pricePence)}` : formatPricePence(v.pricePence))).join(", ")}`
      : "";
  return `• ${sig}${name}${tags}: ${price}${desc}${variants}`;
}

function formatDishDetail(
  item: MenuItem,
  categoryName: string,
  menuLabel: string,
): string {
  const lines = [formatItemLine(item), `Category: ${categoryName} (${menuLabel})`];
  if (item.featured) {
    lines.push("This is one of our signature ★ dishes — a house favourite.");
  }
  return lines.join("\n") + allergenFooter();
}

function formatItemList(items: MenuItem[], limit = 6): string {
  if (items.length === 0) {
    return "I couldn't find matching dishes on this menu tab. Try switching between Daily and Lunch at the top of the page.";
  }
  const lines = items.slice(0, limit).map(formatItemLine);
  if (items.length > limit) {
    lines.push(`…and ${items.length - limit} more on the menu.`);
  }
  return lines.join("\n");
}

function filterByTag(
  ctx: AssistantContext,
  tag: string,
  limit = 8,
): MenuItem[] {
  const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
  return collectItems(branch, ctx.menuType)
    .filter(({ item }) => itemHasTag(item, tag))
    .map(({ item }) => item)
    .slice(0, limit);
}

function filterFeatured(ctx: AssistantContext, limit = 6): MenuItem[] {
  const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
  return collectItems(branch, ctx.menuType)
    .filter(({ item }) => item.featured)
    .map(({ item }) => item)
    .slice(0, limit);
}

function filterPho(ctx: AssistantContext, limit = 8): MenuItem[] {
  const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
  return collectItems(branch, ctx.menuType)
    .filter(
      ({ item, category }) =>
        item.name.toLowerCase().includes("pho") ||
        category.name.toLowerCase().includes("pho"),
    )
    .map(({ item }) => item)
    .slice(0, limit);
}

function menuLabel(menuType: MenuType): string {
  return menuType === "daily" ? "daily menu" : "lunch menu";
}

function allergenFooter(): string {
  return "\n\nFor severe allergies, we cannot guarantee an allergen-free kitchen. Please read our Food hygiene & allergies page (/food-safety) and speak to your server before ordering.";
}

function scoreTopic(query: string, topic: PreparedTopic): number {
  let score = 0;
  for (const phrase of topic.phrases) {
    if (query.includes(phrase)) score += 3;
  }
  for (const keyword of topic.keywords) {
    if (query.includes(keyword)) score += 1;
  }
  return score;
}

const PREPARED_TOPICS: PreparedTopic[] = [
  {
    id: "signature",
    phrases: [
      "signature dish",
      "signature dishes",
      "most popular",
      "best dish",
      "best dishes",
      "what is good",
      "whats good",
      "what's good",
      "must try",
      "recommend",
      "recommendation",
    ],
    keywords: ["signature", "popular", "highlight", "favourite", "favorite"],
    minScore: 2,
    answer: (ctx) => {
      const items = filterFeatured(ctx);
      const label = menuLabel(ctx.menuType);
      return (
        `Our signature highlights on the ${label} include:\n\n` +
        formatItemList(items) +
        "\n\nThese are guest favourites — marked ★ on the menu. For a full browse, scroll the categories above or ask about a specific dish." +
        allergenFooter()
      );
    },
  },
  {
    id: "gluten-free",
    phrases: [
      "gluten free",
      "gluten-free",
      "coeliac",
      "celiac",
      "no gluten",
      "gf option",
      "gf options",
    ],
    keywords: ["gluten"],
    minScore: 2,
    answer: (ctx) => {
      const items = filterByTag(ctx, "gluten free", 8);
      return (
        `Many dishes on our ${menuLabel(ctx.menuType)} are tagged Gluten free. Here are some options:\n\n` +
        formatItemList(items) +
        "\n\nTags are a guide only — please tell your server about coeliac or severe gluten needs when you order." +
        allergenFooter()
      );
    },
  },
  {
    id: "vegetarian",
    phrases: [
      "vegetarian dish",
      "vegetarian dishes",
      "veggie option",
      "veggie options",
      "meat free",
      "without meat",
    ],
    keywords: ["vegetarian", "veggie"],
    minScore: 2,
    answer: (ctx) => {
      const items = filterByTag(ctx, "vegetarian", 8);
      return (
        `Vegetarian options on the ${menuLabel(ctx.menuType)}:\n\n` +
        formatItemList(items) +
        "\n\nWe can often adapt other dishes — mention dietary needs when you book or ask your server." +
        allergenFooter()
      );
    },
  },
  {
    id: "vegan",
    phrases: ["vegan dish", "vegan dishes", "plant based", "plant-based"],
    keywords: ["vegan"],
    minScore: 2,
    answer: (ctx) => {
      const items = filterByTag(ctx, "vegan", 8);
      return (
        `Vegan-tagged dishes on the ${menuLabel(ctx.menuType)}:\n\n` +
        formatItemList(items) +
        "\n\nPlease confirm ingredients with our team when you visit — we are happy to help." +
        allergenFooter()
      );
    },
  },
  {
    id: "pho",
    phrases: [
      "tell me about the pho",
      "about the pho",
      "what is pho",
      "whats pho",
      "what's pho",
      "pho bo",
      "beef pho",
      "noodle soup",
    ],
    keywords: ["pho"],
    minScore: 2,
    answer: (ctx) => {
      const items = filterPho(ctx);
      return (
        `Pho is Vietnam's beloved noodle soup — fragrant broth, rice noodles, and fresh herbs. At Pho Ta Finchley Road our pho selection on the ${menuLabel(ctx.menuType)} includes:\n\n` +
        formatItemList(items) +
        "\n\n★ M01 Pho Bo Tai (rare steak) is our signature pho. All pho bowls listed are tagged Gluten free." +
        allergenFooter()
      );
    },
  },
  {
    id: "mild",
    phrases: [
      "not spicy",
      "non spicy",
      "non-spicy",
      "kid friendly",
      "for kids",
      "mild dish",
      "mild dishes",
      "mild option",
    ],
    keywords: ["mild"],
    minScore: 1,
    answer: (ctx) => {
      const items = filterByTag(ctx, "mild", 8);
      return (
        `Dishes tagged Mild on the ${menuLabel(ctx.menuType)} are a good choice if you prefer less heat:\n\n` +
        formatItemList(items) +
        "\n\nMany other dishes can be adjusted — let your server know your preference." +
        allergenFooter()
      );
    },
  },
  {
    id: "hours",
    phrases: [
      "opening hours",
      "open hours",
      "what time",
      "when open",
      "when close",
      "how late",
    ],
    keywords: ["hours", "open", "close", "closing"],
    minScore: 2,
    answer: (ctx) => {
      const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
      const lunch =
        ctx.menuType === "lunch" && branch.lunchNote
          ? `\n\nLunch menu note: ${branch.lunchNote}`
          : "\n\nWeekday lunch specials are on the Lunch tab — switch at the top of the menu page.";
      return (
        `Pho Ta Finchley Road is open Monday to Sunday, 11:30am – 9:30pm.` +
        lunch +
        `\n\nAddress: ${location.address}, ${location.postcode}. Phone: ${location.phone}.`
      );
    },
  },
  {
    id: "book",
    phrases: [
      "book a table",
      "make a reservation",
      "reserve a table",
      "how to book",
      "online booking",
    ],
    keywords: ["book", "reserv", "table"],
    minScore: 2,
    answer: () =>
      `You can reserve online in a few minutes at /book — choose your date, time, party size, and seating preference. You'll receive a confirmation on screen and by email.\n\n` +
      `Walk-ins are welcome when tables are available. For groups of four or more or special occasions, booking ahead is recommended.\n\n` +
      `To change or cancel, call us on ${location.phone} with your booking reference.`,
  },
  {
    id: "visit",
    phrases: [
      "where are you",
      "how to find",
      "get there",
      "your address",
    ],
    keywords: ["address", "location", "directions", "parking", "map", "find"],
    minScore: 2,
    answer: () =>
      `Pho Ta Finchley Road\n${location.address}\n${location.postcode}\n\n` +
      `Phone: ${location.phone}\nEmail: ${location.email}\n\n` +
      `Street parking is available nearby. Finchley Road / South Hampstead is well served by public transport. See our Visit page (/locations) for a map.`,
  },
  {
    id: "lunch",
    phrases: [
      "lunch menu",
      "lunch special",
      "lunch specials",
      "weekday lunch",
    ],
    keywords: ["lunch"],
    minScore: 2,
    answer: (ctx) => {
      const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
      if (ctx.menuType === "lunch") {
        const count = branch.lunch.reduce((n, c) => n + c.items.length, 0);
        return (
          `You're viewing our lunch menu (${count} dishes).` +
          (branch.lunchNote ? ` ${branch.lunchNote}` : "") +
          `\n\nLunch specials are typically available on weekdays. For our full à la carte selection, switch to the Daily tab at the top of the menu.`
        );
      }
      return (
        `Weekday lunch specials are on the Lunch tab at the top of this page.` +
        (branch.lunchNote ? ` ${branch.lunchNote}` : "") +
        `\n\nYou're currently on the daily menu. Tap Lunch to see lunch-only dishes and prices.`
      );
    },
  },
  {
    id: "banh-xeo",
    phrases: ["banh xeo", "vietnamese crepe", "savoury pancake", "savory pancake"],
    keywords: ["xeo", "crepe"],
    minScore: 2,
    answer: (ctx) => {
      const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
      const items = collectItems(branch, ctx.menuType)
        .filter(
          ({ item }) =>
            item.name.toLowerCase().includes("banh xeo") ||
            item.description.toLowerCase().includes("crepe"),
        )
        .map(({ item }) => item);
      return (
        `Bánh xèo is a sizzling Vietnamese turmeric crêpe — crisp at the edges, filled with prawns, chicken, and bean sprouts. Fold it with herbs and dip in nước chấm.\n\n` +
        `On our ${menuLabel(ctx.menuType)}:\n\n` +
        formatItemList(items.length ? items : filterByTag(ctx, "vegetarian", 2), 4) +
        allergenFooter()
      );
    },
  },
  {
    id: "broken-rice",
    phrases: [
      "broken rice",
      "com tam",
      "rice plate",
      "pork chop rice",
    ],
    keywords: ["com ", "broken"],
    minScore: 2,
    answer: (ctx) => {
      const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
      const items = collectItems(branch, ctx.menuType)
        .filter(({ category, item }) =>
          category.name.toLowerCase().includes("broken") ||
          category.name.toLowerCase().includes("rice") ||
          item.name.toLowerCase().startsWith("com ") ||
          item.name.toLowerCase().startsWith("m17") ||
          item.name.toLowerCase().startsWith("m21"),
        )
        .map(({ item }) => item)
        .slice(0, 8);
      return (
        `Cơm tấm (broken rice) uses fractured rice grains for a softer, slightly sticky texture — a Vietnamese classic served with grilled meats, curries, or pork chop.\n\n` +
        `Broken rice dishes on the ${menuLabel(ctx.menuType)}:\n\n` +
        formatItemList(items) +
        allergenFooter()
      );
    },
  },
  {
    id: "bun-cha",
    phrases: ["bun cha", "grilled pork vermicelli", "hanoi classic"],
    keywords: ["bun cha"],
    minScore: 2,
    answer: (ctx) => {
      const match = findDishByQuery(ctx.menu, ctx.locationSlug, "bun cha");
      if (match) {
        return (
          `Bún chả is a Hanoi classic — grilled pork belly and patties with vermicelli, fresh herbs, and dipping sauce.\n\n` +
          formatDishDetail(match.item, match.categoryName, match.menuLabel)
        );
      }
      return (
        `Bún chả is a Hanoi classic — grilled pork with vermicelli and herbs. Ask about M16 Bun Cha on our daily menu.` +
        allergenFooter()
      );
    },
  },
  {
    id: "spring-rolls",
    phrases: [
      "spring roll",
      "spring rolls",
      "summer roll",
      "summer rolls",
      "difference between spring",
    ],
    keywords: ["nem", "goi cuon", "roll"],
    minScore: 2,
    answer: (ctx) => {
      const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
      const fried = collectItems(branch, ctx.menuType)
        .filter(({ item }) =>
          item.name.toLowerCase().includes("nem") ||
          item.description.toLowerCase().includes("spring roll"),
        )
        .map(({ item }) => item)
        .slice(0, 4);
      const fresh = collectItems(branch, ctx.menuType)
        .filter(({ item }) =>
          item.name.toLowerCase().includes("goi cuon") ||
          item.description.toLowerCase().includes("summer roll"),
        )
        .map(({ item }) => item)
        .slice(0, 4);
      return (
        `Two styles:\n` +
        `• Fried spring rolls (nem / cha gio) — crispy, served with nước chấm\n` +
        `• Fresh summer rolls (goi cuon) — rice paper, herbs, served with peanut sauce\n\n` +
        `Fried:\n${formatItemList(fried, 4)}\n\nFresh:\n${formatItemList(fresh, 4)}` +
        allergenFooter()
      );
    },
  },
  {
    id: "first-visit",
    phrases: [
      "first time",
      "first visit",
      "never been",
      "what should i order",
      "what to order",
      "beginner",
      "new to vietnamese",
    ],
    keywords: ["recommend", "suggest", "try"],
    minScore: 2,
    answer: (ctx) => {
      const signatures = filterFeatured(ctx, 6);
      return (
        `Welcome! For a first visit at Pho Ta Finchley Road we'd suggest:\n\n` +
        `1. A signature pho — M01 Pho Bo Tai (rare steak) or M09 Special Pho Ta Mixed Beef\n` +
        `2. A starter to share — Special Platter for 2, or Goi Cuon Tom (prawn summer rolls)\n` +
        `3. Something beyond soup — Bun Cha, Bun Hue, or a sizzling plate\n\n` +
        `Our ★ signatures on the ${menuLabel(ctx.menuType)}:\n\n` +
        formatItemList(signatures) +
        `\n\nReserve at /book when you're ready.` +
        allergenFooter()
      );
    },
  },
  {
    id: "sizzling",
    phrases: ["sizzling", "sizzling plate", "hot plate", "iron plate"],
    keywords: ["sizzling"],
    minScore: 2,
    answer: (ctx) => {
      const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
      const items = collectItems(branch, ctx.menuType)
        .filter(({ item }) => item.name.toLowerCase().includes("sizzling"))
        .map(({ item }) => item);
      return (
        `Our sizzling plates arrive on a hot iron skillet — aromatic onion & ginger, black bean, or Lan-style with galangal and lemongrass. Choose chicken, beef, king prawns, duck, or tofu.\n\n` +
        formatItemList(items) +
        allergenFooter()
      );
    },
  },
  {
    id: "kids",
    phrases: ["kids menu", "kid menu", "children", "for kids", "family"],
    keywords: ["kid", "child"],
    minScore: 2,
    answer: (ctx) => {
      const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
      const items = collectItems(branch, ctx.menuType)
        .filter(({ category }) => category.name.toLowerCase().includes("kid"))
        .map(({ item }) => item);
      return (
        `Kids Corner has mild, child-sized portions — curries, fried rice, stir-fried noodles, and noodle soup from about £7.50.\n\n` +
        formatItemList(items) +
        allergenFooter()
      );
    },
  },
  {
    id: "takeaway",
    phrases: ["take away", "takeaway", "take-out", "takeout", "delivery", "deliver"],
    keywords: ["delivery", "uber", "deliveroo"],
    minScore: 2,
    answer: () =>
      `We focus on dine-in so every dish is served at its best. For takeaway availability, please call us on ${location.phone}.\n\n` +
      `You can browse the full menu here and reserve for dining in at /book.`,
  },
  {
    id: "price",
    phrases: ["how much", "price range", "average price", "cost of"],
    keywords: ["price", "prices", "expensive", "cheap", "cost"],
    minScore: 2,
    answer: (ctx) => {
      const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
      const items = collectItems(branch, ctx.menuType).map(({ item }) => item);
      const prices = items.flatMap((i) => i.variants.map((v) => v.pricePence));
      if (prices.length === 0) {
        return "Browse the menu categories above for current prices on each dish.";
      }
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const signatures = filterFeatured(ctx, 3);
      return (
        `On the ${menuLabel(ctx.menuType)}, most dishes range from ${formatPricePence(min)} to ${formatPricePence(max)} depending on protein or portion.\n\n` +
        `Popular choices include:\n${formatItemList(signatures, 3)}\n\n` +
        `Prices are shown next to each dish on the menu. Switch Daily / Lunch tabs to compare.`
      );
    },
  },
];

/** Match a specific dish name or menu code (M01, bun cha, etc.). */
export function findDishAnswer(
  query: string,
  ctx: AssistantContext,
): { reply: string; dishName: string } | null {
  const normalized = normalizeQuery(query);
  if (!normalized || normalized.length < 3) return null;

  const skip =
    /^(hi|hello|hey|thanks|thank you|ok|yes|no)$/.test(normalized) ||
    (normalized.split(" ").length === 1 &&
      ["menu", "food", "help", "book", "hours"].includes(normalized));

  if (skip) return null;

  const match = findDishByQuery(ctx.menu, ctx.locationSlug, normalized);
  if (!match) return null;

  const name = match.item.name.replace(/^★\s*/, "");
  const intro =
    normalized.length <= 20 || normalized.includes(name.toLowerCase().slice(0, 6))
      ? `Here's what we serve:\n\n`
      : `This may help — a dish from our menu:\n\n`;

  return {
    reply: intro + formatDishDetail(match.item, match.categoryName, match.menuLabel),
    dishName: name,
  };
}

/** Instant answer for common questions — works without an AI API key. */
export function findPreparedAnswer(
  query: string,
  ctx: AssistantContext,
): { reply: string; topicId: string } | null {
  const normalized = normalizeQuery(query);
  if (!normalized) return null;

  const allergen = findAllergenAnswer(query, ctx);
  if (allergen) return allergen;

  const hasMenuCode = /\b[smvk]\d{2}[a-z]?\b/i.test(normalized);
  const dishMatch = findDishByQuery(ctx.menu, ctx.locationSlug, normalized);
  if (dishMatch) {
    const dishNameLower = cleanDisplayName(dishMatch.item.name).toLowerCase();
    const keywords = normalized
      .split(" ")
      .filter((w) => w.length > 1 && !/^(what|tell|about|the|how|is|are|me|a|an)$/.test(w));
    const nameMatch =
      hasMenuCode ||
      (keywords.length >= 2 &&
        dishNameLower.includes(keywords.join(" "))) ||
      normalized.includes(dishNameLower);

    if (nameMatch) {
      return {
        reply: formatDishDetail(
          dishMatch.item,
          dishMatch.categoryName,
          dishMatch.menuLabel,
        ),
        topicId: `dish:${cleanDisplayName(dishMatch.item.name)}`,
      };
    }
  }

  let best: { topic: PreparedTopic; score: number } | null = null;

  for (const topic of PREPARED_TOPICS) {
    const score = scoreTopic(normalized, topic);
    if (score >= topic.minScore && (!best || score > best.score)) {
      best = { topic, score };
    }
  }

  if (!best) return null;

  return {
    reply: best.topic.answer(ctx),
    topicId: best.topic.id,
  };
}

function summarizeCategories(
  branch: BranchMenu,
  menuType: MenuType,
): string[] {
  const categories =
    menuType === "daily" ? branch.daily : branch.lunch;
  return categories.map(
    (c) =>
      `- ${c.name}: ${c.items.length} dishes${c.note ? ` (${c.note})` : ""}`,
  );
}

/** Reference facts injected into the AI system prompt. */
export function buildAssistantKnowledgeText(ctx: AssistantContext): string {
  const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
  const dailyItems = collectItems(branch, "daily");
  const lunchItems = collectItems(branch, "lunch");
  const allItems = [...dailyItems, ...lunchItems];

  const featuredNames = allItems
    .filter(({ item }) => item.featured)
    .map(({ item }) => item.name.replace(/^★\s*/, ""))
    .slice(0, 12);

  const faqSnippet = faqCategories
    .flatMap((c) => c.items)
    .slice(0, 6)
    .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
    .join("\n\n");

  const heroDishes = featuredDishes
    .map((d) => `- ${d.name}: ${d.description}`)
    .join("\n");

  return [
    VIETNAMESE_EXPERTISE,
    "",
    "RESTAURANT FACTS:",
    `- Name: Pho Ta Finchley Road`,
    `- Address: ${location.address}, ${location.postcode}`,
    `- Phone: ${location.phone} | Email: ${location.email}`,
    `- Hours: Mon–Sun 11:30am – 9:30pm`,
    `- Booking: online at /book (up to 30 days ahead); call ${location.phone} to change/cancel`,
    `- Parking: street parking nearby; good public transport links`,
    buildFoodSafetyKnowledgeText(),
    `- Takeaway: call ${location.phone} for availability`,
    `- Dress code: smart casual`,
    "",
    `GUEST VIEW: ${menuLabel(ctx.menuType)} tab (${collectItems(branch, ctx.menuType).length} dishes visible)`,
    ctx.menuType === "lunch" && branch.lunchNote
      ? `- Lunch note: ${branch.lunchNote}`
      : `- Full daily menu has ${dailyItems.length} dishes; lunch specials have ${lunchItems.length} dishes`,
    "",
    "MENU OVERVIEW — Daily categories:",
    ...summarizeCategories(branch, "daily"),
    "",
    "MENU OVERVIEW — Lunch categories:",
    ...summarizeCategories(branch, "lunch"),
    "",
    `Signature ★ dishes (reference when recommending): ${featuredNames.join("; ")}`,
    "",
    "Featured on homepage:",
    heroDishes,
    "",
    "FAQ excerpts:",
    faqSnippet,
  ]
    .filter(Boolean)
    .join("\n");
}
