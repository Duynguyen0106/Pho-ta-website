"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { MenuAssistant } from "@/components/menu/MenuAssistant";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  countMenuItems,
  filterMenuCategories,
  type DietaryFilter,
} from "@/lib/menu/filter-menu";
import { formatPricePence, priceRangeLabel } from "@/lib/menu/format";
import type { BranchMenu, MenuCategory, MenuItem } from "@/lib/menu/types";

type MenuTab = "daily" | "lunch";

interface MenuTabsProps {
  branchMenu: BranchMenu;
  initialTab?: MenuTab;
  menuAssistantEnabled?: boolean;
}

const DIETARY_FILTERS: {
  id: DietaryFilter;
  label: string;
  tag: string;
}[] = [
  { id: "signature", label: "Signature", tag: "Signature" },
  { id: "gluten-free", label: "Gluten free", tag: "Gluten free" },
  { id: "mild", label: "Mild", tag: "Mild" },
  { id: "vegetarian", label: "Vegetarian", tag: "Vegetarian" },
  { id: "vegan", label: "Vegan", tag: "Vegan" },
];

function tagShortLabel(tag: string): string {
  const lower = tag.toLowerCase();
  if (lower.includes("gluten")) return "GF";
  if (lower === "mild") return "Mild";
  if (lower === "vegan") return "Vg";
  if (lower.includes("vegetarian")) return "V";
  return tag;
}

function MenuTagBadge({ tag }: { tag: string }) {
  const short = tagShortLabel(tag);
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-[0.08em]",
        short === "GF" && "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
        short === "Mild" && "border-sky-500/35 bg-sky-500/10 text-sky-300",
        short === "V" && "border-lime-500/35 bg-lime-500/10 text-lime-300",
        short === "Vg" && "border-green-500/35 bg-green-500/10 text-green-300",
        !["GF", "Mild", "V", "Vg"].includes(short) &&
          "border-gold/25 bg-gold/10 text-gold/90",
      )}
      title={tag}
    >
      {short}
    </span>
  );
}

function VariantPrices({ item }: { item: MenuItem }) {
  const range = priceRangeLabel(item.variants);

  if (item.variants.length <= 1) {
    const variant = item.variants[0];
    if (!variant) return null;
    return (
      <span className="shrink-0 font-serif text-2xl text-gold sm:text-3xl">
        {formatPricePence(variant.pricePence)}
      </span>
    );
  }

  return (
    <div className="shrink-0 text-right">
      {range && (
        <p className="font-serif text-xl text-gold sm:text-2xl">{range}</p>
      )}
      <ul className="mt-2 space-y-1">
        {item.variants.map((variant) => (
          <li
            key={variant.id}
            className="flex items-baseline justify-end gap-3 text-base"
          >
            {variant.protein && (
              <span className="text-muted">{variant.protein}</span>
            )}
            <span className="font-serif text-lg text-gold">
              {formatPricePence(variant.pricePence)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MenuItemRow({ item }: { item: MenuItem }) {
  return (
    <li
      className={cn(
        "group border-b border-gold/10 py-7 last:border-b-0",
        item.featured &&
          "relative border-l-2 border-l-gold/70 bg-gold/[0.03] pl-5 -ml-5 pr-0 sm:pl-6 sm:-ml-6",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="font-serif text-xl font-normal text-foreground sm:text-[1.65rem]">
              {item.name}
            </h3>
            {item.featured && (
              <span className="rounded-full border border-gold/40 bg-gold/15 px-3 py-0.5 text-xs uppercase tracking-[0.12em] text-gold">
                Signature
              </span>
            )}
          </div>
          {(item.tags.length > 0 || item.description) && (
            <div className="mt-3 space-y-3">
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <MenuTagBadge key={tag} tag={tag} />
                  ))}
                </div>
              )}
              {item.description && (
                <p className="max-w-2xl text-lg leading-relaxed text-muted">
                  {item.description}
                </p>
              )}
            </div>
          )}
        </div>
        <VariantPrices item={item} />
      </div>
    </li>
  );
}

function categoryPillLabel(name: string): string {
  const normalized = name.replace(/[\u2018\u2019]/g, "'").trim();
  const labels: Record<string, string> = {
    STARTERS: "Starters",
    "VIETNAMESE NOM SALAD": "Salads",
    "CHEF's SPECIAL MENU": "Chef's special",
    "CHEF’S SPECIAL MENU": "Chef's special",
    "MAIN COURSES PHO SOUP STYLE": "Pho & noodles",
    "WOK AND GRILL": "Wok & grill",
    "VIETNAMESE BROKEN RICE": "Broken rice",
    "VEGETERIAN MENU": "Vegetarian",
    "KID's CORNER": "Kids",
    "KID’S CORNER": "Kids",
    "Noodle Soup": "Noodle soup",
    "Wok & Grill": "Wok & grill",
    "Broken Rice": "Broken rice",
  };
  return labels[normalized] ?? normalized.replace(/\s+MENU$/i, "").trim();
}

function CategoryScrollBar({
  categories,
  activeCategory,
  onSelect,
}: {
  categories: MenuCategory[];
  activeCategory: string | null;
  onSelect: (id: string) => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    setCanScrollLeft(rail.scrollLeft > 8);
    setCanScrollRight(maxScroll > 8 && rail.scrollLeft < maxScroll - 8);
  }, []);

  useEffect(() => {
    updateScrollState();
    const rail = railRef.current;
    if (!rail) return;

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(rail);
    window.addEventListener("resize", updateScrollState);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [categories, updateScrollState]);

  useEffect(() => {
    if (!activeCategory) return;
    const pill = document.getElementById(`menu-cat-${activeCategory}`);
    pill?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeCategory]);

  function scrollByAmount(direction: "left" | "right") {
    railRef.current?.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  }

  if (categories.length <= 1) return null;

  return (
    <div className="relative min-w-0 w-full">
      {canScrollLeft && (
        <>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background via-background/90 to-transparent sm:w-12"
            aria-hidden
          />
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-gold/30 bg-background/95 p-1.5 text-gold shadow-sm transition hover:border-gold hover:bg-gold/10 sm:flex"
            aria-label="Scroll categories left"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
        </>
      )}

      {canScrollRight && (
        <>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background via-background/90 to-transparent sm:w-12"
            aria-hidden
          />
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-gold/30 bg-background/95 p-1.5 text-gold shadow-sm transition hover:border-gold hover:bg-gold/10 sm:flex"
            aria-label="Scroll categories right"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </>
      )}

      <div
        ref={railRef}
        onScroll={updateScrollState}
        role="tablist"
        aria-label="Menu categories"
        className="menu-category-rail flex min-w-0 w-full snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden pb-2 pt-0.5 [-ms-overflow-style:auto] [scrollbar-gutter:stable]"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            id={`menu-cat-${category.id}`}
            type="button"
            role="tab"
            aria-selected={activeCategory === category.id}
            title={category.name}
            onClick={() => onSelect(category.id)}
            className={cn(
              "min-h-11 shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2.5 text-sm uppercase tracking-[0.08em] transition",
              activeCategory === category.id
                ? "border-gold bg-gold/15 text-gold"
                : "border-gold/20 text-muted hover:border-gold/40 hover:text-foreground",
            )}
          >
            {categoryPillLabel(category.name)}
          </button>
        ))}
      </div>

      {canScrollRight && (
        <p className="mt-1 text-center text-xs text-muted sm:hidden">
          Swipe categories →
        </p>
      )}
    </div>
  );
}

function MenuCategorySection({ category }: { category: MenuCategory }) {
  return (
    <section
      id={`menu-${category.id}`}
      className="scroll-mt-36 md:scroll-mt-48 luxury-card overflow-hidden"
    >
      <div className="border-b border-gold/15 bg-surface-alt/40 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl font-normal text-foreground sm:text-4xl">
            {category.name}
          </h2>
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.1em] text-muted">
            {category.note && <span>{category.note}</span>}
            <span className="text-gold/70">
              {category.items.length}{" "}
              {category.items.length === 1 ? "dish" : "dishes"}
            </span>
          </div>
        </div>
      </div>
      <ul className="px-6 sm:px-8">
        {category.items.map((item) => (
          <MenuItemRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

export function MenuTabs({
  branchMenu,
  initialTab = "daily",
  menuAssistantEnabled = true,
}: MenuTabsProps) {
  const router = useRouter();
  const [tab, setTab] = useState<MenuTab>(initialTab);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>("all");

  const activeBranch = branchMenu;
  const categories = useMemo(
    () => (tab === "daily" ? activeBranch.daily : activeBranch.lunch),
    [activeBranch, tab],
  );

  const filteredCategories = useMemo(
    () => filterMenuCategories(categories, searchQuery, dietaryFilter),
    [categories, searchQuery, dietaryFilter],
  );

  const itemCount = useMemo(
    () => countMenuItems(categories),
    [categories],
  );

  const filteredItemCount = useMemo(
    () => countMenuItems(filteredCategories),
    [filteredCategories],
  );

  const isFiltering =
    searchQuery.trim().length > 0 || dietaryFilter !== "all";

  const syncUrl = useCallback(
    (menuTab: MenuTab) => {
      const params = new URLSearchParams();
      if (menuTab === "lunch") params.set("type", "lunch");
      const query = params.toString();
      router.replace(query ? `/menu?${query}` : "/menu", { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    syncUrl(tab);
  }, [tab, syncUrl]);

  useEffect(() => {
    setActiveCategory(filteredCategories[0]?.id ?? null);
  }, [filteredCategories, tab]);

  useEffect(() => {
    const ids = filteredCategories.map((c) => c.id);
    const elements = ids
      .map((id) => document.getElementById(`menu-${id}`))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveCategory(visible[0].target.id.replace("menu-", ""));
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [filteredCategories]);

  function scrollToCategory(categoryId: string) {
    document
      .getElementById(`menu-${categoryId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveCategory(categoryId);
  }

  const branchLabel = "Finchley Road";

  return (
    <>
      <div className="sticky top-[var(--site-header-height)] z-30 -mx-6 min-w-0 overflow-hidden border-b border-gold/10 bg-background/95 px-6 py-3 backdrop-blur-xl sm:-mx-0 sm:py-4">
        <div className="mx-auto min-w-0 max-w-5xl space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="Menu type"
              className="fine-dining-panel inline-flex shrink-0"
            >
              {(
                [
                  { id: "daily" as const, label: "Daily" },
                  { id: "lunch" as const, label: "Lunch" },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "min-h-11 px-5 py-3 text-sm font-medium uppercase tracking-[0.1em] transition sm:px-8 sm:py-3.5 sm:text-base",
                    tab === id
                      ? "bg-gold text-white"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="hidden text-sm text-muted sm:block">
              {isFiltering ? (
                <>
                  <span className="text-gold">{filteredItemCount}</span> of{" "}
                  {itemCount} dishes
                </>
              ) : (
                <>
                  <span className="text-gold">{itemCount}</span> dishes
                </>
              )}
            </p>
          </div>

          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold/70"
              strokeWidth={1.5}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes…"
              aria-label="Search menu"
              className="luxury-input w-full py-2.5 pl-11 pr-11 text-base sm:py-3"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded text-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {!isFiltering && (
            <div className="hidden md:block">
              <CategoryScrollBar
                categories={filteredCategories}
                activeCategory={activeCategory}
                onSelect={scrollToCategory}
              />
            </div>
          )}
        </div>
      </div>

      {!isFiltering && (
        <div className="-mx-6 border-b border-gold/10 bg-background px-6 py-3 md:hidden">
          <CategoryScrollBar
            categories={filteredCategories}
            activeCategory={activeCategory}
            onSelect={scrollToCategory}
          />
        </div>
      )}

      <div className="mx-auto mt-8 max-w-5xl">
        <div className="space-y-4 rounded border border-gold/15 bg-surface-alt/30 px-5 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg text-muted">
              <span className="text-foreground">Pho Ta {branchLabel}</span>
              {" · "}
              {tab === "daily" ? "Daily menu" : "Lunch menu"}
            </p>
            {isFiltering && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setDietaryFilter("all");
                }}
                className="text-sm uppercase tracking-[0.1em] text-gold hover:text-gold-light"
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="menu-category-rail flex min-w-0 gap-2 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setDietaryFilter("all")}
              className={cn(
                "flex min-h-11 shrink-0 items-center rounded-full border px-4 py-2 text-sm transition",
                dietaryFilter === "all"
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-gold/20 text-muted hover:border-gold/40",
              )}
            >
              All
            </button>
            {DIETARY_FILTERS.map(({ id, label, tag }) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setDietaryFilter((current) => (current === id ? "all" : id))
                }
                className={cn(
                  "flex min-h-11 shrink-0 items-center rounded-full transition",
                  dietaryFilter === id && "ring-1 ring-gold/50",
                )}
                aria-label={`Filter ${label}`}
              >
                <MenuTagBadge tag={tag} />
              </button>
            ))}
          </div>
        </div>

        {tab === "lunch" && activeBranch.lunchNote && (
          <p className="mt-6 text-center text-lg text-muted">
            {activeBranch.lunchNote}
          </p>
        )}

        <div className="mt-10 space-y-8" role="tabpanel">
          {filteredCategories.length === 0 ? (
            <div className="luxury-card px-8 py-16 text-center text-xl text-muted">
              {categories.length === 0
                ? "No dishes listed for this menu yet."
                : "No dishes match your search. Try another term or clear the filters."}
            </div>
          ) : (
            filteredCategories.map((category) => (
              <MenuCategorySection key={category.id} category={category} />
            ))
          )}
        </div>

        <div className="mt-16 border-t border-gold/15 pt-12 text-center">
          <p className="text-base uppercase tracking-[0.1em] text-muted">
            Allergies or dietary needs? Please tell us when you book or ask your
            server.
          </p>
          <Link href="/book" className="mt-8 inline-block">
            <Button size="lg" className="gap-2">
              Reserve a table
              <ArrowRight size={18} strokeWidth={1.5} />
            </Button>
          </Link>
        </div>
      </div>

      {menuAssistantEnabled && (
        <MenuAssistant menuTab={tab} branchLabel={branchLabel} />
      )}
    </>
  );
}
