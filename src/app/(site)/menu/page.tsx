import type { Metadata } from "next";
import { MenuTabs } from "@/components/menu/MenuTabs";
import { getMenu } from "@/lib/db/menu-store";
import { locations } from "@/lib/data/locations";
import type { MenuLocationSlug } from "@/lib/menu/types";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Explore Pho Ta's full Vietnamese menu at Kentish Town and Finchley Road — daily selections, lunch specials, pho, wok & grill, and more.",
};

const VALID_LOCATIONS = new Set<MenuLocationSlug>([
  "kentish-town",
  "finchley-road",
]);

interface MenuPageProps {
  searchParams: Promise<{ location?: string; type?: string }>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const params = await searchParams;
  const requestedLocation = params.location as MenuLocationSlug | undefined;
  const initialLocation =
    requestedLocation && VALID_LOCATIONS.has(requestedLocation)
      ? requestedLocation
      : "kentish-town";
  const initialTab = params.type === "lunch" ? "lunch" : "daily";

  const menu = await getMenu();

  const branchOptions = locations.map((location) => ({
    slug: location.slug as MenuLocationSlug,
    label: location.shortName,
  }));

  return (
    <>
      <section className="border-b border-gold/15 bg-surface-alt/60">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <p className="label-caps">Cuisine</p>
          <h1 className="mt-4 font-display text-5xl font-normal tracking-wide text-foreground sm:text-6xl">
            The Menu
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-muted">
            Premium ingredients and Vietnamese tradition — browse by location,
            jump to a section, and reserve when you are ready.
          </p>
          <div className="gold-line mx-auto mt-8 w-20" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <MenuTabs
          branches={branchOptions}
          branchMenus={menu.branches}
          initialLocation={initialLocation}
          initialTab={initialTab}
        />
      </div>
    </>
  );
}
