"use client"

import { Clock, CheckCircle2, PackageSearch, Truck, PackageCheck, XCircle, type LucideIcon } from "lucide-react"

import type { OrderStatusEvent } from "@/lib/types/orders"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import { formatOrderDateTime } from "@/lib/date"

const STATUS_ICONS: Record<OrderStatusEvent["status"], LucideIcon> = {
  pending: Clock,
  confirmed: CheckCircle2,
  preparing: PackageSearch,
  shipped: Truck,
  delivered: PackageCheck,
  cancelled: XCircle,
}

// A real event log, not a synthetic 6-step progress bar — if an order is
// cancelled straight from "pending" this renders exactly two entries, not
// five grayed-out phantom steps that never happened. Each event is an icon in
// a circle on a hairline; the latest is in burgundy.
function OrderTimeline({ history }: { history: OrderStatusEvent[] }) {
  const t = useT()
  return (
    <section className="space-y-4 rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6">
      <h2 className="font-display text-lg font-bold text-charcoal">{t("order.timeline.title")}</h2>
      <ol>
        {history.map((event, index) => {
          const Icon = STATUS_ICONS[event.status]
          const isLatest = index === history.length - 1
          return (
            <li
              key={`${event.status}-${event.at}`}
              aria-current={isLatest ? "step" : undefined}
              className="relative flex gap-3 pb-5 last:pb-0"
            >
              {!isLatest && <span aria-hidden className="absolute top-9 bottom-1 left-[17px] w-px bg-border" />}
              <span
                aria-hidden
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  isLatest ? "bg-brand-strong text-white" : "bg-subtle text-muted-text"
                )}
              >
                <Icon className="size-[18px]" strokeWidth={1.75} />
              </span>
              <div className="pt-1">
                <p className={isLatest ? "text-sm font-medium text-charcoal" : "text-sm text-charcoal"}>
                  {t(`order.status.${event.status}`)}
                </p>
                <p className="text-xs text-muted-text">{formatOrderDateTime(event.at, t.locale)}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export { OrderTimeline }
