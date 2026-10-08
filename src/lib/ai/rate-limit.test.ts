import { describe, expect, it } from "vitest"

import { ASSISTANT_RATE_WINDOWS, createRateLimiter } from "@/lib/ai/rate-limit"

function clock(start = 1_000_000) {
  let now = start
  return { now: () => now, advance: (ms: number) => (now += ms) }
}

describe("createRateLimiter", () => {
  it("allows up to the limit in a window, then says when to come back", () => {
    const time = clock()
    const limiter = createRateLimiter([{ ms: 60_000, max: 3 }], time.now)
    expect([1, 2, 3].map(() => limiter.hit("a").allowed)).toEqual([true, true, true])
    time.advance(20_000)
    expect(limiter.hit("a")).toEqual({ allowed: false, retryAfterSeconds: 40 })
  })

  it("slides: a request is forgotten once its window has passed", () => {
    const time = clock()
    const limiter = createRateLimiter([{ ms: 60_000, max: 2 }], time.now)
    limiter.hit("a")
    time.advance(30_000)
    limiter.hit("a")
    expect(limiter.hit("a").allowed).toBe(false)
    time.advance(30_000) // the first request is now 60s old
    expect(limiter.hit("a").allowed).toBe(true)
    expect(limiter.hit("a").allowed).toBe(false)
  })

  it("counts each visitor separately", () => {
    const limiter = createRateLimiter([{ ms: 60_000, max: 1 }], clock().now)
    expect(limiter.hit("a").allowed).toBe(true)
    expect(limiter.hit("b").allowed).toBe(true)
    expect(limiter.hit("a").allowed).toBe(false)
  })

  it("does not count refused requests against the visitor", () => {
    const time = clock()
    const limiter = createRateLimiter([{ ms: 60_000, max: 1 }], time.now)
    limiter.hit("a")
    for (let i = 0; i < 5; i++) limiter.hit("a")
    time.advance(60_000)
    expect(limiter.hit("a").allowed).toBe(true)
  })

  it("applies every window: the assistant's hourly cap holds even at a slow pace", () => {
    const time = clock()
    const limiter = createRateLimiter(ASSISTANT_RATE_WINDOWS, time.now)
    let allowed = 0
    for (let i = 0; i < 100; i++) {
      if (limiter.hit("a").allowed) allowed++
      time.advance(10_000) // one every 10 seconds: under the per-minute limit
    }
    // 100 requests over ~16.5 minutes: the per-minute window lets 6 a minute through, the hourly one caps it at 60.
    expect(allowed).toBe(60)
  })
})
