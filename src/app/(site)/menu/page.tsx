import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { MenuTabs } from "@/components/menu/MenuTabs";
import {
  dailyMenuCategories,
  lunchMenuCategories,
  lunchMenuNote,
} from "@/lib/data/menu";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Explore Pho Ta's full Vietnamese menu — daily selections, lunch specials, pho, wok & grill, and more.",
};

export default function MenuPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading
        eyebrow="Cuisine"
        title="The Menu"
        description="Each dish is prepared with premium ingredients and the reverence of Vietnamese culinary tradition."
      />

      <MenuTabs
        dailyCategories={dailyMenuCategories}
        lunchCategories={lunchMenuCategories}
        lunchNote={lunchMenuNote}
      />

      <p className="mt-16 text-center text-[11px] uppercase tracking-[0.2em] text-[#6b635a]">
        Gluten free · Mild · Vegetarian · Vegan options marked · Please enquire
        with your server
      </p>

      <div className="mt-12 text-center">
        <Link href="/book">
          <Button size="lg">Reserve a Table</Button>
        </Link>
      </div>
    </div>
  );
}
