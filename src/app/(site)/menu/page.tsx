import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
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
  searchParams: Promise<{ location?: string }>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const params = await searchParams;
  const requestedLocation = params.location as MenuLocationSlug | undefined;
  const initialLocation =
    requestedLocation && VALID_LOCATIONS.has(requestedLocation)
      ? requestedLocation
      : "kentish-town";

  const menu = await getMenu();

  const branchOptions = locations.map((location) => ({
    slug: location.slug as MenuLocationSlug,
    label: location.shortName,
  }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading
        eyebrow="Cuisine"
        title="The Menu"
        description="Each dish is prepared with premium ingredients and the reverence of Vietnamese culinary tradition — explore the menu for your chosen location."
      />

      <MenuTabs
        branches={branchOptions}
        branchMenus={menu.branches}
        initialLocation={initialLocation}
      />

      <p className="mt-16 text-center text-base uppercase tracking-[0.1em] text-muted">
        Gluten free · Mild · Vegetarian · Vegan options marked · Please enquire
        with your server
      </p>

      <div className="mt-12 text-center">
        <Link href={`/book?location=${initialLocation}`}>
          <Button size="lg">Reserve a Table</Button>
        </Link>
      </div>
    </div>
  );
}
