"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatPricePence } from "@/lib/menu/format";
import type { MenuCategory, MenuItem } from "@/lib/menu/types";

type MenuTab = "daily" | "lunch";

interface MenuTabsProps {
  dailyCategories: MenuCategory[];
  lunchCategories: MenuCategory[];
  lunchNote: string;
}

function VariantPrices({ item }: { item: MenuItem }) {
  if (item.variants.length <= 1) {
    const variant = item.variants[0];
    if (!variant) return null;
    return (
      <span className="shrink-0 font-serif text-xl text-gold">
        {formatPricePence(variant.pricePence)}
      </span>
    );
  }

  return (
    <ul className="shrink-0 space-y-1.5 text-right">
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
  );
}

function MenuCategoryList({ categories }: { categories: MenuCategory[] }) {
  return (
    <div className="space-y-20">
      {categories.map((category) => (
        <section key={category.id}>
          <div className="flex items-end justify-between border-b border-gold/20 pb-4">
            <h2 className="font-serif text-3xl font-normal text-foreground">
              {category.name}
            </h2>
            {category.note && (
              <p className="text-sm uppercase tracking-[0.12em] text-muted">
                {category.note}
              </p>
            )}
          </div>
          <ul className="mt-8 space-y-0">
            {category.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 border-b border-gold/10 py-8 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="font-serif text-xl font-normal text-foreground">
                      {item.name}
                    </h3>
                    {item.featured && (
                      <span className="text-xs uppercase tracking-[0.12em] text-gold">
                        Signature
                      </span>
                    )}
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs uppercase tracking-[0.12em] text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {item.description && (
                    <p className="mt-2 max-w-lg text-base leading-relaxed text-muted">
                      {item.description}
                    </p>
                  )}
                </div>
                <VariantPrices item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function MenuTabs({
  dailyCategories,
  lunchCategories,
  lunchNote,
}: MenuTabsProps) {
  const [tab, setTab] = useState<MenuTab>("daily");

  return (
    <>
      <div className="mt-16 flex justify-center">
        <div
          role="tablist"
          aria-label="Menu type"
          className="inline-flex border border-gold/30 bg-surface"
        >
          {(
            [
              { id: "daily" as const, label: "Daily Menu" },
              { id: "lunch" as const, label: "Lunch Menu" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "px-8 py-3.5 text-sm font-medium uppercase tracking-[0.12em] transition",
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

      {tab === "lunch" && (
        <p className="mt-8 text-center text-base text-muted">{lunchNote}</p>
      )}

      <div className="mt-16" role="tabpanel">
        {tab === "daily" ? (
          <MenuCategoryList categories={dailyCategories} />
        ) : (
          <MenuCategoryList categories={lunchCategories} />
        )}
      </div>
    </>
  );
}
