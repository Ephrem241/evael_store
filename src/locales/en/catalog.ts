// Shop, search, category pages, filters, sorting, pagination, product pages.
export const catalog = {
  shopTitle: "Shop",
  shopSubtitle: "Browse our full collection.",
  categoriesTitle: "Categories",
  categoriesSubtitle: "Browse everything by category.",
  searchTitle: "Search",
  searchEmptyTitle: "Search our catalog",
  searchEmptyText: "Type a product name above to get started.",
  searchResultsFor: "Search results for \"{query}\"",
  // A search with no match at all; {query} is what was typed.
  searchNoMatchTitle: "Couldn't find what you're looking for?",
  searchBrowseCategories: "Browse by category",
  searchNoMatchText: "Nothing matches \u201c{query}\u201d. Check the spelling, try a shorter word, or browse below.",
  categoryNotFound: "Category not found.",
  categoryNotFoundText: "This category may have been removed or renamed.",
  productNotFound: "Product not found.",
  productNotFoundText: "This product may have been removed or is no longer available.",
  productCount: { one: "{count} product", other: "{count} products" },
  filters: {
    title: "Filters",
    open: "Filter",
    clearAll: "Clear all",
    apply: "Apply",
    category: "Category",
    allCategories: "All categories",
    price: "Price",
    anyPrice: "Any price",
    availability: "Availability",
    inStockOnly: "In stock only",
    rating: "Rating",
    anyRating: "Any rating",
    ratingUp: "{min}★ & up",
    discount: "Discount",
    onSale: "On sale",
    priceUnder: "Under {amount}",
    priceRange: "{min} – {max}",
    priceOver: "{amount} & above",
    // The chips of the filters in force; {label} is what the chip says.
    active: "Active filters",
    remove: "Remove filter: {label}",
    // Read after "Filter" on the phone's filter button, whose badge shows the number.
    activeCount: { one: "{count} filter applied", other: "{count} filters applied" },
  },
  sort: {
    label: "Sort products",
    recommended: "Recommended",
    newest: "Newest",
    "price-asc": "Price: Low to High",
    "price-desc": "Price: High to Low",
    popular: "Most Popular",
  },
  pageLabel: "Page {page}",
  results: "Showing {start}–{end} of {total} results",
  noResults: "No results",
  emptyTitle: "No products found.",
  emptyText: "Try another search or explore our categories.",
  // /deals: every discounted product, grouped.
  dealsPage: {
    featured: "Featured Offers",
    limited: "Limited Stock",
    onSale: "On Sale Now",
    browseAll: "Filter & sort deals",
    emptyTitle: "No deals right now.",
    emptyText: "New deals are added regularly. Check back soon.",
  },
  pagination: {
    label: "Pagination",
    previous: "Previous page",
    next: "Next page",
    // Phones and tablets: the next page is added below the products instead.
    loadMore: "Load more",
    loading: "Loading…",
    loadFailed: "More products couldn't be loaded. Check your connection and try again.",
  },
}

export const product = {
  stock: {
    out: "Out of stock",
    soldOut: "Sold out",
    low: "Only {count} left in stock",
    in: "In stock",
  },
  addToCart: "Add to cart",
  buyNow: "Buy now",
  // Shown instead of the buy buttons to an admin browsing the shop.
  adminNotice: "You're signed in as an admin, so ordering is turned off.",
  editProduct: "Edit product",
  addedToCart: "Added to your cart.",
  viewCart: "View cart",
  rated: "Rated {value} out of 5",
  favorites: {
    add: "Add to favorites",
    remove: "Remove from favorites",
    added: "Added to favorites.",
    removed: "Removed from favorites.",
  },
  quantity: {
    decrease: "Decrease quantity",
    increase: "Increase quantity",
  },
  gallery: {
    enlarge: "Enlarge image {index} of {total} for {name}",
    view: "{name} — view {index}",
    thumb: "View {index}",
    // The small "2/5" over the photos on phones (which photo is showing, of how many).
    counter: "{index}/{total}",
  },
  // The product's description, a section of its own on phones (it can be folded away).
  description: {
    title: "Description",
  },
  details: {
    title: "Details",
    sku: "SKU",
    category: "Category",
    availability: "Availability",
  },
  delivery: {
    title: "Delivery",
    fees: "Delivery fees are calculated at checkout based on your delivery address.",
    dispatch: "Most orders are prepared and dispatched within a few business days.",
  },
  reviews: {
    title: "Reviews",
    empty: "No reviews yet.",
    emptyText: "This product doesn't have any customer reviews yet.",
  },
  // The product card's Quick view button and dialog. {name} is the product's name.
  quickView: {
    label: "Quick view",
    open: "Quick view: {name}",
    details: "View full details",
    unavailable: "This product is no longer available.",
  },
  share: {
    label: "Share",
    copied: "Link copied to clipboard.",
    failed: "The link couldn't be copied.",
  },
  // How a product is paid for: only what checkout really takes.
  payment: {
    title: "Payment",
    cod: "Cash on Delivery: pay in cash when your order arrives.",
    more: "Ethiopian bank and mobile-money payments are coming soon.",
  },
  // Below the product: more from its category, and what this shopper looked at before.
  related: "More from {category}",
  recentlyViewed: "Recently viewed",
}
