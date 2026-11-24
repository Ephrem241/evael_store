"use client"

import { useId, useState, type KeyboardEvent, type PointerEvent } from "react"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import { formatDayKey } from "@/lib/date"
import { formatNumber } from "@/lib/currency"
import type { DashboardDay } from "@/lib/admin/dashboard-stats"

// Hand-drawn SVG charts for the admin dashboard (no chart library). The lines
// are drawn in a stretched viewBox with non-scaling strokes, so they fill any
// width; every piece of text is HTML on top, so it never stretches.

const VIEW_W = 1000
const VIEW_H = 200

/** Points of a series in the stretched viewBox (y grows downwards). */
function points(values: number[], max: number): [number, number][] {
  const step = values.length > 1 ? VIEW_W / (values.length - 1) : 0
  return values.map((v, i) => [i * step, VIEW_H - (max > 0 ? (v / max) * VIEW_H : 0)])
}

function linePath(pts: [number, number][]): string {
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
}

function areaPath(pts: [number, number][]): string {
  if (pts.length === 0) return ""
  return `${linePath(pts)} L${pts.at(-1)![0].toFixed(1)},${VIEW_H} L0,${VIEW_H} Z`
}

/** A round axis top: 1, 2, 2.5 or 5 times a power of ten (whole quarters for small counts). */
export function niceMax(value: number, whole: boolean): number {
  if (value <= 0) return whole ? 4 : 1000
  if (whole && value <= 20) return Math.ceil(value / 4) * 4
  const power = 10 ** Math.floor(Math.log10(value))
  return ([1, 2, 2.5, 5, 10].find((m) => m * power >= value) ?? 10) * power
}

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })

// A KPI card's little trend line: decoration only (the card states the number).
function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const id = useId()
  const max = Math.max(...values, 0)
  const pts = points(values, max * 1.1)

  return (
    <svg aria-hidden viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" className={cn("overflow-visible", className)}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath(pts)} fill={`url(#${id})`} />
      <path d={linePath(pts)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export type SalesMetric = "revenue" | "orders"

// The period's sales by day, one measure at a time (revenue or orders: they
// have different scales, so they are never drawn on one axis). Pointer or
// arrow keys move a crosshair; the tooltip gives that day's figures. A hidden
// table carries the same numbers for screen readers.
function SalesChart({
  days,
  metric,
  formatMoney,
}: {
  days: DashboardDay[]
  metric: SalesMetric
  formatMoney: (value: number) => string
}) {
  const t = useT()
  const gradientId = useId()
  const [active, setActive] = useState<number | null>(null)

  const values = days.map((d) => d[metric])
  const max = niceMax(Math.max(...values, 0), metric === "orders")
  const pts = points(values, max)
  const ticks = [1, 0.75, 0.5, 0.25, 0]
  // About six date labels, whatever the period.
  const every = Math.max(1, Math.ceil(days.length / 6))
  const labelled = days.map((_, i) => i).filter((i) => i % every === 0 || i === days.length - 1)
  if (labelled.length > 1 && labelled.at(-1)! - labelled.at(-2)! < every / 2) labelled.splice(-2, 1)

  const position = (i: number) => (days.length > 1 ? (i / (days.length - 1)) * 100 : 0)

  function pick(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width))
    setActive(Math.round(ratio * (days.length - 1)))
  }

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const last = days.length - 1
    const from = active ?? last
    const next =
      event.key === "ArrowLeft" ? Math.max(0, from - 1)
      : event.key === "ArrowRight" ? Math.min(last, from + 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null
    if (next === null) return
    event.preventDefault()
    setActive(next)
  }

  const metricName = t(metric === "revenue" ? "admin.dashboard.revenue" : "admin.dashboard.orders")
  const summary = t("admin.dashboard.chartSummary", {
    metric: metricName,
    from: formatDayKey(days[0].date, t.locale),
    to: formatDayKey(days.at(-1)!.date, t.locale),
    total: (metric === "revenue" ? formatMoney : formatNumber)(values.reduce((a, b) => a + b, 0)),
  })
  const day = active !== null ? days[active] : null

  return (
    <div className="flex gap-2">
      {/* The y axis: round values, recessive. */}
      <div aria-hidden className="relative h-56 w-11 shrink-0 text-right text-[11px] text-muted-text tabular-nums sm:h-64">
        {ticks.map((tick) => (
          <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - tick) * 100}%` }}>
            {compact.format(max * tick)}
          </span>
        ))}
      </div>

      <div className="relative min-w-0 flex-1">
        <div
          role="img"
          aria-label={summary}
          tabIndex={0}
          onPointerMove={pick}
          onPointerLeave={() => setActive(null)}
          onKeyDown={move}
          onBlur={() => setActive(null)}
          className="relative h-56 touch-pan-y rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 sm:h-64"
        >
          {ticks.map((tick) => (
            <div
              key={tick}
              aria-hidden
              className={cn("absolute inset-x-0 border-t", tick === 0 ? "border-charcoal/25" : "border-dashed border-border")}
              style={{ top: `${(1 - tick) * 100}%` }}
            />
          ))}
          <svg aria-hidden viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible text-brand">
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity="0.18" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath(pts)} fill={`url(#${gradientId})`} />
            <path d={linePath(pts)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>

          {day && active !== null && (
            <>
              <div aria-hidden className="absolute inset-y-0 w-px bg-charcoal/30" style={{ left: `${position(active)}%` }} />
              <div
                aria-hidden
                className="absolute size-2.5 -translate-1/2 rounded-full bg-brand ring-2 ring-surface"
                style={{ left: `${position(active)}%`, top: `${(1 - (max > 0 ? values[active] / max : 0)) * 100}%` }}
              />
              <div
                className={cn(
                  "pointer-events-none absolute top-2 z-10 min-w-36 rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lift",
                  position(active) > 55 ? "-translate-x-[calc(100%+0.75rem)]" : "translate-x-3"
                )}
                style={{ left: `${position(active)}%` }}
              >
                <p className="font-semibold text-charcoal">{formatDayKey(day.date, t.locale)}</p>
                <p className="mt-1 flex justify-between gap-4 text-muted-text">
                  {t("admin.dashboard.revenue")}
                  <span className="font-semibold text-charcoal tabular-nums">{formatMoney(day.revenue)}</span>
                </p>
                <p className="flex justify-between gap-4 text-muted-text">
                  {t("admin.dashboard.orders")}
                  <span className="font-semibold text-charcoal tabular-nums">{formatNumber(day.orders)}</span>
                </p>
              </div>
            </>
          )}
        </div>

        {/* The x axis: about six dates. */}
        <div aria-hidden className="relative mt-2 h-4 text-[11px] text-muted-text">
          {labelled.map((i, n) => (
            <span
              key={days[i].date}
              className={cn(
                "absolute whitespace-nowrap",
                // Phones: every other date (and the first and last), so they never touch.
                n % 2 === 1 && n !== labelled.length - 1 && "max-sm:hidden",
                n === labelled.length - 2 && "max-sm:hidden",
                i === 0 ? "left-0" : i === days.length - 1 ? "right-0" : "-translate-x-1/2"
              )}
              style={i === 0 || i === days.length - 1 ? undefined : { left: `${position(i)}%` }}
            >
              {formatDayKey(days[i].date, t.locale)}
            </span>
          ))}
        </div>

        <table className="sr-only">
          <caption>{summary}</caption>
          <thead>
            <tr>
              <th scope="col">{t("admin.dashboard.chartDate")}</th>
              <th scope="col">{t("admin.dashboard.revenue")}</th>
              <th scope="col">{t("admin.dashboard.orders")}</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date}>
                <th scope="row">{formatDayKey(d.date, t.locale)}</th>
                <td>{formatMoney(d.revenue)}</td>
                <td>{formatNumber(d.orders)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { SalesChart, Sparkline }
