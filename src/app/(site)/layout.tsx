import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { RestaurantJsonLd } from "@/components/seo/RestaurantJsonLd";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RestaurantJsonLd />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
