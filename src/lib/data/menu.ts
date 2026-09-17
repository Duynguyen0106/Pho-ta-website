import { siteImages } from "./images";

export interface MenuItem {
  name: string;
  description: string;
  price?: string;
  tags?: string[];
  featured?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  note?: string;
  items: MenuItem[];
}

export const dailyMenuCategories: MenuCategory[] = [
  {
    id: "daily-starters",
    name: "STARTERS",
    items: [
      {
        name: "★ Special Platter for 2 People",
        description: "Crispy Pork Spring Rolls, Seafood Springs Rolls, King Prawns Summer Rolls, Salt & Pepper Squid, Salt & Pepper King Prawns, and Mango Salad", price: "£41", tags: ["Gluten free", "Mild"], featured: true,
      },
      {
        name: "★ Special Platter for 3 People",
        description: "Crispy Pork Spring Rolls, Seafood Spring Rolls, King Prawns Summer Rolls, Chicken Summer Rolls, Salt & Pepper Squid, Grilled King Prawns, Salt & Pepper Chicken, and King Prawn Mango Salad", price: "£57", tags: ["Gluten free", "Mild"], featured: true,
      },
      {
        name: "S01 Nem Thit (3 Rolls)",
        description: "Crispy Pork Spring Roll Served with Nuoc Cham Sauce", price: "£7.50", tags: ["Gluten free"],
      },
      {
        name: "S02 Nem Hai San (2 Rolls)",
        description: "Crispy Crab, Prawn and Pork Spring Roll served with Nuoc Cham Sauce", price: "£8.50", tags: ["Gluten free"],
      },
      {
        name: "S03 Goi Cuon Ga",
        description: "Chicken Summer Roll Served with Peanut Sauce", price: "£7.50", tags: ["Gluten free"],
      },
      {
        name: "S04 Goi Cuon Tom",
        description: "King Prawn Summer Roll Served with Peanut Sauce", price: "£8", tags: ["Gluten free"],
      },
      {
        name: "S05 Canh Ga Chien",
        description: "Vietnamese Golden Chicken Wings Served with Chilli Sauce", price: "£9", tags: ["Gluten free", "Mild"],
      },
      {
        name: "S06 Banh Xeo",
        description: "Vietnamese Crispy Prawn & Chicken Crepe Served with Nuoc Cham Sauce", price: "£14", tags: ["Gluten free"],
      },
      {
        name: "S07 Muc Muoi",
        description: "Salt and Pepper Squid Served with Sweet Chilli Sauce", price: "£10", tags: ["Gluten free", "Mild"],
      },
      {
        name: "S08 Tom Muoi",
        description: "Salt and Pepper King Prawns Served with Sweet Chilli Sauce", price: "£10", tags: ["Gluten free", "Mild"],
      },
      {
        name: "S09 Ga Muoi",
        description: "Salt and Pepper Chicken Served with Sweet Chilli Sauce", price: "£9.50", tags: ["Gluten free", "Mild"],
      },
      {
        name: "S10A Banh Cuon Thit",
        description: "Vietnamese Pork Steam Rice Rolls Served with Nuoc Cham Sauce", price: "£14", tags: ["Gluten free"],
      },
      {
        name: "S10B Banh Cuon Thit Nuong",
        description: "Vietnamese Pork Steam Rolls Served with Vietnamese Grilled Pork and Nuoc Cham Sauce", price: "£15", tags: ["Gluten free"],
      },
      {
        name: "S11 Bo Cuon La Lot",
        description: "Beef Wrapped In Betel Leaves Served with Salad, Vermicelli, and Nuoc Cham Sauce", price: "£13.50", tags: ["Gluten free"],
      },
      {
        name: "S12 Thit Heo Nuong Xien",
        description: "Grilled Pork Marinated with Galangal, Lemongrass, Dipping with House Special Sauce", price: "£13", tags: ["Gluten free"],
      },
      {
        name: "S14 Tom Nuong",
        description: "Grilled King Prawns Dipping with House Special Sauce", price: "£13", tags: ["Gluten free"],
      },
      {
        name: "Prawn Cracker",
        description: "Served with Sweet Chilli Sauce", price: "£3", tags: ["Gluten free", "Mild"],
      },
      {
        name: "Chim Cut Nuong",
        description: "Grilled Quail Marinated with Lemongrass Served with Pho Ta Special Sauce", price: "£13.50", tags: ["Gluten free"],
      },
      {
        name: "Ga Sa Te",
        description: "Sliced Fried Chicken with Sate Sauce with Peanuts on Top", price: "£10",
      }
    ],
  },
  {
    id: "daily-vietnamese-nom-salad",
    name: "VIETNAMESE NOM SALAD",
    items: [
      {
        name: "Nom Du Du",
        description: "Papaya Salad Served with Homemade Dressing (Dried Beef £14 · King Prawns £14.50 · Chicken £13.50)", price: "£13.5 – £14.5",
      },
      {
        name: "Nom Xoai",
        description: "Mango Salad Served with Homemade Dressing (Beef £14 · King Prawns £14.50 · Chicken £13.50)", price: "£13.5 – £14.5",
      },
      {
        name: "Bo Tai Chanh",
        description: "Rare Beef Salad Served with Lime Juice", price: "£15",
      },
      {
        name: "Nom Ga",
        description: "Chicken Salad Served with Homemade Dressing", price: "£13.50",
      },
      {
        name: "Nom Tom",
        description: "King Prawns Salad Served with Homemade Dressing", price: "£14.50",
      }
    ],
  },
  {
    id: "daily-chef-s-special-menu",
    name: "CHEF’s SPECIAL MENU",
    items: [
      {
        name: "Ca Rang Muoi",
        description: "Fried Seabass Fish with Chilli Lemongrass", price: "£22",
      },
      {
        name: "Cha Ca Ha Noi",
        description: "Monk Fish Served with Dill, Onion, Pickle, Vermicelli, and House Fish Sauce", price: "£21", tags: ["Gluten free"],
      },
      {
        name: "Ca Xoai",
        description: "Deep Fried Seabass Served with Mango Fish Sauce and Steam Rice On The Side", price: "£22", tags: ["Gluten free"],
      },
      {
        name: "Bo Luc Lac",
        description: "Cube Beef Marinated with House Special Sauce and Seasame on Top", price: "£16", tags: ["Gluten free"],
      },
      {
        name: "★ Hanh Gung Sizzling",
        description: "Onion and Ginger Sizzling (Beef £17 · Chicken £17 · King Prawns £17.50 · Duck £17.50 · Tofu (V) £16)", price: "£16 – £17.5", tags: ["Gluten free", "Mild"], featured: true,
      },
      {
        name: "★ Black Bean Sauce Sizzling",
        description: "Sizzling Stir-Fried with Pho Ta Black Bean Sauce Served with Rice (Chicken £17 · Beef £17 · King Prawn £17.50 · Tofu £16)", price: "£16 – £17.5", tags: ["Gluten free"], featured: true,
      },
      {
        name: "Lan Sizzling",
        description: "Stir Fried Duck with Galangal, Shrimp Paste and Chilli Lemongrass (Chicken £17 · Beef £17 · King Prawn £17.50 · Duck £17.50 · Tofu £16)", price: "£16 – £17.5", tags: ["Gluten free", "Mild"],
      },
      {
        name: "Com Thit Kho",
        description: "Slow-cooked Braised Pork Belly with Coconut Water", price: "£13", tags: ["Gluten free"],
      },
      {
        name: "Dau Phu Xao Ca Tim Tofu",
        description: "Stir Fried Tofu & Aubergine", price: "£17", tags: ["Gluten free", "Vegetarian", "Vegan"],
      },
      {
        name: "Rau Xao Thap Cam",
        description: "Stir-fired Mixed Vegetables served with Rice (Chicken £16 · Beef £16 · King Prawn £17)", price: "£16 – £17",
      }
    ],
  },
  {
    id: "daily-main-courses-pho-soup-style",
    name: "MAIN COURSES PHO SOUP STYLE",
    items: [
      {
        name: "★ M01 Pho Bo Tai",
        description: "Rare Steak Beef Noodle Soup", price: "£15", tags: ["Gluten free"], featured: true,
      },
      {
        name: "M02 Pho Bo Chin",
        description: "Well Cooked Beef Noodle Soup", price: "£14", tags: ["Gluten free"],
      },
      {
        name: "M03 Pho Bo Vien",
        description: "Beef Ball Noodle Soup", price: "£14", tags: ["Gluten free"],
      },
      {
        name: "M04 Pho Tai Lan",
        description: "Stir Fried Beef Noodle Soup", price: "£15.50", tags: ["Gluten free"],
      },
      {
        name: "M05 Pho Bo Sot Vang",
        description: "Stewed Beef in Red Wine Noodle Soup", price: "£16.50", tags: ["Gluten free"],
      },
      {
        name: "★ M06 Combo Pho",
        description: "Prawn, Chicken, and Stir Fried Beef Noodle Soup", price: "£16.50", tags: ["Gluten free"], featured: true,
      },
      {
        name: "M07 Pho Ga",
        description: "Chicken Noodle Soup", price: "£14", tags: ["Gluten free"],
      },
      {
        name: "M08 Pho Tom",
        description: "King Prawns Noodle Soup", price: "£16", tags: ["Gluten free"],
      },
      {
        name: "★ M09 Special Pho Ta Mixed Beef",
        description: "Meat Balls, Rare Steak, and Well Cooked Beef Noodle Soup", price: "£16.50", tags: ["Gluten free"], featured: true,
      },
      {
        name: "★ M10 Bun Hue",
        description: "Spicy Vermicelli Soup (Beef £15.50 · Chicken £15 · King Prawn £17.50 · Duck £17.50)", price: "£15 – £17.5", tags: ["Gluten free", "Mild"], featured: true,
      },
      {
        name: "★ M11 Bun Ca",
        description: "Monk Fish Vermicelli Soup", price: "£17.50", tags: ["Gluten free"], featured: true,
      },
      {
        name: "M12 Pho Vit",
        description: "Crispy Roasted Duck Noodle Soup", price: "£17.50", tags: ["Gluten free"],
      }
    ],
  },
  {
    id: "daily-wok-and-grill",
    name: "WOK AND GRILL",
    items: [
      {
        name: "M13A Pho Xao",
        description: "Wok Stir Fried Flat Rice Noodle with Asian Vegetables (Chicken £14 · Beef £14.50 · King Prawn £14.50)", price: "£14 – £14.5", tags: ["Gluten free"],
      },
      {
        name: "M13B Mi Xao",
        description: "Wok Stir Fried Egg Noodle with Asian Vegetables (Chicken £14 · Beef £14.50 · King Prawn £16 · Duck £17.50)", price: "£14 – £17.5",
      },
      {
        name: "M14 Bun",
        description: "Vermicelli Mix with Wok Stir Fried Vegetables Served with Nuoc Cham Sauce (Chicken £14 · Pork Spring Rolls £14 · Beef £14.50 · King Prawn £16)", price: "£14 – £16", tags: ["Gluten free"],
      },
      {
        name: "M15 Bun Ga Nuong",
        description: "Grilled Chicken Thighs Vermicelli", price: "£16", tags: ["Gluten free"],
      },
      {
        name: "M16 Bun Cha",
        description: "Vermicelli with Grilled Mix Pork Belly & Spring Roll", price: "£16.50", tags: ["Gluten free"],
      },
      {
        name: "Bun Vit Nuong",
        description: "Vermicelli with Grilled Duck Served with Vegetables & Nuoc Cham Sauce", price: "£17.50", tags: ["Gluten free"],
      },
      {
        name: "Bun Bo La Lot",
        description: "Beef Wrapped in Betel Leaves Vermicelli Served with Vegetables & Nuoc Cham Sauce", price: "£17.50",
      },
      {
        name: "Bun Thit Nuong",
        description: "Grilled Pork Vermicelli Served with Vegetables & Nuoc Cham Sauce", price: "£15",
      },
      {
        name: "Bun Thit Nuong Cha Gio",
        description: "Grilled Pork, Pork Spring Roll Vermicelli Served with Vegetables & Nuoc Cham Sauce", price: "£17",
      }
    ],
  },
  {
    id: "daily-vietnamese-broken-rice",
    name: "VIETNAMESE BROKEN RICE",
    items: [
      {
        name: "★ M17 Com Ga Nuong",
        description: "Broken Rice with Grilled Chicken Thighs Served with Vegetables & Nuoc Cham Sauce", price: "£16", tags: ["Gluten free"], featured: true,
      },
      {
        name: "M18 Com Sot Vang",
        description: "Broken Rice with Vietnamese Red Wine Beef Stew", price: "£16", tags: ["Gluten free"],
      },
      {
        name: "★ M19 Com Chien",
        description: "Vietnamese Wok Fried Rice Served with Vegetables & Soya Sauce (Chicken £14 · Beef £14.50 · King Prawn £16 · Duck £17.50 · Special Fried Rice (Chicken, Beef and Ki £17.50)", price: "£14 – £17.5", tags: ["Gluten free"], featured: true,
      },
      {
        name: "M20 Com Ca Ri",
        description: "Broken Rice with Vietnamese Curry & Vegetables (Chicken £14 · Beef £14.50 · King Prawns £16 · Duck £17.50)", price: "£14 – £17.5", tags: ["Gluten free"],
      },
      {
        name: "M21 Com Suon Nuong",
        description: "Vietnamese Grilled Pork Chop & Egg Cake Served with Nuoc Cham Sauce", price: "£15", tags: ["Gluten free"],
      },
      {
        name: "Com Sa Ot",
        description: "Vietnamese Wok Lemongrass Chilli Rice (Chicken £12.50 · Beef £13.50 · King Prawns £14.50)", price: "£12.5 – £14.5", tags: ["Gluten free", "Mild"],
      },
      {
        name: "★ Com Chien Pho Ta",
        description: "Pho Ta Spicy Fried Rice with Vegetables & Soya Sauce (Chicken £15 · Beef £15.50 · King Prawn £17 · Duck £17.50 · Pho ta Special (Chicken & Prawn) £17.50)", price: "£15 – £17.5", tags: ["Mild"], featured: true,
      },
      {
        name: "M21B Com Ga Satay",
        description: "Broken Rice with Chicken Satay Served with Vegetables & Satay Sauce", price: "£16",
      },
      {
        name: "Com Chien Dua Bo",
        description: "Wok Fried Rice with Beef and Vietnamese Pickle", price: "£17.50",
      },
      {
        name: "Com Vit Nuong",
        description: "Broken Rice with Grilled Duck Served with Vegetables", price: "£17.50",
      },
      {
        name: "Com Thit Kho",
        description: "Slow-cooked Braised Pork Belly with Coconut Water", price: "£15",
      }
    ],
  },
  {
    id: "daily-vegeterian-menu",
    name: "VEGETERIAN MENU",
    items: [
      {
        name: "V01 Nem Rau",
        description: "Crispy Vegetable Spring Rolls served with Nuoc Cham sauce", price: "£7", tags: ["Gluten free", "Vegetarian", "Vegan"],
      },
      {
        name: "V02 Goi Cuon Rau",
        description: "Veggie Summer Roll Served with Peanut Sauce", price: "£7", tags: ["Gluten free", "Vegetarian", "Vegan"],
      },
      {
        name: "V03 Nom Xoai Tofu",
        description: "Mango Tofu Salad Served with Homemade Dressing", price: "£13.50", tags: ["Gluten free", "Vegetarian", "Vegan"],
      },
      {
        name: "V04 Nom Du Du Tofu",
        description: "Papaya Tofu Salad Served with Homemade Dressing", price: "£13.50", tags: ["Gluten free", "Vegetarian", "Vegan"],
      },
      {
        name: "V05 Banh Xeo Chay",
        description: "Vietnamese Crispy Vegetarian Crepe Served with Soya Sauce", price: "£14", tags: ["Gluten free", "Vegetarian", "Vegan"],
      },
      {
        name: "V06 Pho Chay",
        description: "Mushrooms and Vegetable Noodle Soup", price: "£14", tags: ["Gluten free", "Vegetarian", "Vegan"],
      },
      {
        name: "V07 Pho Xao Chay",
        description: "Work Stir Fried Noodles with Asian Vegetables & Tofu", price: "£14", tags: ["Gluten free", "Vegetarian", "Vegan"],
      },
      {
        name: "V08 Bun Nem Rau",
        description: "Wok Stir Fried Vermicelli & Vegetable Spring Rolls", price: "£14", tags: ["Gluten free", "Vegetarian", "Vegan"],
      },
      {
        name: "V09 Bun Dau Phu",
        description: "Work Stir Fried Vermicelli with Tofu & Beansprouts", price: "£14", tags: ["Gluten free", "Vegetarian", "Vegan"],
      },
      {
        name: "V10 Com Ca Ri Dau",
        description: "Broken Rice Served with Vietnamese Vegetables & Tofu Curry", price: "£14", tags: ["Gluten free", "Vegetarian", "Vegan"],
      },
      {
        name: "V11 Bun Ca Ri Tofu",
        description: "Vermicelli Served with Vietnamese Vegetables & Tofu Curry", price: "£14", tags: ["Gluten free", "Vegetarian", "Vegan"],
      },
      {
        name: "V12 Com Chien Chay",
        description: "Vegetarian Wok Fried Rice Served with Vegetables & Tofu", price: "£14", tags: ["Gluten free", "Vegetarian"],
      },
      {
        name: "V13 Ca Tim Rang Muoi",
        description: "Salt and Pepper Aubergine Served with Sweet Chilli Sauce", price: "£10", tags: ["Gluten free", "Vegetarian", "Vegan"],
      },
      {
        name: "V14 Dau Phu Rang Muoi",
        description: "Salt and Pepper Tofu Served with Sweet Chilli Sauce", price: "£10", tags: ["Gluten free", "Vegetarian", "Vegan"],
      }
    ],
  },
  {
    id: "daily-kid-s-corner",
    name: "KID’s CORNER",
    items: [
      {
        name: "K01 Kid Curry with Rice",
        description: "Vegetables & Tofu £7.50 · Chicken £7.50 · King Prawns £8 · Beef £8", price: "£7.5 – £8", tags: ["Gluten free"],
      },
      {
        name: "K02 Kid Egg Fried Rice",
        description: "Vegetables & Tofu £7.50 · Chicken £7.50 · King Prawns £8", price: "£7.5 – £8", tags: ["Gluten free"],
      },
      {
        name: "Kid Stir Fried Noodle",
        description: "Vegetables & Tofu £7.50 · Chicken £7.50 · King Prawns £8 · Beef £8", price: "£7.5 – £8", tags: ["Gluten free"],
      },
      {
        name: "Kid Noodle Soup",
        description: "Chicken £7.50 · Beef £8 · King Prawn £8.50 · Vegetables & Tofu £7.50", price: "£7.5 – £8.5", tags: ["Gluten free"],
      }
    ],
  }
];

export const lunchMenuNote = "Mon – Fri, 11:45am – 4:00pm";

export const lunchMenuCategories: MenuCategory[] = [
  {
    id: "lunch-noodle-soup",
    name: "Noodle Soup",
    items: [
      {
        name: "Pho Bo Chin",
        description: "Well cooked beef noodle soup", price: "£12", tags: ["Gluten free"],
      },
      {
        name: "Pho Ga",
        description: "Chicken noodle soup", price: "£12", tags: ["Gluten free"],
      },
      {
        name: "Pho Chay",
        description: "Tofu & mushroom noodle soup", price: "£12", tags: ["Gluten free", "Vegetarian", "Vegan"],
      }
    ],
  },
  {
    id: "lunch-wok-grill",
    name: "Wok & Grill",
    items: [
      {
        name: "Pho Xao",
        description: "Wok stir fried flat rice noodles with Asian vegetables and bean sprouts (Chicken / Beef / Vegetables & Tofu)", price: "£12", tags: ["Gluten free"],
      },
      {
        name: "Mi Xao",
        description: "Wok stir fried egg noodles with Asian vegetables and bean sprouts (Chicken / Beef / Vegetables & Tofu)", price: "£12",
      },
      {
        name: "Bun",
        description: "Vermicelli mix with stir fried vegetables served with nuoc cham sauce (Chicken / Vegetables and Tofu)", price: "£12", tags: ["Gluten free"],
      }
    ],
  },
  {
    id: "lunch-broken-rice",
    name: "Broken Rice",
    items: [
      {
        name: "Com Ca Ri",
        description: "Broken rice curry (Chicken / Beef / Vegetables & Tofu)", price: "£12", tags: ["Gluten free"],
      },
      {
        name: "Com Sa Ot",
        description: "Stir-fried marinated with chilli lemongrass (Chicken / Beef / Vegetables & Tofu)", price: "£12",
      }
    ],
  }
];

/** @deprecated use dailyMenuCategories */
export const menuCategories = dailyMenuCategories;

export const featuredDishes = [
  { name: "Special Pho Ta Mixed Beef", description: "Meat balls, rare steak, and well cooked beef noodle soup — our signature pho.", image: siteImages.dishes.specialPho, featured: true },
  { name: "Bun Cha", description: "Vermicelli with grilled mix pork belly & spring roll — a Hanoi classic.", image: siteImages.dishes.bunCha, featured: true },
  { name: "Pho Chay", description: "Mushrooms and vegetable noodle soup — refined, fragrant, and vegetarian.", image: siteImages.dishes.vegetablePho, featured: true },
];
