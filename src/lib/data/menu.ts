export interface MenuItem {
  name: string;
  description: string;
  price?: string;
  tags?: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: "pho",
    name: "Pho & Noodle Soups",
    items: [
      {
        name: "Special Pho",
        description:
          "Our signature beef pho with fresh herbs, bean sprouts, lime, and hoisin on the side.",
        price: "£12.50",
        tags: ["Chef's choice"],
      },
      {
        name: "Vegetable Pho",
        description:
          "Fragrant vegetable broth with rice noodles, tofu, and seasonal greens.",
        price: "£10.50",
        tags: ["Vegetarian", "Vegan"],
      },
      {
        name: "Chicken Pho",
        description: "Light chicken broth with rice noodles and fresh herbs.",
        price: "£11.50",
      },
    ],
  },
  {
    id: "rice-noodles",
    name: "Rice & Noodles",
    items: [
      {
        name: "Bun Cha",
        description:
          "Traditional Hanoi-style grilled pork with vermicelli, pickles, and fresh herbs.",
        price: "£13.50",
        tags: ["Popular"],
      },
      {
        name: "Broken Rice with Grilled Chicken",
        description: "Com ga nuong with pickled vegetables and fish sauce.",
        price: "£12.00",
      },
    ],
  },
  {
    id: "starters",
    name: "Starters",
    items: [
      {
        name: "Summer Rolls",
        description: "Fresh rice paper rolls with prawn or chicken and herbs.",
        price: "£6.50",
      },
      {
        name: "Spring Rolls",
        description: "Crispy rolls with pork, crab, or chicken filling.",
        price: "£5.50",
      },
    ],
  },
  {
    id: "drinks",
    name: "Drinks",
    items: [
      {
        name: "Vietnamese Iced Coffee",
        description: "Strong coffee with condensed milk over ice.",
        price: "£4.00",
      },
      {
        name: "Fresh Teas",
        description: "Jasmine, green, or iced lemon tea.",
        price: "£3.50",
      },
    ],
  },
];

export const featuredDishes = [
  {
    name: "Bun Cha",
    description:
      "A traditional Vietnamese pork dish from Hanoi — grilled pork with vermicelli, pickles, and fresh herbs.",
    image:
      "https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80",
  },
  {
    name: "Vegetable Pho",
    description:
      "Fresh, healthy, and full of flavour — a customer favourite any time of day.",
    image:
      "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80",
  },
  {
    name: "Special Pho",
    description:
      "Our signature take on the classic — rich broth, fresh ingredients, and extras on the side.",
    image:
      "https://images.unsplash.com/photo-1591814468924-caf87d6592d3?w=800&q=80",
  },
];
