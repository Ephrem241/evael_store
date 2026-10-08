import { describe, expect, it } from "vitest"

import { formatLongDate, storeDateKey } from "@/lib/date"

// Addis Ababa is UTC+3 all year (no daylight saving).
describe("store dates (Addis Ababa)", () => {
  it("starts the store's day at midnight in Addis Ababa, not UTC", () => {
    expect(storeDateKey(new Date("2026-10-07T20:59:59Z"))).toBe("2026-10-07")
    expect(storeDateKey(new Date("2026-10-07T21:00:00Z"))).toBe("2026-10-08")
  })

  it("writes today's date for the top bar in the store's time zone", () => {
    expect(formatLongDate(new Date("2026-10-07T21:30:00Z"), "en")).toBe("Thu, Oct 8, 2026")
  })

  it("writes it in Amharic too, with the Gregorian year", () => {
    const text = formatLongDate(new Date("2026-10-07T21:30:00Z"), "am")
    expect(text).toContain("2026")
    expect(text).not.toContain("Oct")
  })
})
