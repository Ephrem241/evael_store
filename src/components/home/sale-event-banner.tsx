import Link from "next/link"
import { ArrowRight, PartyPopper } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import { nameOf, pickLocale } from "@/lib/i18n/content"
import { msUntil, type SaleEvent } from "@/lib/sale-events"
import type { CategoryWithCount } from "@/lib/services/catalog"
import { DealsCountdown } from "@/components/home/deals-countdown"
import { Button } from "@/components/ui/button"

// The banner of a running holiday / special sale (admin: /admin/sales): its
// name, how much is off and on what, the admin's tagline, a live countdown to
// the real end date and a button to the products it covers. Deep burgundy with
// a thin gold frame, so it reads as an occasion rather than one more deal.
// On phones the countdown drops under the words.
//
// Shown only while the event is running: the page leaves it out otherwise.
async function SaleEventBanner({
  event,
  categories,
  headingId = "sale-event-heading",
}: {
  event: SaleEvent
  categories: CategoryWithCount[]
  headingId?: string
}) {
  const t = await getT()
  const category = event.category_id ? categories.find((c) => c.id === event.category_id) : undefined
  const tagline = pickLocale(t.locale, event.tagline_en, event.tagline_am)
  const href = category ? `/category/${category.slug}` : "/deals"
  const offer = category
    ? t("home.saleEvent.offCategory", { percent: event.discount_percent, category: nameOf(category, t.locale) })
    : t("home.saleEvent.offEverything", { percent: event.discount_percent })

  return (
    <section
      aria-labelledby={headingId}
      className="relative isolate overflow-hidden rounded-hero bg-brand-deepest text-white ring-1 ring-gold/50 ring-inset"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-brand-strong/60 blur-3xl"
      />
      <div className="flex flex-col gap-4 px-4 py-5 sm:px-8 sm:py-7 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-10">
        <div className="min-w-0 space-y-1.5 sm:space-y-2">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-gold uppercase sm:text-xs">
            <PartyPopper aria-hidden className="size-4" />
            {t("home.saleEvent.eyebrow")}
          </p>
          <h2 id={headingId} className="font-display text-2xl leading-tight font-bold text-balance text-white sm:text-3xl">
            {nameOf(event, t.locale)}
          </h2>
          <p className="text-base font-bold text-gold sm:text-xl">{offer}</p>
          {tagline && <p className="text-sm text-white/85">{tagline}</p>}
          <Button variant="gold" asChild className="mt-2 max-sm:h-9 max-sm:text-sm">
            <Link href={href}>
              {t("home.saleEvent.cta")}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
        <div className="shrink-0 space-y-2">
          <p className="text-xs font-medium text-white/85">{t("home.saleEvent.endsIn")}</p>
          <DealsCountdown endsAt={event.ends_at} initialRemainingMs={msUntil(event.ends_at)} />
        </div>
      </div>
    </section>
  )
}

export { SaleEventBanner }
