import { describe, expect, it } from "vitest"

import { newOrderIds, type OrderAlert } from "@/lib/services/admin-order-alerts"

const order = (id: string): OrderAlert => ({
  id,
  orderNumber: `ETM-20261005-${id}`,
  total: 1000,
  createdAt: "2026-10-05T10:00:00.000Z",
  customerName: null,
})

describe("newOrderIds", () => {
  it("returns only the orders that weren't known before", () => {
    expect(newOrderIds(new Set(["a", "b"]), [order("c"), order("a"), order("b")])).toEqual(["c"])
  })

  it("returns nothing when every order is already known (or there are none)", () => {
    expect(newOrderIds(new Set(["a"]), [order("a")])).toEqual([])
    expect(newOrderIds(new Set(), [])).toEqual([])
  })
})
