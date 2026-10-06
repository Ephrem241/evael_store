import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import { dealsCountdown, type HomepageSettings } from "@/lib/services/homepage"
import { Button } from "@/components/ui/button"
import { DealsCountdown } from "@/components/home/deals-countdown"

// The phone carousel's second slide: the Special Deals card — the same words,
// picture and link as the deal popup (deal-popup.tsx), shaped like the hero
// card beside it. The photograph sits on top and the words below it on the
// soft orange, so their contrast never depends on the picture.
//
// The countdown is shown only for a real end date set by the admin: "today's
// deals" with no end date would just be a timer restarting at midnight.
async function DealsSlide({ settings }: { settings: HomepageSettings }) {
  const t = await getT()
  const countdown = dealsCountdown(settings)

  return (
    <section aria-labelledby="deals-slide-heading" className="flex h-full w-full px-4 pt-4">
      <div className="flex w-full flex-col overflow-hidden rounded-hero border border-brand/20 bg-brand-soft">
        <div className="relative min-h-36 flex-1">
          <Image
            src="/images/home/deals-kitchen.jpg"
            alt={t("home.deals.imageAlt")}
            fill
            sizes="100vw"
            className="object-cover object-[45%_50%]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-brand-soft to-transparent"
          />
          {!countdown.rolling && (
            <div className="absolute top-4 left-4">
              <DealsCountdown {...countdown} />
            </div>
          )}
        </div>
        <div className="px-5 pb-5">
          <p className="text-xs font-bold tracking-[0.14em] text-brand-ink uppercase">{settings.promoEyebrow}</p>
          <h2 id="deals-slide-heading" className="mt-1.5 font-display text-[1.75rem] leading-[1.1] font-bold tracking-tight text-charcoal">
            {settings.promoHeadline}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-charcoal/80">{settings.promoSubtext}</p>
          <Button size="lg" asChild className="mt-4">
            <Link href={settings.promoCtaHref}>
              {settings.promoCtaLabel}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export { DealsSlide }
