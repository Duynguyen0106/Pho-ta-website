"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { MenuAssistant } from "@/components/menu/MenuAssistant";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { formatPricePence, priceRangeLabel } from "@/lib/menu/format";
import type { BranchMenu, MenuCategory, MenuItem } from "@/lib/menu/types";

type MenuTab = "daily" | "lunch";

interface MenuTabsProps {
  branchMenu: BranchMenu;
  initialTab?: MenuTab;
}

const DIETARY_LEGEND = [
  { label: "Gluten free", short: "GF" },
  { label: "Mild", short: "Mild" },
  { label: "Vegetarian", short: "V" },
  { label: "Vegan", short: "Vg" },
] as const;

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
            <h3 className="font-serif text-2xl font-normal text-foreground sm:text-[1.65rem]">
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

function MenuCategorySection({ category }: { category: MenuCategory }) {
  return (
    <section
      id={`menu-${category.id}`}
      className="scroll-mt-44 luxury-card overflow-hidden"
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
}: MenuTabsProps) {
  const router = useRouter();
  const [tab, setTab] = useState<MenuTab>(initialTab);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const activeBranch = branchMenu;
  const categories = useMemo(
    () => (tab === "daily" ? activeBranch.daily : activeBranch.lunch),
    [activeBranch, tab],
  );

  const itemCount = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.items.length, 0),
    [categories],
  );

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
    setActiveCategory(categories[0]?.id ?? null);
  }, [categories]);

  useEffect(() => {
    const ids = categories.map((c) => c.id);
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
  }, [categories]);

  function scrollToCategory(categoryId: string) {
    document
      .getElementById(`menu-${categoryId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveCategory(categoryId);
  }

  const branchLabel = "Finchley Road";

  return (
    <>
      <div className="sticky top-[4.5rem] z-30 -mx-6 border-b border-gold/10 bg-background/95 px-6 py-4 backdrop-blur-xl sm:-mx-0 sm:rounded-none">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div
              role="tablist"
              aria-label="Menu type"
              className="fine-dining-panel inline-flex self-start"
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
                    "px-5 py-3 text-sm font-medium uppercase tracking-[0.1em] transition sm:px-8 sm:py-3.5 sm:text-base",
                    tab === id
                      ? "bg-gold text-white"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {categories.length > 1 && (
            <nav
              aria-label="Menu categories"
              className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => scrollToCategory(category.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm uppercase tracking-[0.08em] transition",
                    activeCategory === category.id
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-gold/20 text-muted hover:border-gold/40 hover:text-foreground",
                  )}
                >
                  {category.name}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded border border-gold/15 bg-surface-alt/30 px-5 py-4">
          <p className="text-lg text-muted">
            <span className="text-foreground">{branchLabel}</span>
            {" · "}
            {tab === "daily" ? "Daily menu" : "Lunch menu"}
            {" · "}
            <span className="text-gold">{itemCount} dishes</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {DIETARY_LEGEND.map(({ label, short }) => (
              <MenuTagBadge key={label} tag={label} />
            ))}
          </div>
        </div>

        {tab === "lunch" && activeBranch.lunchNote && (
          <p className="mt-6 text-center text-lg text-muted">
            {activeBranch.lunchNote}
          </p>
        )}

        <div className="mt-10 space-y-8" role="tabpanel">
          {categories.length === 0 ? (
            <div className="luxury-card px-8 py-16 text-center text-xl text-muted">
              No dishes listed for this menu yet.
            </div>
          ) : (
            categories.map((category) => (
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

      <MenuAssistant menuTab={tab} branchLabel={branchLabel} />
    </>
  );
}
