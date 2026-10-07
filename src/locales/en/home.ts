export const home = {
  hero: {
    imageAlt:
      "A smiling woman holding an orange Evael Store shopping bag, surrounded by a handbag, sneakers, a phone, headphones, beauty products, an air fryer, a smartwatch and a plant",
  },
  categoriesTitle: "Shop by Category",
  viewAll: "View All",
  // Under each category card: how many products it really holds.
  categoryProducts: { one: "{count} product", other: "{count} products" },
  // The Deals tile at the end of the category row (its title is nav.deals).
  dealsTile: { subtitle: "Save More" },
  // The admin's "featured" products.
  featuredTitle: "Trending Now",
  newArrivalsTitle: "New Arrivals",
  // The admin's "popular" products. Not "Best Sellers": no sales ranking exists.
  popularTitle: "Popular Picks",
  shopByNeed: {
    title: "What are you shopping for?",
    subtitle: "Jump straight to what you need today.",
    // {category} is the category's name.
    cta: "Shop {category}",
  },
  carousel: {
    previous: "Previous products",
    next: "Next products",
    // The scrollable row of products; {title} is the section's heading.
    rail: "{title}, scrollable list",
    // The phone-only carousel combining the hero, deals and lifestyle banners.
    highlights: "Homepage highlights, scrollable",
  },
  // The Special Deals headline, subtext and button come from the admin-edited
  // homepage copy (homepage_sections.promo); these are the fixed parts around it.
  deals: {
    imageAlt: "A warm kitchen with copper pans, woven pendant lamps and a wooden island",
    endsIn: "Deal ends in",
    limitedTime: "Limited time offer",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    timeLeft: "Time left on this offer",
    ended: "This offer has ended",
  },
  // The deal popup and its floating reopen button (deal-popup.tsx); the
  // popup's headline, text and button are the same admin copy as above.
  dealPopup: {
    notNow: "Not now",
    endedText: "New deals are added regularly. Check back soon.",
    // {percent} is the biggest discount currently on sale.
    badge: "{percent}% OFF",
    badgeLabel: "{percent}% OFF: show today's deal",
  },
  // Also introduces /shop?sale=1.
  flashTitle: "Flash Deals",
  flashSubtitle: "Limited-time prices on products you love.",
  trustTitle: "Why {brand}?",
  // The compact strip under the hero. Worded without promises the shop can't
  // keep (no "guaranteed", no delivery times).
  trustLabel: "Shopping with us",
  trust: {
    codTitle: "Cash on Delivery",
    codText: "Pay when your order arrives.",
    secureTitle: "Secure Shopping",
    secureText: "A safe and reliable shopping experience.",
    fastTitle: "Fast Delivery",
    fastText: "Convenient delivery for your orders.",
    supportTitle: "Customer Support",
    supportText: "Friendly support whenever you need help.",
  },
  // The "Why Evael" band: what the store is, not claims about it.
  why: {
    valueTitle: "Clear, fair prices",
    valueText: "Every price in birr, with discounts shown up front.",
    rangeTitle: "Everything in one place",
    rangeText: "Fashion, home, kitchen, beauty and electronics in one store.",
    localTitle: "Made for Ethiopia",
    localText: "Shop in English or Amharic, and pay in cash when your order arrives.",
  },
  lifestyle: {
    title: "Upgrade Your Everyday",
    text: "Discover products selected for modern Ethiopian lifestyles.",
    cta: "Explore Collection",
    imageAlt: "A bright open living space with plants, a wooden sideboard and a kitchen beyond",
  },
  // The "Pay your way" strip. Only Cash on Delivery works today; the banks and
  // wallets are shown as coming soon until checkout can actually take them.
  payments: {
    title: "Pay Your Way",
    text: "Pay in cash when your order arrives. Ethiopian bank and mobile-money payments are coming soon.",
    cod: "Cash on Delivery",
    available: "Available now",
    comingSoon: "Coming soon",
    listLabel: "Payment methods",
    weAccept: "We accept: {methods}",
  },
  newsletter: {
    title: "Stay Updated",
    text: "Get the latest products, deals and offers from {brand}.",
    emailPlaceholder: "Enter your email",
    emailLabel: "Email address",
    subscribe: "Subscribe",
    success: "You're subscribed! Thanks for joining us.",
  },
}
