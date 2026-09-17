import {
  allergenGroups,
  allergyAdvice,
  hygienePoints,
} from "@/lib/data/food-safety";
import { formatPricePence, priceRangeLabel } from "@/lib/menu/format";
import { getBranchMenu } from "@/lib/menu/migrate";
import type {
  BranchMenu,
  MenuItem,
  MenuLocationSlug,
  MenuType,
  MenuData,
} from "@/lib/menu/types";

/** Full food hygiene & allergen text for the AI system prompt. */
export function buildFoodSafetyKnowledgeText(): string {
  const lines = [
    "FOOD HYGIENE & ALLERGIES (official Pho Ta guidance — use for all allergy and hygiene questions):",
    "",
    "CRITICAL: We cannot guarantee an allergen-free kitchen. Tags (Gluten free, Vegetarian, Vegan, Mild) are helpful guides only — never promise a dish is safe for a severe allergy without directing the guest to speak to a manager/server. Full page: /food-safety",
    "",
    "Hygiene commitment:",
    ...hygienePoints.map((p) => `- ${p.title}: ${p.body}`),
    "",
    "14 major allergens (UK law) — may be present on our menu:",
    ...allergenGroups.map((g) => {
      const examples = g.dishes ? ` Examples on our menu: ${g.dishes}.` : "";
      return `- ${g.name}: ${g.details}${examples}`;
    }),
    "",
    "Important advice for guests:",
    ...allergyAdvice.map((a) => `- ${a}`),
    "",
    "How to help guests with allergies:",
    "- Direct severe allergies to speak to a manager BEFORE ordering",
    "- Mention our full allergen matrix is available on request from server/manager",
    "- Suggest declaring allergies in booking special requests at /book AND reminding server on arrival",
    "- Menu tags: Gluten free = tagged GF dishes; Vegetarian/Vegan = V01–V14 section and tagged items; Mild = less spicy — none replace allergen verification",
    "- Fish sauce (nước mắm) is in most pho broths, marinades, and nuoc cham — relevant for fish allergy and many GF-tagged dishes still contain fish sauce",
    "- Peanut sauce is served with summer rolls (Goi Cuon); peanuts may appear in salads and satay dishes",
    "- Shared kitchen: cross-contact is possible between all dishes",
  ];

  return lines.join("\n");
}

function collectAllItems(branch: BranchMenu, menuType: MenuType) {
  const categories =
    menuType === "daily" ? branch.daily : branch.lunch;
  const rows: { category: string; item: MenuItem }[] = [];
  for (const category of categories) {
    for (const item of category.items) {
      rows.push({ category: category.name, item });
    }
  }
  return rows;
}

function formatTaggedDishes(items: MenuItem[], limit = 8): string {
  if (items.length === 0) {
    return "No dishes with this tag on the current menu tab — check the other tab (Daily/Lunch) or ask our team.";
  }
  return items
    .slice(0, limit)
    .map((item) => {
      const price = priceRangeLabel(item.variants) ?? "Price on request";
      const name = item.name.replace(/^★\s*/, "");
      return `• ${name}: ${price}${item.description ? ` — ${item.description}` : ""}`;
    })
    .join("\n");
}

interface AllergenTopic {
  id: string;
  phrases: string[];
  keywords: string[];
  minScore: number;
  answer: (ctx: {
    menu: MenuData;
    locationSlug: MenuLocationSlug;
    menuType: MenuType;
  }) => string;
}

function scoreAllergenQuery(query: string, topic: AllergenTopic): number {
  let score = 0;
  for (const phrase of topic.phrases) {
    if (query.includes(phrase)) score += 3;
  }
  for (const keyword of topic.keywords) {
    if (query.includes(keyword)) score += 1;
  }
  return score;
}

const ALLERGEN_TOPICS: AllergenTopic[] = [
  {
    id: "allergies-general",
    phrases: [
      "food allergy",
      "food allergies",
      "allergen info",
      "allergy info",
      "allergen matrix",
      "dietary requirements",
      "severe allergy",
    ],
    keywords: ["allerg", "allergy", "intoleran"],
    minScore: 2,
    answer: () =>
      buildAllergenReply(
        "Allergies & food hygiene at Pho Ta",
        `${buildFoodSafetyKnowledgeText()}\n\nPlease speak to a manager before ordering if you have a severe allergy.`,
      ),
  },
  {
    id: "gluten-allergy",
    phrases: [
      "gluten allergy",
      "gluten intolerance",
      "coeliac",
      "celiac disease",
      "wheat allergy",
      "cant eat gluten",
      "can't eat gluten",
    ],
    keywords: ["coeliac", "celiac", "wheat"],
    minScore: 2,
    answer: (ctx) => {
      const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
      const gf = collectAllItems(branch, ctx.menuType)
        .filter(({ item }) =>
          item.tags.some((t) => t.toLowerCase().includes("gluten")),
        )
        .map(({ item }) => item);
      const group = allergenGroups.find((g) =>
        g.name.toLowerCase().includes("gluten"),
      );
      return buildAllergenReply(
        "Gluten & coeliac guidance",
        `${group ? `${group.name}: ${group.details}${group.dishes ? ` Examples: ${group.dishes}.` : ""}\n\n` : ""}` +
          `Many dishes are tagged Gluten free on our menu, but fish sauce, shared fryers, and cross-contact may still apply — always confirm with our team.\n\n` +
          `Gluten free tagged dishes on this menu tab:\n${formatTaggedDishes(gf)}`,
      );
    },
  },
  {
    id: "peanut-allergy",
    phrases: [
      "peanut allergy",
      "nut allergy",
      "tree nut allergy",
      "allergic to nuts",
      "allergic to peanuts",
    ],
    keywords: ["peanut", "peanuts", "tree nut"],
    minScore: 2,
    answer: (ctx) => {
      const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
      const risky = collectAllItems(branch, ctx.menuType)
        .filter(
          ({ item }) =>
            item.description.toLowerCase().includes("peanut") ||
            item.name.toLowerCase().includes("satay") ||
            item.name.toLowerCase().includes("goi cuon"),
        )
        .map(({ item }) => item);
      const group = allergenGroups.find((g) =>
        g.name.toLowerCase().includes("peanut"),
      );
      return buildAllergenReply(
        "Peanuts & tree nuts",
        `${group ? `${group.name}: ${group.details}${group.dishes ? ` Examples: ${group.dishes}.` : ""}\n\n` : ""}` +
          `Dishes that commonly involve peanuts or nuts (check with staff):\n${formatTaggedDishes(risky, 6)}\n\n` +
          `Chicken summer rolls (Goi Cuon Ga) and prawn summer rolls are served with peanut sauce — avoid if you have a peanut allergy unless our team confirms an alternative.`,
      );
    },
  },
  {
    id: "shellfish-allergy",
    phrases: [
      "shellfish allergy",
      "seafood allergy",
      "prawn allergy",
      "crab allergy",
      "squid allergy",
      "allergic to shellfish",
    ],
    keywords: ["shellfish", "crustacean", "prawn", "shrimp", "squid", "crab"],
    minScore: 2,
    answer: (ctx) => {
      const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
      const seafood = collectAllItems(branch, ctx.menuType)
        .filter(
          ({ item }) =>
            /prawn|shrimp|squid|crab|seafood|monk fish|fish/i.test(
              `${item.name} ${item.description}`,
            ),
        )
        .map(({ item }) => item);
      const group = allergenGroups.find((g) =>
        g.name.toLowerCase().includes("crustacean"),
      );
      return buildAllergenReply(
        "Shellfish & seafood",
        `${group ? `${group.name}: ${group.details}${group.dishes ? ` Examples: ${group.dishes}.` : ""}\n\n` : ""}` +
          `Seafood appears in many starters, pho, and chef specials. Examples on this menu tab:\n${formatTaggedDishes(seafood, 8)}`,
      );
    },
  },
  {
    id: "fish-allergy",
    phrases: [
      "fish allergy",
      "fish sauce",
      "nuoc mam",
      "allergic to fish",
    ],
    keywords: ["fish sauce", "nuoc cham"],
    minScore: 2,
    answer: (ctx) => {
      const group = allergenGroups.find((g) => g.name === "Fish");
      return buildAllergenReply(
        "Fish & fish sauce",
        `${group ? `${group.name}: ${group.details}${group.dishes ? ` Examples: ${group.dishes}.` : ""}\n\n` : ""}` +
          `Fish sauce (nước mắm) is fundamental to Vietnamese cooking at Pho Ta — it is in most pho broths, marinades, and nước chấm dipping sauce. Even dishes tagged Gluten free may contain fish sauce.\n\n` +
          `If you have a fish allergy, please speak to a manager before ordering — do not rely on menu tags alone.`,
      );
    },
  },
  {
    id: "soy-allergy",
    phrases: ["soy allergy", "soy sauce", "soya allergy", "allergic to soy"],
    keywords: ["soy", "soya", "tofu"],
    minScore: 2,
    answer: (ctx) => {
      const branch = getBranchMenu(ctx.menu, ctx.locationSlug);
      const soy = collectAllItems(branch, ctx.menuType)
        .filter(
          ({ item }) =>
            /tofu|soy|soya/i.test(`${item.name} ${item.description}`) ||
            item.tags.some((t) => t.toLowerCase().includes("vegan")),
        )
        .map(({ item }) => item);
      const group = allergenGroups.find((g) => g.name === "Soy");
      return buildAllergenReply(
        "Soy",
        `${group ? `${group.name}: ${group.details}${group.dishes ? ` Examples: ${group.dishes}.` : ""}\n\n` : ""}` +
          `Soy sauce and tofu are common. Vegetarian/vegan dishes often contain soy — examples:\n${formatTaggedDishes(soy, 6)}`,
      );
    },
  },
  {
    id: "egg-allergy",
    phrases: ["egg allergy", "allergic to eggs", "no eggs"],
    keywords: ["egg"],
    minScore: 2,
    answer: () => {
      const group = allergenGroups.find((g) => g.name === "Eggs");
      return buildAllergenReply(
        "Eggs",
        `${group ? `${group.name}: ${group.details}${group.dishes ? ` Examples: ${group.dishes}.` : ""}\n\n` : ""}` +
          `Egg noodles (Mi Xao) and some batters may contain egg. Ask our team which dishes can be adapted.`,
      );
    },
  },
  {
    id: "sesame-allergy",
    phrases: ["sesame allergy", "allergic to sesame"],
    keywords: ["sesame"],
    minScore: 2,
    answer: () => {
      const group = allergenGroups.find((g) => g.name === "Sesame");
      return buildAllergenReply(
        "Sesame",
        `${group ? `${group.name}: ${group.details}\n\n` : ""}` +
          `Sesame oil and seeds may be used in dressings and garnishes — including some shaking beef and salad dishes. Confirm with staff.`,
      );
    },
  },
  {
    id: "hygiene",
    phrases: [
      "food hygiene",
      "food safety",
      "kitchen hygiene",
      "is it safe",
      "hygiene rating",
    ],
    keywords: ["hygiene", "haccp", "safe"],
    minScore: 2,
    answer: () =>
      buildAllergenReply(
        "Food hygiene at Pho Ta",
        hygienePoints.map((p) => `**${p.title}**\n${p.body}`).join("\n\n"),
      ),
  },
];

function buildAllergenReply(title: string, body: string): string {
  return (
    `${title}\n\n${body}\n\n` +
    `We cannot guarantee an allergen-free kitchen. For severe allergies, speak to a manager before ordering. ` +
    `Full details: /food-safety · Book with notes: /book`
  );
}

/** Instant allergen/hygiene answer — works without AI API key. */
export function findAllergenAnswer(
  query: string,
  ctx: {
    menu: MenuData;
    locationSlug: MenuLocationSlug;
    menuType: MenuType;
  },
): { reply: string; topicId: string } | null {
  const normalized = query
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return null;

  let best: { topic: AllergenTopic; score: number } | null = null;

  for (const topic of ALLERGEN_TOPICS) {
    const score = scoreAllergenQuery(normalized, topic);
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
