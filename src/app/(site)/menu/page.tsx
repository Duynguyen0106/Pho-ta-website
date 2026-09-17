import type { Metadata } from "next";
import { menuCategories } from "@/lib/data/menu";

export const metadata: Metadata = {
  title: "Menu",
  description: "Explore Pho Ta's menu — pho, bun cha, rice dishes, starters, and drinks.",
};

export default function MenuPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-[#c9a962]">Our Menu</p>
        <h1 className="mt-2 font-serif text-4xl text-[#1a3c34]">Flavourful & Fresh</h1>
        <p className="mx-auto mt-4 max-w-lg text-[#5c534a]">
          Healthy, delicious Vietnamese food with fresh ingredients. We cater to
          vegetarian, vegan, and other dietary requirements.
        </p>
      </div>

      <div className="mt-16 space-y-14">
        {menuCategories.map((category) => (
          <section key={category.id}>
            <h2 className="border-b border-[#e8e0d4] pb-3 font-serif text-2xl text-[#1a3c34]">
              {category.name}
            </h2>
            <ul className="mt-6 divide-y divide-[#e8e0d4]">
              {category.items.map((item) => (
                <li
                  key={item.name}
                  className="flex flex-col gap-2 py-5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-[#1a3c34]">{item.name}</h3>
                      {item.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#1a3c34]/10 px-2 py-0.5 text-xs text-[#1a3c34]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-[#5c534a]">{item.description}</p>
                  </div>
                  {item.price && (
                    <span className="shrink-0 font-medium text-[#c9a962]">
                      {item.price}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-[#8a7f72]">
        Prices are indicative. Please ask your server about daily specials and extras.
      </p>
    </div>
  );
}
