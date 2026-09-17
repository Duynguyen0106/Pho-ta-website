import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { menuCategories } from "@/lib/data/menu";

export const metadata: Metadata = {
  title: "Menu",
  description: "Explore Pho Ta's refined Vietnamese menu — pho, bun cha, and seasonal selections.",
};

export default function MenuPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading
        eyebrow="Cuisine"
        title="The Menu"
        description="Each dish is prepared with premium ingredients and the reverence of Vietnamese culinary tradition."
      />

      <div className="mt-24 space-y-20">
        {menuCategories.map((category) => (
          <section key={category.id}>
            <div className="flex items-end justify-between border-b border-[#c9a962]/20 pb-4">
              <h2 className="font-serif text-3xl font-light text-[#f5f0e6]">
                {category.name}
              </h2>
            </div>
            <ul className="mt-8 space-y-0">
              {category.items.map((item) => (
                <li
                  key={item.name}
                  className="flex flex-col gap-3 border-b border-[#c9a962]/8 py-8 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-baseline gap-3">
                      <h3 className="font-serif text-xl font-light text-[#f5f0e6]">
                        {item.name}
                      </h3>
                      {item.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] uppercase tracking-[0.2em] text-[#c9a962]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#9a9085]">
                      {item.description}
                    </p>
                  </div>
                  {item.price && (
                    <span className="shrink-0 font-serif text-lg text-[#c9a962]">
                      {item.price}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-16 text-center text-[11px] uppercase tracking-[0.2em] text-[#6b635a]">
        Seasonal availability · Please enquire with your server
      </p>

      <div className="mt-12 text-center">
        <Link href="/book">
          <Button size="lg">Reserve a Table</Button>
        </Link>
      </div>
    </div>
  );
}
