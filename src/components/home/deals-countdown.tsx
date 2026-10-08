"use client"

import { useEffect, useState } from "react"

import { useT } from "@/lib/i18n/provider"
import { endOfDayInAddis } from "@/lib/services/homepage"

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// A live countdown to a fixed moment, so it can't restart when the page reloads:
// either the admin's end date (homepage_sections.promo.ends_at) or, for
// "today's" deals, midnight in Addis Ababa. With `rolling`, reaching midnight
// moves on to the next one instead of ending; without it the clock stops at 0.
//
// `initialRemainingMs` is computed on the server and used for the first render,
// so the server HTML and the browser's first paint agree (no hydration
// mismatch); right after mounting, the browser switches to its own clock and
// ticks once a second. Shared by the Flash Deals panel and the deal popup.
function useDealCountdown(endsAt: string, initialRemainingMs: number, rolling: boolean): number {
  const [remaining, setRemaining] = useState(initialRemainingMs)

  useEffect(() => {
    let end = Date.parse(endsAt)
    const tick = () => {
      const now = Date.now()
      if (rolling && end <= now) end = Date.parse(endOfDayInAddis(now))
      const left = Math.max(0, end - now)
      setRemaining(left)
      // A fixed end date that has passed stays passed: stop ticking.
      if (left === 0) clearInterval(timer)
    }
    const timer = setInterval(tick, SECOND)
    tick()
    return () => clearInterval(timer)
  }, [endsAt, rolling])

  return remaining
}

/** Splits milliseconds into whole days, hours, minutes and seconds. */
function countdownParts(remaining: number) {
  return {
    days: Math.floor(remaining / DAY),
    hours: Math.floor((remaining % DAY) / HOUR),
    minutes: Math.floor((remaining % HOUR) / MINUTE),
    seconds: Math.floor((remaining % MINUTE) / SECOND),
  }
}

// The Flash Deals panel's clock: three 56px boxes on the deep burgundy
// (05 : 42 : 18, a fourth for days when there are any), white tabular figures,
// colons between and the units underneath. The figures change once a second
// with no animation. role="timer" is not announced on every tick (its live
// region is off), and its name says the time left to the minute, so a screen
// reader hears it when it reaches the clock, not sixty times a minute.
function DealsCountdown({
  endsAt,
  initialRemainingMs,
  rolling = false,
}: {
  endsAt: string
  initialRemainingMs: number
  rolling?: boolean
}) {
  const t = useT()
  const remaining = useDealCountdown(endsAt, initialRemainingMs, rolling)

  if (remaining <= 0) {
    return <p className="text-sm font-medium text-white/85">{t("home.deals.ended")}</p>
  }

  const { days, hours, minutes, seconds } = countdownParts(remaining)
  const parts = [
    ...(days > 0 ? [{ value: days, unit: t("home.deals.days") }] : []),
    { value: hours, unit: t("home.deals.hours") },
    { value: minutes, unit: t("home.deals.minutes") },
    { value: seconds, unit: t("home.deals.seconds") },
  ]
  const spoken = parts
    .slice(0, -1)
    .map((part) => `${part.value} ${part.unit}`)
    .join(" ")

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={t("home.deals.timeLeftValue", { time: spoken })}
      className="flex items-start gap-1.5"
    >
      {parts.map((part, i) => (
        <div key={part.unit} aria-hidden className="flex items-start gap-1.5">
          {i > 0 && <span className="pt-3.5 text-lg font-bold text-white/60">:</span>}
          <div className="flex flex-col items-center gap-1">
            <span className="flex size-14 items-center justify-center rounded-lg bg-white/10 text-[22px] font-bold text-white tabular-nums">
              {String(part.value).padStart(2, "0")}
            </span>
            <span className="text-[11px] text-white/80">{part.unit}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export { DealsCountdown, useDealCountdown, countdownParts }
