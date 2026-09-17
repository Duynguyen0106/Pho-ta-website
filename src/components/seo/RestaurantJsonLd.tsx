import { locations } from "@/lib/data/locations";

export function RestaurantJsonLd() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.photarestaurants.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": locations.map((location) => ({
      "@type": "Restaurant",
      name: location.name,
      servesCuisine: "Vietnamese",
      telephone: location.phone,
      email: location.email,
      url: baseUrl,
      address: {
        "@type": "PostalAddress",
        streetAddress: location.address,
        addressLocality: location.city,
        postalCode: location.postcode,
        addressCountry: "GB",
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "11:30",
        closes: "21:30",
      },
      acceptsReservations: true,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
