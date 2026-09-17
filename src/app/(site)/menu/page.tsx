import type { Metadata } from "next";
import { MenuTabs } from "@/components/menu/MenuTabs";
import { getMenu } from "@/lib/db/menu-store";
import { getSiteSettings } from "@/lib/db/settings-store";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Explore Pho Ta Finchley Road's full Vietnamese menu — daily selections, lunch specials, pho, wok & grill, and more.",
};

interface MenuPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const params = await searchParams;
  const initialTab = params.type === "lunch" ? "lunch" : "daily";

  const [menu, settings] = await Promise.all([getMenu(), getSiteSettings()]);
  const branchMenu = menu.branches["finchley-road"];

  return (
    <>
      <section className="border-b border-gold/15 bg-surface-alt/60">
        <div className="mx-auto max-w-6xl px-6 py-10 text-center sm:py-20">
          <p className="label-caps">Cuisine</p>
          <h1 className="mt-3 font-display text-4xl font-normal tracking-wide text-foreground sm:mt-4 sm:text-6xl">
            The Menu
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted sm:mt-6 sm:text-xl">
            Browse our dishes, filter by dietary tags, or ask the menu helper.
          </p>
          <div className="gold-line mx-auto mt-6 w-20 sm:mt-8" />
        </div>
      </section>

      <div className="mx-auto min-w-0 max-w-6xl overflow-x-hidden px-6 py-6 pb-24 sm:py-16 sm:pb-16">
        <MenuTabs
          branchMenu={branchMenu}
          initialTab={initialTab}
          menuAssistantEnabled={settings.features.menuAssistantEnabled}
        />
      </div>
    </>
  );
}
