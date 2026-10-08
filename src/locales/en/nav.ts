// Header, navigation, search, footer, language switcher, page metadata.
export const nav = {
  home: "Home",
  categories: "Categories",
  deals: "Deals",
  orders: "Orders",
  profile: "Profile",
  favorites: "Favorites",
  account: "Account",
  signIn: "Sign in",
  cart: "Cart",
  cartCount: { one: "Cart, {count} item", other: "Cart, {count} items" },
  primary: "Primary navigation",
  primaryMobile: "Primary mobile navigation",
  breadcrumb: "Breadcrumb",
  language: "Language",
  wishlist: "Wishlist",
  back: "Back",
  // The phone header's menu (the ☰ button and the panel it opens).
  menu: "Menu",
  openMenu: "Open menu",
  // Under the logo in the headers and the footer.
  tagline: "Modern Shopping. Made for Ethiopia.",
  shopAll: "Shop All",
  // The first link on every page: lets keyboard users jump past the header.
  skipToContent: "Skip to main content",
  // Accessible name of the thin bar above the header.
  announcementsLabel: "Store announcements",
  // The thin bar above the header. {amount} is an already-formatted price.
  announcement: {
    freeDelivery: "Free delivery on orders over {amount}",
    // No delivery times: none are configured, so none are promised.
    delivery: "Shop now — we deliver across Ethiopia.",
  },
}

export const search = {
  placeholder: "Search for products, brands and more…",
  label: "Search products",
  submit: "Search",
  recent: "Recent searches",
  categories: "Categories",
  products: "Products",
  clearRecent: "Clear",
  // The last row of the suggestions: runs the full search. {query} is what was typed.
  seeAll: "See all results for “{query}”",
  // Read out when suggestions appear under the field (they are otherwise silent).
  suggestionCount: {
    one: "{count} suggestion available. Press the down arrow to browse.",
    other: "{count} suggestions available. Press the down arrow to browse.",
  },
}

export const footer = {
  shop: "Shop",
  customerService: "Customer Care",
  contact: "Contact Us",
  delivery: "Delivery Information",
  returns: "Returns",
  faq: "FAQ",
  company: "Company",
  about: "About Us",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
  language: "Language",
  rights: "© {year} {brand}. All rights reserved.",
  // The last footer column: the newsletter sign-up.
  subscribe: "Subscribe",
  subscribeText: "Get the latest updates and exclusive offers.",
  madeFor: "Made for Ethiopia",
}

export const meta = {
  // The site-wide (home page) title and description. {brand} is the store name.
  title: "{brand} — Ethiopian goods, delivered with care",
  description:
    "Discover everyday products, special offers and carefully selected essentials, delivered across Ethiopia.",
}
