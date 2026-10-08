import { describe, expect, it } from "vitest"

import { MAX_RESULTS_PER_GROUP, searchAdmin } from "@/lib/admin/admin-search"
import { products } from "@/lib/data/products"
import type { AdminProfile } from "@/lib/services/admin-customers"
import type { OrderRecord } from "@/lib/types/orders"

const abebe: AdminProfile = {
  id: "user-abebe",
  fullName: "Abebe Kebede",
  email: "abebe@example.com",
  phone: "+251911223344",
  role: "customer",
  createdAt: "2026-09-01T08:00:00.000Z",
}

const selam: AdminProfile = {
  id: "user-selam",
  fullName: "Selamawit Tadesse",
  email: "selam@example.com",
  role: "customer",
  createdAt: "2026-09-02T08:00:00.000Z",
}

function order(overrides: Partial<OrderRecord>): OrderRecord {
  return {
    id: "order-1",
    user_id: abebe.id,
    order_number: "EV-10432",
    status: "pending",
    payment_method: "cod",
    payment_status: "pending",
    subtotal: 1850,
    delivery_fee: 0,
    discount: 0,
    total: 1850,
    delivery_address: { full_name: "Abebe Kebede", phone: "0911223344", city: "Addis Ababa", sub_city: "Bole", woreda: "03", address: "Near the bank" },
    items: [],
    status_history: [],
    created_at: "2026-10-01T08:00:00.000Z",
    updated_at: "2026-10-01T08:00:00.000Z",
    ...overrides,
  }
}

const data = {
  products,
  orders: [order({}), order({ id: "order-2", user_id: selam.id, order_number: "EV-10431", delivery_address: { ...order({}).delivery_address, full_name: "Selam T." } })],
  profiles: [abebe, selam],
}

describe("searchAdmin", () => {
  it("finds nothing until at least two characters are typed", () => {
    expect(searchAdmin("", data)).toEqual({ products: [], orders: [], customers: [] })
    expect(searchAdmin(" a ", data)).toEqual({ products: [], orders: [], customers: [] })
  })

  it("finds products by English name, Amharic name or SKU, ignoring case", () => {
    expect(searchAdmin("leather bag", data).products.map((p) => p.id)).toEqual(["classic-leather-bag"])
    expect(searchAdmin("የቆዳ ቦርሳ", data).products.map((p) => p.id)).toEqual(["classic-leather-bag"])
    expect(searchAdmin("fas-00", data).products.map((p) => p.sku)).toEqual(["FAS-001", "FAS-002", "FAS-003", "FAS-004"])
  })

  it("finds orders by number, with or without the #", () => {
    expect(searchAdmin("EV-10432", data).orders.map((o) => o.id)).toEqual(["order-1"])
    expect(searchAdmin("#ev-10431", data).orders.map((o) => o.id)).toEqual(["order-2"])
  })

  it("finds orders by the customer's account name or the name on the delivery", () => {
    expect(searchAdmin("selamawit", data).orders.map((o) => o.id)).toEqual(["order-2"])
    expect(searchAdmin("selam t.", data).orders.map((o) => o.id)).toEqual(["order-2"])
  })

  it("finds customers by name, email or phone", () => {
    expect(searchAdmin("kebede", data).customers).toEqual([abebe])
    expect(searchAdmin("selam@example", data).customers).toEqual([selam])
    expect(searchAdmin("911223", data).customers).toEqual([abebe])
  })

  it("keeps each group short", () => {
    expect(searchAdmin("e", data).products).toEqual([])
    expect(searchAdmin("an", data).products.length).toBeLessThanOrEqual(MAX_RESULTS_PER_GROUP)
    expect(searchAdmin("an", data).products.length).toBe(MAX_RESULTS_PER_GROUP)
  })

  it("works before the lists have loaded", () => {
    expect(searchAdmin("bag", {})).toEqual({ products: [], orders: [], customers: [] })
  })
})
