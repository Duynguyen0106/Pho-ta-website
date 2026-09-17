import { lunchMenuNote } from "@/lib/data/legacy-menu";
import type {
  BranchMenu,
  MenuData,
  MenuLocationSlug,
} from "@/lib/menu/types";
import { MENU_LOCATION_SLUGS } from "@/lib/menu/types";

function isBranchMenu(value: unknown): value is BranchMenu {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return Array.isArray(record.daily) && Array.isArray(record.lunch);
}

function isLegacyMenuData(value: unknown): value is {
  daily: BranchMenu["daily"];
  lunch: BranchMenu["lunch"];
  lunchNote?: string;
} {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    "daily" in record &&
    "lunch" in record &&
    !("branches" in record) &&
    Array.isArray(record.daily) &&
    Array.isArray(record.lunch)
  );
}

function cloneBranchMenu(branch: BranchMenu): BranchMenu {
  return JSON.parse(JSON.stringify(branch)) as BranchMenu;
}

export function normalizeMenuData(raw: unknown): MenuData {
  if (raw && typeof raw === "object" && "branches" in raw) {
    const branches = (raw as MenuData).branches;
    const normalized = {} as Record<MenuLocationSlug, BranchMenu>;

    for (const slug of MENU_LOCATION_SLUGS) {
      const branch = branches[slug];
      if (isBranchMenu(branch)) {
        normalized[slug] = branch;
      }
    }

    const legacyKentish = (branches as Record<string, unknown>)["kentish-town"];
    if (!normalized["finchley-road"] && isBranchMenu(legacyKentish)) {
      normalized["finchley-road"] = cloneBranchMenu(legacyKentish);
    }

    if (MENU_LOCATION_SLUGS.every((slug) => normalized[slug])) {
      return { branches: normalized };
    }
  }

  if (isLegacyMenuData(raw)) {
    const shared: BranchMenu = {
      daily: raw.daily,
      lunch: raw.lunch,
      lunchNote: raw.lunchNote ?? lunchMenuNote,
    };

    return {
      branches: {
        "finchley-road": cloneBranchMenu(shared),
      },
    };
  }

  return {
    branches: {
      "finchley-road": { daily: [], lunch: [], lunchNote: lunchMenuNote },
    },
  };
}

export function getBranchMenu(
  menu: MenuData,
  locationSlug: MenuLocationSlug,
): BranchMenu {
  return menu.branches[locationSlug];
}
