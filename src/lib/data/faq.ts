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
          "Online reservations are available up to 30 days ahead. For larger parties or special occasions, please call your preferred branch and our team will be happy to help.",
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
          "Both Kentish Town and Finchley Road are open Monday to Sunday, 11:30am – 9:30pm. Lunch specials are available on weekdays — see the menu for details.",
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
    title: "Menu & locations",
    items: [
      {
        question: "Are the menus the same at both branches?",
        answer:
          "Each location has its own daily and lunch menus with the same Pho Ta quality and style. Browse the menu page and select Kentish Town or Finchley Road to see what’s served at each venue.",
      },
      {
        question: "Do you offer takeaway or delivery?",
        answer:
          "Please contact your local branch by phone for takeaway availability. We focus on dine-in service to ensure every dish is served at its best.",
      },
      {
        question: "Where can I park?",
        answer:
          "Street parking is available near both restaurants. Kentish Town and Finchley Road are well served by public transport — check our Locations page for addresses and maps.",
      },
    ],
  },
];
