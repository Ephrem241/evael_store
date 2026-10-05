// Discounts are stored as two prices: `price` (what the customer pays) and
// `compare_at_price` (the original, shown struck through). The admin thinks in
// percentages, so these convert between the two.

export const MAX_DISCOUNT_PERCENT = 90

/** Whole-number percentage off, or 0 when the product isn't discounted. */
export function discountPercent(price: number, compareAtPrice: number | null | undefined): number {
  if (compareAtPrice == null || !(compareAtPrice > price) || compareAtPrice <= 0) return 0
  return Math.round((1 - price / compareAtPrice) * 100)
}

/**
 * The prices for `percent` off the product's original price (its compare-at
 * price when discounted, otherwise its price). 0 removes the discount.
 * Prices are rounded to whole birr.
 */
export function applyDiscount(
  current: { price: number; compare_at_price: number | null | undefined },
  percent: number
): { price: number; compare_at_price: number | null } {
  const original =
    current.compare_at_price != null && current.compare_at_price > current.price ? current.compare_at_price : current.price
  const p = Math.round(percent)
  if (!Number.isFinite(p) || p <= 0) return { price: original, compare_at_price: null }
  const clamped = Math.min(p, MAX_DISCOUNT_PERCENT)
  const price = Math.max(1, Math.round(original * (1 - clamped / 100)))
  return price < original ? { price, compare_at_price: original } : { price: original, compare_at_price: null }
}
