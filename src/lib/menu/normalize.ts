import { randomUUID } from "crypto";
import {
  dailyMenuCategories,
  lunchMenuCategories,
  lunchMenuNote,
  type MenuCategory as LegacyCategory,
  type MenuItem as LegacyItem,
} from "@/lib/data/legacy-menu";
import { parsePriceToPence } from "@/lib/menu/format";
import type {
  BranchMenu,
  MenuCategory,
  MenuData,
  MenuItem,
  MenuType,
  MenuVariant,
} from "@/lib/menu/types";

interface ParsedVariant {
  protein: string;
  pricePence: number;
}

function extractParenBlock(text: string): { base: string; inner: string } | null {
  const start = text.indexOf("(");
  if (start === -1) return null;

  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "(") depth += 1;
    if (text[i] === ")") {
      depth -= 1;
      if (depth === 0) {
        return {
          base: text.slice(0, start).trim(),
          inner: text.slice(start + 1, i),
        };
      }
    }
  }
  return null;
}

function parsePriceVariants(text: string): ParsedVariant[] {
  const variants: ParsedVariant[] = [];
  for (const part of text.split(" · ")) {
    const match = part.trim().match(/^(.+?)\s*£([\d.]+)$/);
    if (match) {
      variants.push({
        protein: match[1].trim(),
        pricePence: parsePriceToPence(`£${match[2]}`),
      });
    }
  }
  return variants;
}

function parseVariants(description: string, price?: string): {
  description: string;
  variants: ParsedVariant[];
} {
  const desc = description.trim();
  const defaultPence = price
    ? parsePriceToPence(price.split("–")[0].trim())
    : null;

  // Entire string is variant list (kids menu)
  if (desc.includes(" · ") && /£[\d.]+/.test(desc) && !desc.includes("(")) {
    const variants = parsePriceVariants(desc);
    if (variants.length) return { description: "", variants };
  }

  const block = extractParenBlock(desc);
  if (block) {
    const { base, inner } = block;

    if (inner.includes("£")) {
      const variants = parsePriceVariants(inner);
      if (variants.length) return { description: base, variants };
    }

    if (inner.includes("/") && defaultPence !== null) {
      const proteins = inner.split("/").map((p) => p.trim());
      return {
        description: base,
        variants: proteins.map((protein) => ({
          protein,
          pricePence: defaultPence,
        })),
      };
    }
  }

  if (defaultPence !== null) {
    return { description: desc, variants: [{ protein: "", pricePence: defaultPence }] };
  }

  return { description: desc, variants: [] };
}

function toVariant(protein: string, pricePence: number, sortOrder: number): MenuVariant {
  return {
    id: randomUUID(),
    protein,
    pricePence,
    sortOrder,
  };
}

function convertItem(
  legacy: LegacyItem,
  categoryId: string,
  sortOrder: number,
): MenuItem {
  const { description, variants } = parseVariants(legacy.description, legacy.price);
  return {
    id: randomUUID(),
    categoryId,
    name: legacy.name,
    description,
    tags: legacy.tags ?? [],
    featured: legacy.featured ?? false,
    sortOrder,
    variants: variants.map((v, i) => toVariant(v.protein, v.pricePence, i)),
  };
}

function convertCategory(
  legacy: LegacyCategory,
  menuType: MenuType,
  sortOrder: number,
): MenuCategory {
  return {
    id: legacy.id,
    menuType,
    name: legacy.name,
    note: legacy.note,
    sortOrder,
    items: legacy.items.map((item, i) => convertItem(item, legacy.id, i)),
  };
}

function buildBranchMenu(): BranchMenu {
  return {
    daily: dailyMenuCategories.map((cat, i) =>
      convertCategory(cat, "daily", i),
    ),
    lunch: lunchMenuCategories.map((cat, i) =>
      convertCategory(cat, "lunch", i),
    ),
    lunchNote: lunchMenuNote,
  };
}

export function buildSeedMenu(): MenuData {
  const kentishTown = buildBranchMenu();
  const finchleyRoad = buildBranchMenu();

  return {
    branches: {
      "kentish-town": kentishTown,
      "finchley-road": finchleyRoad,
    },
  };
}
