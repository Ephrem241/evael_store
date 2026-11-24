import { describe, expect, it } from "vitest"

import { computeDashboardOverview, dayKeys, itemCount, percentChange } from "@/lib/admin/dashboard-stats"
import type { Product } from "@/lib/data/products"
import type { OrderItemRecord, OrderRecord } from "@/lib/types/orders"

// 2026-11-24 12:00 in Addis Ababa (UTC+3).
const NOW = new Date("2026-11-24T09:00:00Z")

let seq = 0
function order(created_at: string, total: number, status: OrderRecord["status"] = "delivered", items: Partial<OrderItemRecord>[] = []): OrderRecord {
  seq += 1
  return {
    id: `o${seq}`,
    order_number: `EVS-${seq}`,
    status,
    total,
    created_at,
    items: items.map((item, i) => ({ id: `i${seq}-${i}`, product_id: null, product_name: "x", quantity: 1, unit_price: 0, total: 0, ...item })),
  } as OrderRecord
}

const product = (id: string, stock: number, is_active = true) => ({ id, name_en: id, stock, is_active }) as Product

describe("dayKeys", () => {
  it("lists the calendar days in Addis Ababa ending today, oldest first", () => {
    expect(dayKeys(NOW, 3)).toEqual(["2026-11-22", "2026-11-23", "2026-11-24"])
  })

  it("uses Addis Ababa's date, not UTC's: 22:00 UTC is already the next day there", () => {
    expect(dayKeys(new Date("2026-11-23T22:00:00Z"), 1)).toEqual(["2026-11-24"])
  })
})

describe("percentChange", () => {
  it("rounds to one decimal and is null when there is nothing to compare with", () => {
    expect(percentChange(112, 100)).toBe(12)
    expect(percentChange(1, 3)).toBe(-66.7)
    expect(percentChange(500, 0)).toBeNull()
  })
})

describe("computeDashboardOverview", () => {
  it("totals the period's sales without cancelled orders, and compares with the period before", () => {
    const orders = [
      order("2026-11-24T08:00:00Z", 1000),
      order("2026-11-20T08:00:00Z", 2000),
      order("2026-11-21T08:00:00Z", 9999, "cancelled"),
      // The previous 7 days (Nov 11–17).
      order("2026-11-15T08:00:00Z", 1500),
      // Older than both periods: ignored.
      order("2026-10-01T08:00:00Z", 50000),
    ]
    const stats = computeDashboardOverview(orders, [], 7, NOW)
    expect(stats.revenue).toEqual({ value: 3000, change: 100 })
    expect(stats.orders).toEqual({ value: 2, change: 100 })
    expect(stats.averageOrder).toEqual({ value: 1500, change: 0 })
  })

  it("has one entry per day of the period, filled from that day's orders", () => {
    const stats = computeDashboardOverview([order("2026-11-24T08:00:00Z", 700), order("2026-11-24T05:00:00Z", 300)], [], 7, NOW)
    expect(stats.days).toHaveLength(7)
    expect(stats.days[0].date).toBe("2026-11-18")
    expect(stats.days.at(-1)).toEqual({ date: "2026-11-24", revenue: 1000, orders: 2 })
  })

  it("counts the period's orders by status, cancelled included", () => {
    const stats = computeDashboardOverview(
      [order("2026-11-24T08:00:00Z", 1, "pending"), order("2026-11-23T08:00:00Z", 1, "pending"), order("2026-11-23T08:00:00Z", 1, "cancelled")],
      [],
      7,
      NOW
    )
    expect(stats.statusCounts.pending).toBe(2)
    expect(stats.statusCounts.cancelled).toBe(1)
    expect(stats.statusCounts.delivered).toBe(0)
  })

  it("ranks top sellers by units sold, keeping deleted products under the name they sold as", () => {
    const jug = product("jug", 10)
    const orders = [
      order("2026-11-24T08:00:00Z", 1, "delivered", [{ product_id: "jug", product_name: "Jug", quantity: 2, total: 200 }]),
      order("2026-11-23T08:00:00Z", 1, "pending", [
        { product_id: "jug", product_name: "Jug", quantity: 1, total: 100 },
        { product_id: null, product_name: "Old Rack", quantity: 5, total: 900 },
      ]),
      order("2026-11-23T08:00:00Z", 1, "cancelled", [{ product_id: "jug", product_name: "Jug", quantity: 50, total: 5000 }]),
    ]
    const [first, second] = computeDashboardOverview(orders, [jug], 7, NOW).topProducts
    expect(first).toMatchObject({ productId: null, name: "Old Rack", product: null, quantity: 5 })
    expect(second).toMatchObject({ productId: "jug", product: jug, quantity: 3, revenue: 300 })
  })

  it("counts active products in stock and lists low stock lowest first, leaving hidden products out", () => {
    const stats = computeDashboardOverview([], [product("a", 0), product("b", 3), product("c", 40), product("d", 1, false)], 30, NOW)
    expect(stats.productsInStock).toBe(2)
    expect(stats.lowStockProducts.map((p) => p.id)).toEqual(["a", "b"])
  })

  it("shows the five newest orders, whatever the period", () => {
    const orders = Array.from({ length: 7 }, (_, i) => order(`2026-0${i + 1}-01T08:00:00Z`, 1))
    expect(computeDashboardOverview(orders, [], 7, NOW).recentOrders.map((o) => o.created_at.slice(0, 7))).toEqual([
      "2026-07",
      "2026-06",
      "2026-05",
      "2026-04",
      "2026-03",
    ])
  })
})

describe("itemCount", () => {
  it("adds up the quantities of an order's lines", () => {
    expect(itemCount(order(NOW.toISOString(), 1, "pending", [{ quantity: 2 }, { quantity: 3 }]))).toBe(5)
  })
})
