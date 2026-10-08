// Cart, checkout, delivery cities and the messages the database can send back.
export const cart = {
  title: "Your Cart",
  subtitle: "Review your items before checkout.",
  emptyTitle: "Your cart is empty.",
  emptyText: "Let's find something you'll love.",
  startShopping: "Start shopping",
  continueShopping: "Continue shopping",
  // "Save for later": the item moves from the cart to the wishlist.
  moveItemToWishlist: "Move {name} to your wishlist",
  movedToWishlist: "Moved to your wishlist.",
  viewWishlist: "View wishlist",
  unavailable: "This item is no longer available.",
  remove: "Remove",
  removeItem: "Remove {name} from cart",
  // The toast after a remove; Undo puts the item back. {name} is the product's name.
  removed: "{name} was removed from your cart.",
  undo: "Undo",
  // The trash button over the cart, and the question it asks first.
  clear: "Clear cart",
  clearTitle: "Clear your cart?",
  clearText: "Every item will be removed from your cart.",
  cleared: "Your cart is empty now.",
  // Under the checkout button: how an order can be paid.
  weAccept: "We Accept",
  summary: {
    title: "Order summary",
    subtotal: "Subtotal",
    // {count} is how many items (quantities added up).
    subtotalItems: { one: "Subtotal ({count} item)", other: "Subtotal ({count} items)" },
    saving: "You're saving",
    delivery: "Delivery fee",
    calculatedAtCheckout: "Calculated at checkout",
    total: "Total",
    deliveryAdded: "Delivery is added at checkout.",
    continue: "Proceed to Checkout",
    free: "Free",
    // {amount} is an already-formatted price. "Over" means strictly above it.
    freeDeliveryOffer: "Free delivery on orders over {amount}.",
    freeDeliveryUnlocked: "You've unlocked free delivery!",
    // {amount} is how much more the cart needs, already formatted.
    freeDeliveryAway: "You're {amount} away from free delivery.",
  },
  syncFailed: "Couldn't sync your cart. Your changes are saved on this device.",
}

export const checkout = {
  title: "Checkout",
  subtitle: "Review your delivery and payment details.",
  steps: { label: "Checkout steps", delivery: "Delivery", payment: "Payment", review: "Review" },
  delivery: {
    title: "Delivery information",
    fullName: "Full name",
    phone: "Phone",
    city: "City",
    selectCity: "Select a city",
    subCity: "Sub-city",
    woreda: "Woreda",
    address: "Address",
    notes: "Delivery notes",
  },
  payment: {
    title: "Payment method",
    codLabel: "Cash on Delivery",
    codDescription: "Pay in cash when your order arrives.",
    manualLabel: "Other payment methods",
    manualDescription: "Chapa, Telebirr, and other providers are coming soon.",
  },
  review: {
    title: "Order review",
    editCart: "Edit cart",
    // Under the Place order button. Only what is true: the connection is
    // encrypted, and payment happens in cash on delivery.
    trust: "Your details are sent securely. You pay in cash when your order arrives.",
    qty: "Qty {count}",
    insufficientStock: "Not enough stock for {names}. Update your cart to continue.",
    unavailable: "Some items in your cart are no longer available. Remove them from your cart to continue.",
    placing: "Placing order...",
    place: "Place order",
  },
  errors: {
    cartEmpty: "Your cart is empty.",
    unavailable: "Some items in your cart are no longer available. Please remove them and try again.",
    insufficientStock: "Not enough stock for: {names}. Please update the quantity in your cart and try again.",
    invalidPayment: "Select a valid payment method.",
    paymentFailed: "Payment could not be processed.",
    paymentUnavailable: "This payment method isn't available yet.",
  },
  validation: {
    fullName: "Enter your full name.",
    city: "Select a city.",
    subCity: "Enter your sub-city.",
    woreda: "Enter your woreda.",
    address: "Enter your street address.",
    notes: "Keep notes under 300 characters.",
    paymentMethod: "Select a payment method.",
  },
}

// Delivery cities are stored in orders and addresses by their English name
// (that is what the delivery_fees table is keyed on); these are only the
// names shown to people.
export const cities = {
  addisAbaba: "Addis Ababa",
  adama: "Adama",
  bahirDar: "Bahir Dar",
  hawassa: "Hawassa",
  direDawa: "Dire Dawa",
  mekelle: "Mekelle",
  gondar: "Gondar",
  jimma: "Jimma",
  other: "Other",
}

// The database's own exception messages (order placement, status changes)
// arrive in English; db-errors.ts maps each one to one of these.
export const errors = {
  signInRequired: "You must be signed in to place an order.",
  invalidQuantity: "Invalid quantity.",
  addressIncomplete: "Delivery address is incomplete.",
  deliveryUnavailable: "Delivery is not available for this address.",
  statusTerminal: "Cannot change the status of an order that is already \"{status}\".",
  sameStatus: "Order is already in this status.",
  statusBackwards: "An order can't go back from \"{from}\" to \"{to}\".",
  notAllowed: "You don't have permission to do that.",
  // Shown when a request never reached the shop (no connection, or the service is down).
  network: "We couldn't reach the shop. Check your internet connection and try again.",
}
