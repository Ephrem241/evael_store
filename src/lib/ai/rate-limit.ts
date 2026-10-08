// How often one visitor may ask the assistant: every question costs the shop
// a Gemini call. Sliding windows per key (the visitor's IP address), kept in
// this server process's memory.
//
// Best effort, honestly described: on a host that runs several copies of the
// server (Vercel functions), each copy counts on its own, and the counts
// vanish when it restarts. It stops one visitor from hammering the chat; the
// real ceiling is the spending cap set on the Gemini key (README).

export interface RateWindow {
  /** Window length in milliseconds. */
  ms: number
  /** Requests allowed per window. */
  max: number
}

export const ASSISTANT_RATE_WINDOWS: RateWindow[] = [
  { ms: 60_000, max: 10 },
  { ms: 60 * 60_000, max: 60 },
]

// Bounds the memory one server process can spend on remembering visitors.
const MAX_KEYS = 10_000

export interface RateLimiter {
  /** Records a request for `key` and says whether it is allowed. */
  hit(key: string): { allowed: true } | { allowed: false; retryAfterSeconds: number }
}

export function createRateLimiter(windows: RateWindow[], now: () => number = Date.now): RateLimiter {
  const longest = Math.max(...windows.map((w) => w.ms))
  const hits = new Map<string, number[]>()

  return {
    hit(key) {
      const time = now()
      const recent = (hits.get(key) ?? []).filter((at) => time - at < longest)

      for (const window of windows) {
        const inWindow = recent.filter((at) => time - at < window.ms)
        if (inWindow.length >= window.max) {
          hits.set(key, recent)
          const retryAfterMs = inWindow[0] + window.ms - time
          return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) }
        }
      }

      recent.push(time)
      hits.delete(key) // re-insert, so the Map's order is least recently seen first
      hits.set(key, recent)
      if (hits.size > MAX_KEYS) hits.delete(hits.keys().next().value!)
      return { allowed: true }
    },
  }
}
