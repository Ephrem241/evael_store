import type { OrderRecord, OrderStatus } from "@/lib/types/orders"
import type { Product } from "@/lib/data/products"
import { storeDateKey } from "@/lib/date"

// The admin dashboard's numbers, worked out once from the orders and products
// the admin can read. Pure (no Supabase, no React) so it is unit-tested, and
// so the dashboard and any later report can never disagree.
//
// "Sales" never include cancelled orders. Days are calendar days in Addis
// Ababa (storeDateKey), whatever the admin's own computer is set to.

/** The periods the dashboard's range menu offers, in days. */
export const DASHBOARD_RANGES = [7, 30, 90] as const
export type DashboardRange = (typeof DASHBOARD_RANGES)[number]

/** A product at or below this many units is "low stock". */
export const LOW_STOCK_LIMIT = 5

const DAY_MS = 24 * 60 * 60 * 1000

export interface DashboardDay {
  /** "2026-11-24" in Addis Ababa. */
  date: string
  revenue: number
  orders: number
}

export interface DashboardMetric {
  value: number
  /** Percent change against the period just before, or null when that period had nothing to compare with. */
  change: number | null
}

export interface TopProduct {
  /** The product's id, or null when it has since been deleted. */
  productId: string | null
  /** The name stored on the order line (the product's current name is preferred when it still exists). */
  name: string
  product: Product | null
  quantity: number
  revenue: number
}

export interface DashboardOverview {
  range: DashboardRange
  revenue: DashboardMetric
  orders: DashboardMetric
  averageOrder: DashboardMetric
  /** Active products with at least one unit. */
  productsInStock: number
  /** Active products at or below LOW_STOCK_LIMIT, lowest first. */
  lowStockProducts: Product[]
  /** One entry per day of the period, oldest first. */
  days: DashboardDay[]
  /** Orders placed in the period, by status (cancelled ones included here). */
  statusCounts: Record<OrderStatus, number>
  recentOrders: OrderRecord[]
  topProducts: TopProduct[]
}

/** The calendar days ending today, oldest first. Addis Ababa has no daylight saving, so 24h steps are exact. */
export function dayKeys(now: Date, days: number): string[] {
  return Array.from({ length: days }, (_, i) => storeDateKey(new Date(now.getTime() - (days - 1 - i) * DAY_MS)))
}

/** Percent change from `previous` to `current`, rounded to one decimal; null when there was nothing before. */
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function totals(orders: OrderRecord[]) {
  const revenue = orders.reduce((sum, o) => sum + o.total, 0)
  return { revenue, orders: orders.length, average: orders.length > 0 ? Math.round(revenue / orders.length) : 0 }
}

export function itemCount(order: Pick<OrderRecord, "items">): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

export function computeDashboardOverview(
  orders: OrderRecord[],
  products: Product[],
  range: DashboardRange,
  now: Date = new Date()
): DashboardOverview {
  // The current period's days, then the same number of days just before it.
  const keys = dayKeys(now, range * 2)
  const previousKeys = new Set(keys.slice(0, range))
  const currentKeys = keys.slice(range)
  const currentSet = new Set(currentKeys)

  const inCurrent: OrderRecord[] = []
  const inPrevious: OrderRecord[] = []
  for (const order of orders) {
    const key = storeDateKey(new Date(order.created_at))
    if (currentSet.has(key)) inCurrent.push(order)
    else if (previousKeys.has(key)) inPrevious.push(order)
  }

  const sold = inCurrent.filter((o) => o.status !== "cancelled")
  const current = totals(sold)
  const before = totals(inPrevious.filter((o) => o.status !== "cancelled"))

  const byDay = new Map(currentKeys.map((date) => [date, { date, revenue: 0, orders: 0 }]))
  for (const order of sold) {
    const day = byDay.get(storeDateKey(new Date(order.created_at)))
    if (day) {
      day.revenue += order.total
      day.orders += 1
    }
  }

  const statusCounts: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    preparing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  }
  for (const order of inCurrent) statusCounts[order.status] += 1

  const productsById = new Map(products.map((p) => [p.id, p]))
  const top = new Map<string, TopProduct>()
  for (const order of sold) {
    for (const item of order.items) {
      // A deleted product's lines still count, grouped by the name they were sold under.
      const key = item.product_id ?? `name:${item.product_name}`
      const entry = top.get(key) ?? {
        productId: item.product_id,
        name: item.product_name,
        product: (item.product_id && productsById.get(item.product_id)) || null,
        quantity: 0,
        revenue: 0,
      }
      entry.quantity += item.quantity
      entry.revenue += item.total
      top.set(key, entry)
    }
  }

  const active = products.filter((p) => p.is_active)

  return {
    range,
    revenue: { value: current.revenue, change: percentChange(current.revenue, before.revenue) },
    orders: { value: current.orders, change: percentChange(current.orders, before.orders) },
    averageOrder: { value: current.average, change: percentChange(current.average, before.average) },
    productsInStock: active.filter((p) => p.stock > 0).length,
    lowStockProducts: active.filter((p) => p.stock <= LOW_STOCK_LIMIT).sort((a, b) => a.stock - b.stock),
    days: [...byDay.values()],
    statusCounts,
    recentOrders: [...orders].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5),
    topProducts: [...top.values()]
      .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue || a.name.localeCompare(b.name))
      .slice(0, 4),
  }
}
