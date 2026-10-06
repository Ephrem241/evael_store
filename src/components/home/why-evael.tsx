import { BadgePercent, Languages, Store } from "lucide-react"

import { BRAND_NAME } from "@/lib/brand"
import { getT } from "@/lib/i18n/server"
import type { MessageKey } from "@/lib/i18n/translator"
import { Reveal } from "@/components/motion/reveal"
import { PaymentMethods } from "@/components/home/payment-methods"

// The homepage's closing band: what Evael is (three plain points — no ratings,
// counts or guarantees the store can't back up) and how to pay, with the
// payment strip saying honestly that only Cash on Delivery works today.
const points: { icon: typeof Store; title: MessageKey; text: MessageKey }[] = [
  { icon: BadgePercent, title: "home.why.valueTitle", text: "home.why.valueText" },
  { icon: Store, title: "home.why.rangeTitle", text: "home.why.rangeText" },
  { icon: Languages, title: "home.why.localTitle", text: "home.why.localText" },
]

async function WhyEvael() {
  const t = await getT()

  return (
    <Reveal>
      <section
        aria-labelledby="why-heading"
        className="space-y-8 rounded-hero border border-border bg-card px-5 py-8 shadow-soft sm:px-8 lg:px-10 lg:py-10"
      >
        <h2 id="why-heading" className="font-display text-2xl font-bold tracking-tight text-charcoal sm:text-[1.75rem] lg:text-3xl">
          {t("home.trustTitle", { brand: BRAND_NAME.split(" ")[0] })}
        </h2>
        <ul className="grid gap-6 sm:grid-cols-3 sm:gap-8">
          {points.map((point) => (
            <li key={point.title} className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <point.icon aria-hidden className="size-6" strokeWidth={1.6} />
              </span>
              <div className="space-y-1">
                <p className="font-semibold text-charcoal">{t(point.title)}</p>
                <p className="text-sm leading-relaxed text-muted-text">{t(point.text)}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t border-border pt-8">
          <PaymentMethods />
        </div>
      </section>
    </Reveal>
  )
}

export { WhyEvael }
