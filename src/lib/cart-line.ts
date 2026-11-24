// A cart line is one product in one size. Its key (what the cart store, the
// edit tracker and the sign-in sync index lines by) is the product id, plus
// "|size" when the product is sold in sizes. Product ids are UUIDs and size
// labels can't contain "|" (migration 0029), so the key always splits back.

export const SIZE_SEPARATOR = "|"

export interface LineIdentity {
  productId: string
  size?: string
}

export function lineKey(productId: string, size?: string | null): string {
  return size ? `${productId}${SIZE_SEPARATOR}${size}` : productId
}

export function parseLineKey(key: string): LineIdentity {
  const at = key.indexOf(SIZE_SEPARATOR)
  if (at === -1) return { productId: key }
  const size = key.slice(at + 1)
  return size ? { productId: key.slice(0, at), size } : { productId: key.slice(0, at) }
}

export function keyOf(line: LineIdentity): string {
  return lineKey(line.productId, line.size)
}
