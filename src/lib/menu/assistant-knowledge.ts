import { location } from "@/lib/data/locations";
import { formatPricePence, priceRangeLabel } from "@/lib/menu/format";
import { getBranchMenu } from "@/lib/menu/migrate";
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

function formatItemLine(item: MenuItem): string {
  const price = priceRangeLabel(item.variants) ?? "Price on request";
  const tags = item.tags.length ? ` (${item.tags.join(", ")})` : "";
  const sig = item.featured ? "★ " : "";
  const desc = item.description ? ` — ${item.description}` : "";
  return `• ${sig}${item.name}${tags}: ${price}${desc}`;
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
    id: "allergies",
    phrases: [
      "food allergy",
      "food allergies",
      "allergen info",
      "allergy info",
      "nut allergy",
      "peanut allergy",
      "dairy free",
      "lactose",
    ],
    keywords: ["allerg", "allergy", "intoleran"],
    minScore: 2,
    answer: () =>
      `We take allergies seriously. Many menu items show dietary tags (Gluten free, Vegetarian, Vegan, Mild) as a guide, but our kitchen handles multiple ingredients and we cannot guarantee an allergen-free environment.\n\n` +
      `Please:\n` +
      `• Read our Food hygiene & allergies page: /food-safety\n` +
      `• Tell us about allergies when you book (special requests) and again when you arrive\n` +
      `• Speak to a manager or your server before ordering\n\n` +
      `For severe allergies, always confirm with our team in person.`,
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

/** Instant answer for common questions — works without an AI API key. */
export function findPreparedAnswer(
  query: string,
  ctx: AssistantContext,
): { reply: string; topicId: string } | null {
  const normalized = normalizeQuery(query);
  if (!normalized) return null;

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

/** Reference facts injected into the AI system prompt. */
export function buildAssistantKnowledgeText(ctx: AssistantContext): string {
  const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
  const items = collectItems(branch, ctx.menuType);
  const featured = items.filter(({ item }) => item.featured).length;
  const glutenFree = items.filter(({ item }) =>
    itemHasTag(item, "gluten free"),
  ).length;
  const vegetarian = items.filter(({ item }) =>
    itemHasTag(item, "vegetarian"),
  ).length;

  return [
    "RESTAURANT FACTS (use for general questions):",
    `- Name: Pho Ta Finchley Road`,
    `- Address: ${location.address}, ${location.postcode}`,
    `- Phone: ${location.phone} | Email: ${location.email}`,
    `- Hours: Mon–Sun 11:30am – 9:30pm`,
    `- Booking: online at /book (up to 30 days ahead); call ${location.phone} to change/cancel`,
    `- Parking: street parking nearby; good public transport links`,
    `- Allergies: tags are guides only; direct guests to /food-safety and to speak to staff — never guarantee allergen-free`,
    `- Takeaway: call ${location.phone} for availability`,
    `- Dress code: smart casual`,
    "",
    `CURRENT MENU VIEW: ${menuLabel(ctx.menuType)} (${items.length} dishes)`,
    ctx.menuType === "lunch" && branch.lunchNote
      ? `- Lunch note: ${branch.lunchNote}`
      : "",
    `- Signature (★) dishes on this tab: ${featured}`,
    `- Gluten free tagged: ${glutenFree} | Vegetarian tagged: ${vegetarian}`,
    "",
    "PREPARED GUIDANCE (prefer these facts for common topics):",
    "- Signature: featured ★ items — especially Pho Bo Tai, sharing platters, sizzling plates",
    "- Pho: rice noodle soups; M01 Pho Bo Tai is the signature beef pho",
    "- Gluten free: many pho, starters, and grills tagged GF — always remind guests to confirm with staff",
    "- Vegetarian/Vegan: look for tags; tofu options in wok & grill",
    "- Mild: tagged dishes for less spice; many items can be adjusted on request",
  ]
    .filter(Boolean)
    .join("\n");
}
