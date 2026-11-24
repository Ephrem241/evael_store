// Sizes a product is sold in (clothes: S, M, L; shoes: 38, 39, ...), each with
// its own stock (the product_sizes table, migration 0029). A product with no
// sizes is sold as one item with products.stock, as before. Pure, so the cart,
// the checkout and the admin form share it and it can be unit-tested.

export interface ProductSize {
  label: string
  stock: number
}

export const MAX_SIZE_LABEL_LENGTH = 20
export const MAX_SIZES = 30

// Quick-fill presets for the admin form. The labels are sizes, not words, so
// they read the same in both languages.
export const SIZE_PRESETS = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL"],
  shoes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
} as const

export type SizePreset = keyof typeof SIZE_PRESETS

/** A label the database accepts: trimmed, 1–20 characters, no "|" (the cart's separator). */
export function isValidSizeLabel(label: string): boolean {
  return label === label.trim() && label.length >= 1 && label.length <= MAX_SIZE_LABEL_LENGTH && !label.includes("|")
}

export function hasSizes(product: { sizes?: ProductSize[] | null }): boolean {
  return (product.sizes?.length ?? 0) > 0
}

/**
 * How many can be bought: the chosen size's stock for a sized product (0 when
 * the size no longer exists or none was chosen), otherwise the product's stock.
 */
export function availableStock(
  product: { stock: number; sizes?: ProductSize[] | null },
  size?: string | null
): number {
  if (!hasSizes(product)) return size ? 0 : product.stock
  if (!size) return 0
  return product.sizes!.find((s) => s.label === size)?.stock ?? 0
}

/** Whether a cart line's size still matches what the product is sold in. */
export function isSizeChoiceValid(product: { sizes?: ProductSize[] | null }, size?: string | null): boolean {
  if (!hasSizes(product)) return !size
  return !!size && product.sizes!.some((s) => s.label === size)
}

/** The rows the form sends: trimmed, blanks dropped, later duplicates dropped, stock a whole number ≥ 0. */
export function normalizeSizes(sizes: ProductSize[]): ProductSize[] {
  const seen = new Set<string>()
  const result: ProductSize[] = []
  for (const size of sizes) {
    const label = size.label.trim()
    if (!label || seen.has(label.toLowerCase())) continue
    seen.add(label.toLowerCase())
    const stock = Number.isFinite(size.stock) ? Math.max(0, Math.floor(size.stock)) : 0
    result.push({ label, stock })
  }
  return result
}

export function totalSizeStock(sizes: ProductSize[]): number {
  return sizes.reduce((sum, size) => sum + size.stock, 0)
}

/** Adds a preset's labels the list doesn't have yet, each with no stock. */
export function addPreset(sizes: ProductSize[], preset: SizePreset): ProductSize[] {
  const have = new Set(sizes.map((s) => s.label.trim().toLowerCase()))
  return [...sizes, ...SIZE_PRESETS[preset].filter((label) => !have.has(label.toLowerCase())).map((label) => ({ label, stock: 0 }))]
}
