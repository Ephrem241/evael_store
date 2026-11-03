import { describe, expect, it } from "vitest"

import { summarizeReviews } from "@/lib/services/reviews"

describe("summarizeReviews", () => {
  it("is null with no approved review", () => {
    expect(summarizeReviews([])).toBeNull()
    expect(summarizeReviews([{ rating: 5, isApproved: false }])).toBeNull()
  })

  it("averages approved reviews only, to one decimal", () => {
    expect(
      summarizeReviews([
        { rating: 5, isApproved: true },
        { rating: 4, isApproved: true },
        { rating: 4, isApproved: true },
        { rating: 1, isApproved: false },
      ])
    ).toEqual({ average: 4.3, count: 3 })
  })
})
