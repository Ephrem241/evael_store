import { describe, expect, it } from "vitest"

import {
  addPreset,
  availableStock,
  hasSizes,
  isSizeChoiceValid,
  isValidSizeLabel,
  normalizeSizes,
  SIZE_PRESETS,
  totalSizeStock,
} from "@/lib/product-sizes"

const tee = {
  stock: 5,
  sizes: [
    { label: "M", stock: 4 },
    { label: "L", stock: 1 },
    { label: "XL", stock: 0 },
  ],
}
const mug = { stock: 9, sizes: [] }

describe("availableStock", () => {
  it("is the chosen size's stock for a sized product", () => {
    expect(availableStock(tee, "M")).toBe(4)
    expect(availableStock(tee, "XL")).toBe(0)
  })

  it("is 0 for a sized product with no size, or a size it doesn't have", () => {
    expect(availableStock(tee)).toBe(0)
    expect(availableStock(tee, "S")).toBe(0)
  })

  it("is the product's stock for a product without sizes, and 0 if a size is asked for", () => {
    expect(availableStock(mug)).toBe(9)
    expect(availableStock({ stock: 9 })).toBe(9)
    expect(availableStock(mug, "M")).toBe(0)
  })
})

describe("isSizeChoiceValid / hasSizes", () => {
  it("needs a listed size for a sized product and none otherwise", () => {
    expect(hasSizes(tee)).toBe(true)
    expect(hasSizes(mug)).toBe(false)
    expect(isSizeChoiceValid(tee, "L")).toBe(true)
    expect(isSizeChoiceValid(tee, "S")).toBe(false)
    expect(isSizeChoiceValid(tee)).toBe(false)
    expect(isSizeChoiceValid(mug)).toBe(true)
    expect(isSizeChoiceValid(mug, "M")).toBe(false)
  })
})

describe("size labels and lists", () => {
  it("accepts what the database accepts", () => {
    expect(isValidSizeLabel("M")).toBe(true)
    expect(isValidSizeLabel("42.5")).toBe(true)
    expect(isValidSizeLabel("")).toBe(false)
    expect(isValidSizeLabel(" M")).toBe(false)
    expect(isValidSizeLabel("M|L")).toBe(false)
    expect(isValidSizeLabel("x".repeat(21))).toBe(false)
  })

  it("trims, drops blanks and repeats (ignoring case), and whole-numbers the stock", () => {
    expect(
      normalizeSizes([
        { label: " M ", stock: 2.7 },
        { label: "", stock: 5 },
        { label: "m", stock: 1 },
        { label: "L", stock: -3 },
      ])
    ).toEqual([
      { label: "M", stock: 2 },
      { label: "L", stock: 0 },
    ])
  })

  it("adds a preset's missing sizes after the existing ones, with no stock", () => {
    const next = addPreset([{ label: "m", stock: 3 }], "clothing")
    expect(next[0]).toEqual({ label: "m", stock: 3 })
    expect(next.map((s) => s.label)).toEqual(["m", ...SIZE_PRESETS.clothing.filter((l) => l !== "M")])
    expect(next.slice(1).every((s) => s.stock === 0)).toBe(true)
  })

  it("totals the stock", () => {
    expect(totalSizeStock(tee.sizes)).toBe(5)
    expect(totalSizeStock([])).toBe(0)
  })
})
