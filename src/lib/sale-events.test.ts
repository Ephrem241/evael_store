import { describe, expect, it } from "vitest"

import {
  applySaleEvents,
  bestEventFor,
  fromAddisInput,
  msUntil,
  runningEvents,
  salePrice,
  saleStatus,
  toAddisInput,
  type SaleEvent,
} from "@/lib/sale-events"

const NOW = Date.parse("2027-01-06T12:00:00.000Z")

function event(overrides: Partial<SaleEvent> = {}): SaleEvent {
  return {
    id: "genna",
    name_en: "Genna Sale",
    name_am: "የገና ቅናሽ",
    tagline_en: "",
    tagline_am: "",
    discount_percent: 20,
    category_id: null,
    starts_at: "2027-01-01T00:00:00.000Z",
    ends_at: "2027-01-08T00:00:00.000Z",
    is_active: true,
    ...overrides,
  }
}

describe("salePrice (mirrors sale_price in SQL)", () => {
  it("takes the percentage off in whole birr", () => {
    expect(salePrice(1000, 20)).toBe(800)
    expect(salePrice(999, 15)).toBe(849) // 849.15
    expect(salePrice(1250, 10)).toBe(1125)
  })

  it("never goes below 1 or above the price, and 0% changes nothing", () => {
    expect(salePrice(1, 90)).toBe(1)
    expect(salePrice(2, 90)).toBe(1)
    expect(salePrice(500, 0)).toBe(500)
  })

  it("is capped at the shop's maximum discount", () => {
    expect(salePrice(1000, 99)).toBe(100)
  })
})

describe("which events apply", () => {
  it("counts only switched-on events between their start and end", () => {
    const events = [
      event({ id: "running" }),
      event({ id: "off", is_active: false }),
      event({ id: "later", starts_at: "2027-01-07T00:00:00.000Z" }),
      event({ id: "over", ends_at: "2027-01-06T12:00:00.000Z" }),
    ]
    expect(runningEvents(events, NOW).map((e) => e.id)).toEqual(["running"])
  })

  it("gives a product the biggest discount among the shop-wide and its category's events", () => {
    const events = [
      event({ id: "shop", discount_percent: 10 }),
      event({ id: "fashion", discount_percent: 25, category_id: "fashion" }),
      event({ id: "kitchen", discount_percent: 40, category_id: "kitchen" }),
    ]
    expect(bestEventFor("fashion", events, NOW)?.id).toBe("fashion")
    expect(bestEventFor("toys", events, NOW)?.id).toBe("shop")
    expect(bestEventFor("toys", [events[1]], NOW)).toBeUndefined()
  })
})

describe("applySaleEvents", () => {
  const product = { id: "p", category_id: "fashion", price: 1000, compare_at_price: null as number | null }

  it("lowers the price, strikes through the old one and says which event", () => {
    const result = applySaleEvents(product, [event()], NOW)
    expect(result.price).toBe(800)
    expect(result.compare_at_price).toBe(1000)
    expect(result.sale).toEqual({ id: "genna", name_en: "Genna Sale", name_am: "የገና ቅናሽ", percent: 20, ends_at: "2027-01-08T00:00:00.000Z" })
  })

  it("keeps an already-discounted product's higher original price struck through", () => {
    const result = applySaleEvents({ ...product, price: 800, compare_at_price: 1200 }, [event({ discount_percent: 10 })], NOW)
    expect(result.price).toBe(720)
    expect(result.compare_at_price).toBe(1200)
  })

  it("leaves a product no running event covers as it was", () => {
    expect(applySaleEvents(product, [event({ category_id: "kitchen" })], NOW)).toBe(product)
    expect(applySaleEvents(product, [event({ is_active: false })], NOW)).toBe(product)
    expect(applySaleEvents(product, [], NOW)).toBe(product)
  })
})

describe("saleStatus", () => {
  it("is running, scheduled, ended or off", () => {
    expect(saleStatus(event(), NOW)).toBe("running")
    expect(saleStatus(event({ starts_at: "2027-02-01T00:00:00.000Z", ends_at: "2027-02-05T00:00:00.000Z" }), NOW)).toBe("scheduled")
    expect(saleStatus(event({ ends_at: "2027-01-02T00:00:00.000Z" }), NOW)).toBe("ended")
    expect(saleStatus(event({ is_active: false }), NOW)).toBe("off")
  })
})

describe("Addis Ababa date inputs", () => {
  it("shows a stored time as Addis Ababa time (UTC+3)", () => {
    expect(toAddisInput("2027-01-06T20:59:00.000Z")).toBe("2027-01-06T23:59")
    expect(toAddisInput("not a date")).toBe("")
  })

  it("reads an input as Addis Ababa time, and round-trips", () => {
    expect(fromAddisInput("2027-01-06T23:59")).toBe("2027-01-06T20:59:00.000Z")
    expect(fromAddisInput(toAddisInput("2027-01-01T00:00:00.000Z"))).toBe("2027-01-01T00:00:00.000Z")
    expect(fromAddisInput("")).toBe("")
    expect(fromAddisInput("2027-01-06")).toBe("")
  })
})

describe("msUntil", () => {
  it("is the time left, and 0 once it has passed", () => {
    expect(msUntil("2027-01-06T12:00:05.000Z", NOW)).toBe(5000)
    expect(msUntil("2027-01-06T11:00:00.000Z", NOW)).toBe(0)
    expect(msUntil("nonsense", NOW)).toBe(0)
  })
})
