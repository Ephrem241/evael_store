import { Banknote, Headset, ShieldCheck, Truck } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import type { MessageKey } from "@/lib/i18n/translator"

// The compact strip right under the hero: four plain statements, worded
// without promises the shop can't keep (no "guaranteed", no delivery times —
// the same rule as the announcement bar). Cash on Delivery is how checkout
// really takes payment (services/payment.ts).
const items: { icon: typeof ShieldCheck; title: MessageKey; description: MessageKey }[] = [
  { icon: Truck, title: "home.trust.fastTitle", description: "home.trust.fastText" },
  { icon: Banknote, title: "home.trust.codTitle", description: "home.trust.codText" },
  { icon: ShieldCheck, title: "home.trust.secureTitle", description: "home.trust.secureText" },
  { icon: Headset, title: "home.trust.supportTitle", description: "home.trust.supportText" },
]

async function TrustSection() {
  const t = await getT()

  return (
    <section aria-label={t("home.trustLabel")}>
      <ul className="grid grid-cols-4 gap-px overflow-hidden rounded-card border border-border bg-border shadow-soft">
        {items.map((item) => (
          <li
            key={item.title}
            className="flex flex-col items-center gap-2 bg-card px-1.5 py-3.5 text-center lg:flex-row lg:gap-4 lg:px-5 lg:py-5 lg:text-left"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand lg:size-11">
              <item.icon aria-hidden className="size-5 lg:size-[22px]" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] leading-tight font-semibold text-charcoal sm:text-[13px] lg:text-sm">{t(item.title)}</p>
              <p className="hidden text-[13px] leading-snug text-muted-text lg:block">{t(item.description)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export { TrustSection }
