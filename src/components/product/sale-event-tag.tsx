"use client"

import { PartyPopper } from "lucide-react"

import { nameOf } from "@/lib/i18n/content"
import { useT } from "@/lib/i18n/provider"
import type { ActiveSale } from "@/lib/sale-events"
import { countdownParts, useDealCountdown } from "@/components/home/deals-countdown"

// On the product page, under the price, while a holiday / special sale lowers
// it: "Genna Sale · 20% off · Ends in 2d 05:12:09", counting down to the
// event's real end. Gold-ink on a soft gold tint, so it reads as an occasion
// without competing with the red "% OFF" pill. When the time is up it says
// the sale has ended (the page's price then comes back on the next load).
function SaleEventTag({ sale, initialRemainingMs }: { sale: ActiveSale; initialRemainingMs: number }) {
  const t = useT()
  const remaining = useDealCountdown(sale.ends_at, initialRemainingMs, false)
  const { days, hours, minutes, seconds } = countdownParts(remaining)
  const pad = (n: number) => String(n).padStart(2, "0")
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  const time = days > 0 ? t("product.saleEvent.daysClock", { days, clock }) : clock

  return (
    <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-(--radius-control) border border-gold-border bg-gold/10 px-3 py-2 text-sm text-gold-ink">
      <PartyPopper aria-hidden className="size-4 shrink-0" />
      <span className="font-semibold">{nameOf(sale, t.locale)}</span>
      <span aria-hidden>·</span>
      <span>{t("product.saleEvent.percentOff", { percent: sale.percent })}</span>
      <span aria-hidden>·</span>
      {remaining > 0 ? (
        <span className="tabular-nums" role="timer" aria-live="off">
          {t("product.saleEvent.endsIn", { time })}
        </span>
      ) : (
        <span>{t("product.saleEvent.ended")}</span>
      )}
    </p>
  )
}

export { SaleEventTag }
