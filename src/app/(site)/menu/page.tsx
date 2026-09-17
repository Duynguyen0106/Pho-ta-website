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
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <p className="label-caps">Cuisine</p>
          <h1 className="mt-4 font-display text-5xl font-normal tracking-wide text-foreground sm:text-6xl">
            The Menu
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-muted">
            Premium ingredients and Vietnamese tradition — ask our menu helper
            about any dish, and reserve when you are ready.
          </p>
          <div className="gold-line mx-auto mt-8 w-20" />
        </div>
      </section>

      <div className="mx-auto min-w-0 max-w-6xl overflow-x-hidden px-6 py-12 sm:py-16">
        <MenuTabs
          branchMenu={branchMenu}
          initialTab={initialTab}
          menuAssistantEnabled={settings.features.menuAssistantEnabled}
        />
      </div>
    </>
  );
}
