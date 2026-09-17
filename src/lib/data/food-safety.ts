export interface AllergenGroup {
  name: string;
  details: string;
  dishes?: string;
}

export const hygienePoints: { title: string; body: string }[] = [
  {
    title: "Food hygiene standards",
    body:
      "Pho Ta follows UK food safety law and HACCP principles. Our kitchens maintain rigorous cleaning schedules, temperature controls, and staff training so every dish is prepared safely.",
  },
  {
    title: "Fresh ingredients",
    body:
      "We source quality produce and proteins daily. Stocks and broths are prepared in-house; herbs and garnishes are prepared fresh for service.",
  },
  {
    title: "Staff training",
    body:
      "All food-handling staff receive allergen awareness training. If you have questions about how a dish is prepared, please ask your server before ordering.",
  },
];

export const allergenGroups: AllergenGroup[] = [
  {
    name: "Cereals containing gluten",
    details:
      "Some noodles, spring roll wrappers, and marinades may contain wheat or gluten.",
    dishes: "Pho noodles (verify type), dumplings, some sauces",
  },
  {
    name: "Crustaceans & molluscs",
    details:
      "Prawns, crab, and squid appear in several dishes and stocks.",
    dishes: "Seafood pho, salt & pepper squid, prawn summer rolls",
  },
  {
    name: "Eggs",
    details: "Used in some batters, noodles, and desserts.",
    dishes: "Certain stir-fries, egg noodles, some desserts",
  },
  {
    name: "Fish",
    details: "Fish sauce (nước mắm) is used widely in Vietnamese cooking.",
    dishes: "Most pho broths, marinades, dipping sauces",
  },
  {
    name: "Peanuts & tree nuts",
    details:
      "Peanuts and nuts may be used as garnishes or in sauces.",
    dishes: "Salads, some noodle toppings, peanut dipping sauce",
  },
  {
    name: "Soy",
    details: "Soy sauce and tofu are common across the menu.",
    dishes: "Marinades, vegetarian options, wok dishes",
  },
  {
    name: "Sesame",
    details: "Sesame oil and seeds may be used in dressings and garnishes.",
  },
  {
    name: "Celery, mustard & sulphites",
    details:
      "May be present in stocks, seasonings, or wine used in cooking.",
  },
];

export const allergyAdvice: string[] = [
  "Our menu contains allergens. A full allergen matrix is available on request — ask your server or manager.",
  "We cannot guarantee a completely allergen-free environment because ingredients are prepared in shared kitchens.",
  "If you have a severe allergy, please speak to us before ordering. We will guide you to suitable dishes where possible.",
  "Always declare allergies when booking online in special requests, and remind your server when you arrive.",
  "Allergy information you provide is handled confidentially — see our Privacy policy for how we protect your data.",
];
