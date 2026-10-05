import { describe, expect, it } from "vitest"

import { applyDiscount, discountPercent } from "@/lib/discount"

describe("discountPercent", () => {
  it("is the whole-number percentage off", () => {
    expect(discountPercent(800, 1000)).toBe(20)
    expect(discountPercent(667, 1000)).toBe(33)
  })

  it("is 0 when there is no real discount", () => {
    expect(discountPercent(1000, null)).toBe(0)
    expect(discountPercent(1000, 1000)).toBe(0)
    expect(discountPercent(1000, 900)).toBe(0)
  })
})

describe("applyDiscount", () => {
  it("discounts a full-price product from its price", () => {
    expect(applyDiscount({ price: 1000, compare_at_price: null }, 20)).toEqual({ price: 800, compare_at_price: 1000 })
  })

  it("changes an existing discount from the original price", () => {
    expect(applyDiscount({ price: 800, compare_at_price: 1000 }, 50)).toEqual({ price: 500, compare_at_price: 1000 })
  })

  it("removes the discount at 0%", () => {
    expect(applyDiscount({ price: 800, compare_at_price: 1000 }, 0)).toEqual({ price: 1000, compare_at_price: null })
  })

  it("caps the discount at 90% and rounds to whole birr", () => {
    expect(applyDiscount({ price: 999, compare_at_price: null }, 95)).toEqual({ price: 100, compare_at_price: 999 })
    expect(applyDiscount({ price: 999, compare_at_price: null }, 15)).toEqual({ price: 849, compare_at_price: 999 })
  })

  it("ignores a stale compare-at price that isn't above the price", () => {
    expect(applyDiscount({ price: 1000, compare_at_price: 900 }, 10)).toEqual({ price: 900, compare_at_price: 1000 })
  })
})
