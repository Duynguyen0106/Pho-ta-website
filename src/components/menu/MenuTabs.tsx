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
      <span className="shrink-0 font-serif text-lg text-[#c9a962]">
        {formatPricePence(variant.pricePence)}
      </span>
    );
  }

  return (
    <ul className="shrink-0 space-y-1 text-right">
      {item.variants.map((variant) => (
        <li
          key={variant.id}
          className="flex items-baseline justify-end gap-3 text-sm"
        >
          {variant.protein && (
            <span className="text-[#9a9085]">{variant.protein}</span>
          )}
          <span className="font-serif text-lg text-[#c9a962]">
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
          <div className="flex items-end justify-between border-b border-[#c9a962]/20 pb-4">
            <h2 className="font-serif text-3xl font-light text-[#f5f0e6]">
              {category.name}
            </h2>
            {category.note && (
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#6b635a]">
                {category.note}
              </p>
            )}
          </div>
          <ul className="mt-8 space-y-0">
            {category.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 border-b border-[#c9a962]/8 py-8 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="font-serif text-xl font-light text-[#f5f0e6]">
                      {item.name}
                    </h3>
                    {item.featured && (
                      <span className="text-[9px] uppercase tracking-[0.2em] text-[#c9a962]">
                        Signature
                      </span>
                    )}
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] uppercase tracking-[0.2em] text-[#6b635a]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {item.description && (
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#9a9085]">
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
          className="inline-flex border border-[#c9a962]/25"
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
                "px-8 py-3 text-[11px] uppercase tracking-[0.25em] transition",
                tab === id
                  ? "bg-[#c9a962] text-[#0a0908]"
                  : "text-[#9a9085] hover:text-[#f5f0e6]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "lunch" && (
        <p className="mt-8 text-center text-sm text-[#9a9085]">{lunchNote}</p>
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
