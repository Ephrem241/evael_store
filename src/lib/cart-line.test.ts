import { describe, expect, it } from "vitest"

import { keyOf, lineKey, parseLineKey } from "@/lib/cart-line"

const id = "6f1c2a52-0d8e-4c39-9a51-2b3c4d5e6f70"

describe("cart line keys", () => {
  it("is the bare product id for a product without sizes", () => {
    expect(lineKey(id)).toBe(id)
    expect(lineKey(id, null)).toBe(id)
    expect(lineKey(id, "")).toBe(id)
    expect(parseLineKey(id)).toEqual({ productId: id })
  })

  it("adds the size, and splits back to the same line", () => {
    expect(lineKey(id, "XL")).toBe(`${id}|XL`)
    expect(parseLineKey(`${id}|XL`)).toEqual({ productId: id, size: "XL" })
    expect(parseLineKey(lineKey(id, "42.5"))).toEqual({ productId: id, size: "42.5" })
    expect(keyOf({ productId: id, size: "One size" })).toBe(`${id}|One size`)
  })

  it("tells two sizes of one product apart", () => {
    expect(lineKey(id, "M")).not.toBe(lineKey(id, "L"))
  })
})
