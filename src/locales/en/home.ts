export const home = {
  // The hero's headline, text and buttons are the admin's (homepage_sections.hero);
  // these are the fixed parts around them.
  hero: {
    // Over the headline on desktop. Says what the shop is, without a
    // superlative ("favourite", "best") it couldn't back up.
    eyebrow: "Your online marketplace in Ethiopia",
    // The handwritten note over the photo (decorative, desktop only).
    flourish: "Shop Local, Support Ethiopia",
    // The dots under the text and the button beside them. {index}/{total} are numbers.
    showPhoto: "Show photo {index} of {total}",
    pause: "Pause the photos",
    play: "Play the photos",
  },
  categoriesTitle: "Shop by Category",
  viewAll: "View All",
  viewAllCategories: "View All Categories",
  // Under each category card: how many products it really holds.
  categoryProducts: { one: "{count} product", other: "{count} products" },
  // The Deals tile at the end of the category row (its title is nav.deals).
  dealsTile: { subtitle: "Save More" },
  // The admin's "featured" products.
  featuredTitle: "Trending Products",
  newArrivalsTitle: "New Arrivals",
  // The admin's "popular" products (search results with no match). Not "Best
  // Sellers": no sales ranking exists.
  popularTitle: "Popular Picks",
  carousel: {
    previous: "Previous products",
    next: "Next products",
    // The scrollable row of products; {title} is the section's heading.
    rail: "{title}, scrollable list",
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
    // The Flash Deals countdown's accessible name; {time} is e.g. "5 Hours 12 Minutes".
    timeLeftValue: "Time left on this offer: {time}",
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
  // Also introduces /deals and /shop?sale=1.
  flashTitle: "Flash Deals",
  flashSubtitle: "Limited-time prices. Don't miss out.",
  flashViewAll: "View All Deals",
  // The strip under the hero. Worded without promises the shop can't keep
  // (no "guaranteed", no delivery times).
  trustLabel: "Shopping with us",
  trust: {
    fastTitle: "Fast Delivery",
    fastText: "Across Ethiopia",
    secureTitle: "Secure Shopping",
    secureText: "Your data is safe",
    codTitle: "Cash on Delivery",
    codText: "Pay when you receive",
    localTitle: "Made for Ethiopia",
    localText: "Local support & service",
  },
  // The burgundy banner. {percent} is the biggest discount really on sale.
  savings: {
    title: "Big savings. Every day.",
    upTo: "Up to {percent}% OFF",
    text: "on selected products",
    cta: "Shop Deals",
  },
  // "Built for Ethiopian Shoppers": what the shop really offers today.
  local: {
    title: "Built for Ethiopian Shoppers",
    text: "Your trusted local marketplace, designed for your needs.",
    deliveryTitle: "Nationwide delivery",
    deliveryText: "Across Ethiopia",
    codTitle: "Cash on Delivery",
    codText: "Pay when you receive",
    languageTitle: "Amharic & English",
    languageText: "Shop in your language",
    supportTitle: "Local customer support",
    supportText: "Here to help",
    easyTitle: "Easy shopping",
    easyText: "Simple & secure",
  },
  // "Why Shop With Evael?" {brand} is the store's short name.
  why: {
    title: "Why Shop With {brand}?",
    secureTitle: "Secure Shopping",
    secureText: "Your data is safe with us.",
    deliveryTitle: "Fast Delivery",
    deliveryText: "Delivered across Ethiopia.",
    qualityTitle: "Quality Products",
    qualityText: "Carefully selected for you.",
    supportTitle: "Customer Support",
    supportText: "We're here when you need help.",
  },
  // The "Pay your way" strip. Only Cash on Delivery works today; the banks and
  // wallets are shown as coming soon until checkout can actually take them.
  payments: {
    title: "Pay Your Way",
    text: "Pay in cash when your order arrives. Ethiopian bank and mobile-money payments are coming soon.",
    cod: "Cash on Delivery",
    available: "Available",
    comingSoon: "Coming Soon",
    listLabel: "Payment methods",
    weAccept: "We accept: {methods}",
  },
  newsletter: {
    // The home page's newsletter card.
    cardTitle: "Get the best deals first.",
    cardText: "Subscribe for new arrivals, exclusive offers and more.",
    flourish: "More Great Deals",
    emailPlaceholder: "Enter your email",
    emailLabel: "Email address",
    subscribe: "Subscribe",
    success: "You're subscribed! Thanks for joining us.",
  },
}
