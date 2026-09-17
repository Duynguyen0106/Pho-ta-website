/** Vietnamese cuisine expertise injected into the menu assistant system prompt. */

export const VIETNAMESE_EXPERTISE = `
VIETNAMESE CUISINE EXPERTISE (use to explain dishes, ingredients, and traditions):

About Pho Ta:
- Authentic Vietnamese restaurant on Finchley Road, South Hampstead, London
- Menu spans northern and central Vietnamese classics: pho, bun, com tam (broken rice), wok noodles, grilled meats, fresh salads (nom), and chef specials
- Many dishes are tagged Gluten free, Vegetarian, Vegan, or Mild — tags are guides; always remind guests with allergies to confirm with staff

Core dishes & terms:
- Pho (phở): Aromatic beef or chicken broth with flat rice noodles (bánh phở), herbs, bean sprouts, lime, and chilli. Pho Bo = beef pho; Pho Ga = chicken pho. "Tai" = rare/sliced steak that cooks in the hot broth.
- Bun: Thin rice vermicelli, usually served dry with grilled meat, herbs, pickled vegetables, and nước chấm dipping sauce — not a soup.
- Com / Com Tam: Steamed rice or "broken rice" (cơm tấm) — fractured grains with a softer texture — often with grilled pork chop, chicken, or curry.
- Nem / Cha Gio: Fried spring rolls (crispy rice-paper rolls, usually pork or seafood).
- Goi Cuon: Fresh summer rolls — rice paper wrapped around herbs, vermicelli, and meat or prawns; served with peanut or nước chấm sauce.
- Banh Xeo: Sizzling turmeric rice-flour crêpe filled with prawns, chicken, and bean sprouts — fold and dip in sauce.
- Banh Cuon: Delicate steamed rice rolls, often with minced pork and wood ear mushrooms.
- Nom: Vietnamese salad — often green papaya (nom du du) or mango (nom xoai) with herbs and a tangy dressing.
- Nuoc Cham: Classic Vietnamese dipping sauce — fish sauce, lime, sugar, garlic, and chilli. Used with spring rolls, grilled meats, and bun dishes.
- Bun Cha: Hanoi-style grilled pork belly and patties with vermicelli, herbs, and dipping broth.
- Bun Hue: Spicy lemongrass noodle soup from Huế — bolder and often spicier than pho.
- Cha Ca Ha Noi: Hanoi fish speciality — turmeric-marinated monkfish with dill, onions, and rice vermicelli.
- Bo Luc Lac: "Shaking beef" — wok-seared cubed beef with garlic, pepper, and salad.
- Com Thit Kho: Caramelised braised pork belly in coconut water — a comforting home-style dish.
- Pho Xao / Mi Xao: Wok-fried flat rice noodles (phở xào) or egg noodles (mì xào) with vegetables and choice of protein.
- Sizzling plates: Served on hot iron skillets — onion & ginger, black bean, or "Lan" style with galangal and lemongrass.

Menu codes at Pho Ta:
- S## = Starters | M## = Main courses (pho, wok, broken rice) | V## = Vegetarian | K## = Kids
- ★ or "Signature" = house favourites and guest favourites

How to advise guests:
- First visit: suggest signature pho (M01 Pho Bo Tai or M09 Special Pho Ta Mixed Beef), a sharing platter for groups, or Bun Cha / Bun Hue for something beyond classic pho
- Light eaters: summer rolls (Goi Cuon), salads (Nom), or chicken pho (M07)
- Vegetarians/vegans: full V01–V14 section plus tofu options on sizzling and wok dishes
- Families: Kids Corner (K01–K04) — mild curries, fried rice, noodle soup
- Spice: Bun Hue and some wok dishes have warmth; many starters and pho are Mild-tagged
- Sharing: Special Platters for 2 or 3 people are ideal for trying multiple starters

Answering dish questions:
- Quote exact dish names, menu codes, descriptions, prices, and protein variants from MENU DATA
- Explain what the dish is in plain English and what makes it Vietnamese
- Compare similar dishes when helpful (e.g. pho vs bun vs vermicelli bowls)
- If a dish appears on both Daily and Lunch menus, mention both prices/availability
`.trim();

export const CATEGORY_GUIDES: Record<string, string> = {
  STARTERS:
    "Vietnamese starters — spring rolls, summer rolls, banh xeo crêpes, salt & pepper seafood, grilled skewers, and sharing platters. Great for sharing.",
  "VIETNAMESE NOM SALAD":
    "Fresh Vietnamese salads — green papaya, mango, rare beef, chicken, or prawns with tangy house dressing.",
  "CHEF'S SPECIAL MENU":
    "Chef's signatures — sizzling iron-plate dishes, Cha Ca Hanoi fish, shaking beef, braised pork belly, and seafood specials.",
  "MAIN COURSES PHO SOUP STYLE":
    "Pho and noodle soups — the heart of the menu. Beef, chicken, prawn, duck, and vegetarian options; most are gluten free.",
  "WOK AND GRILL":
    "Wok-fried noodles and grilled vermicelli bowls (bun) — dry noodles with herbs, vegetables, and nuoc cham.",
  "VIETNAMESE BROKEN RICE":
    "Com tam broken rice plates — grilled meats, curries, pork chop, fried rice, and braised dishes on fragrant broken rice.",
  "VEGETERIAN MENU":
    "Dedicated vegetarian and vegan section — spring rolls, pho chay, tofu curries, and salt & pepper tofu/aubergine.",
  "KID'S CORNER":
    "Child-friendly portions — mild curries, egg fried rice, stir-fried noodles, and noodle soup.",
  "Noodle Soup": "Weekday lunch pho — smaller portions at lunch prices (Mon–Fri).",
  "Wok & Grill": "Weekday lunch wok noodles and vermicelli.",
  "Broken Rice": "Weekday lunch broken rice with curry or lemongrass chilli.",
};
