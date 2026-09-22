export interface FaqItem {
  question: string;
  answer: string;
}

export const faqCategories: { title: string; items: FaqItem[] }[] = [
  {
    title: "Reservations",
    items: [
      {
        question: "Do I need a reservation?",
        answer:
          "We welcome walk-ins when tables are available, but reserving ahead is recommended — especially on weekends and for groups of four or more. You can book online in a few minutes.",
      },
      {
        question: "How far in advance can I book?",
        answer:
          "Online reservations are available up to 30 days ahead. For larger parties or special occasions, please call us on 020 7625 6889 and our team will be happy to help.",
      },
      {
        question: "How soon can I book for today?",
        answer:
          "Online bookings must be made at least 3 hours before your preferred time. For same-day tables sooner than that, please call us on 020 7625 6889 — we will help if we can.",
      },
      {
        question: "Can I change or cancel my booking?",
        answer:
          "Yes. Call the restaurant directly and quote your booking reference. We ask for at least two hours’ notice for changes or cancellations when possible.",
      },
      {
        question: "Will I receive a confirmation?",
        answer:
          "Yes. After booking you will see a confirmation on screen with your reference number — please save or print it. We also send a confirmation email to the address you provide. Check your inbox (and spam folder) if it does not arrive within a few minutes.",
      },
    ],
  },
  {
    title: "Dining with us",
    items: [
      {
        question: "What are your opening hours?",
        answer:
          "We are open Monday to Sunday, 11:30am – 9:30pm. Lunch specials are available on weekdays — see the menu for details.",
      },
      {
        question: "Do you cater for dietary requirements?",
        answer:
          "Many dishes can be adapted. Please tell us about allergies or dietary needs when you book and again when you arrive. See our Food Hygiene & Allergies page for full allergen guidance.",
      },
      {
        question: "Is there a dress code?",
        answer:
          "Smart casual. We want you to feel comfortable — whether joining us after work or celebrating a special occasion.",
      },
      {
        question: "Do you have high chairs or space for pushchairs?",
        answer:
          "Yes, subject to availability. Mention this in your special requests when booking and we will do our best to accommodate your party.",
      },
    ],
  },
  {
    title: "Menu & visit",
    items: [
      {
        question: "What is on the menu?",
        answer:
          "We serve a full daily menu plus weekday lunch specials — pho, wok & grill, starters, and more. Browse the menu page or ask our menu helper about any dish.",
      },
      {
        question: "Do you offer takeaway or delivery?",
        answer:
          "Please call us on 020 7625 6889 for takeaway availability. We focus on dine-in service to ensure every dish is served at its best.",
      },
      {
        question: "Where can I park?",
        answer:
          "Street parking is available near the restaurant. Finchley Road is well served by public transport — see our Visit page for the address and map.",
      },
    ],
  },
];
