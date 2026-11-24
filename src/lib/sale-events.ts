// Holiday and special sales (the sale_events table, migration 0029): N% off
// the whole shop or one category, between two dates the admin sets. Pure, so
// the server pages, the browser and the tests share one definition.
//
// The database (sale_price, used by place_order) decides what an order really
// costs; salePrice below does the same sum so the shop shows the same price.

import { MAX_DISCOUNT_PERCENT } from "@/lib/discount"

export interface SaleEvent {
  id: string
  name_en: string
  name_am: string
  tagline_en: string
  tagline_am: string
  discount_percent: number
  /** null: every product in the shop. */
  category_id: string | null
  starts_at: string
  ends_at: string
  is_active: boolean
}

/** What a product carries while a sale event lowers its price. */
export interface ActiveSale {
  id: string
  name_en: string
  name_am: string
  percent: number
  ends_at: string
}

export function isRunning(event: SaleEvent, now: number): boolean {
  return event.is_active && Date.parse(event.starts_at) <= now && Date.parse(event.ends_at) > now
}

export function isUpcoming(event: SaleEvent, now: number): boolean {
  return event.is_active && Date.parse(event.starts_at) > now
}

/** The running events, biggest discount first (ties: the one ending soonest). */
export function runningEvents(events: SaleEvent[], now: number): SaleEvent[] {
  return events
    .filter((event) => isRunning(event, now))
    .sort((a, b) => b.discount_percent - a.discount_percent || Date.parse(a.ends_at) - Date.parse(b.ends_at))
}

/** The running event that gives a product in `categoryId` the biggest discount. */
export function bestEventFor(categoryId: string, events: SaleEvent[], now: number): SaleEvent | undefined {
  return runningEvents(events, now).find((event) => event.category_id === null || event.category_id === categoryId)
}

/** `percent` off `price`, in whole birr, never below 1 and never above the price (as sale_price in SQL). */
export function salePrice(price: number, percent: number): number {
  const p = Math.min(Math.max(Math.round(percent), 0), MAX_DISCOUNT_PERCENT)
  if (p === 0) return price
  return Math.min(price, Math.max(1, Math.round((price * (100 - p)) / 100)))
}

interface Priced {
  category_id: string
  price: number
  compare_at_price: number | null
}

/**
 * The product as the shop shows it while an event runs: the sale price, the
 * price it had before struck through (its own compare-at price if that was
 * higher), and which event it is. Products no event covers come back as they were.
 */
export function applySaleEvents<T extends Priced>(product: T, events: SaleEvent[], now: number): T & { sale?: ActiveSale } {
  const event = bestEventFor(product.category_id, events, now)
  if (!event) return product
  const price = salePrice(product.price, event.discount_percent)
  if (price >= product.price) return product
  const original = Math.max(product.price, product.compare_at_price ?? 0)
  return {
    ...product,
    price,
    compare_at_price: original,
    sale: {
      id: event.id,
      name_en: event.name_en,
      name_am: event.name_am,
      percent: event.discount_percent,
      ends_at: event.ends_at,
    },
  }
}

export type SaleStatus = "running" | "scheduled" | "ended" | "off"

/** Where an event stands, for the admin list. */
export function saleStatus(event: SaleEvent, now: number): SaleStatus {
  if (!event.is_active) return "off"
  if (Date.parse(event.ends_at) <= now) return "ended"
  if (Date.parse(event.starts_at) > now) return "scheduled"
  return "running"
}

// The admin enters dates in Addis Ababa time (UTC+3 all year, no summer time),
// whatever the computer's own time zone, so "ends 6 January, 23:59" means the
// same moment for every admin. These convert between that and the ISO time stored.
const ADDIS_OFFSET_MS = 3 * 60 * 60 * 1000

/** ISO time -> the value of an <input type="datetime-local"> in Addis Ababa time ("2027-01-06T23:59"). */
export function toAddisInput(iso: string): string {
  const ms = Date.parse(iso)
  if (!Number.isFinite(ms)) return ""
  return new Date(ms + ADDIS_OFFSET_MS).toISOString().slice(0, 16)
}

/** The value of a datetime-local input, read as Addis Ababa time -> ISO time ("" when it isn't a date). */
export function fromAddisInput(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return ""
  const ms = Date.parse(`${value}:00Z`)
  return Number.isFinite(ms) ? new Date(ms - ADDIS_OFFSET_MS).toISOString() : ""
}

/** Milliseconds until `iso` (0 once it has passed): the countdown's first value, worked out on the server. */
export function msUntil(iso: string, now: number = Date.now()): number {
  const ms = Date.parse(iso)
  return Number.isFinite(ms) ? Math.max(0, ms - now) : 0
}
