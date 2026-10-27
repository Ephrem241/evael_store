import { Banknote, ShieldCheck, Truck } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import type { MessageKey } from "@/lib/i18n/translator"
import { Container } from "@/components/layout/container"
import { EthiopiaFlag } from "@/components/layout/ethiopia-flag"

// The strip right under the hero: four plain statements, worded without
// promises the shop can't keep (no "guaranteed", no delivery times — the same
// rule as the announcement bar). Cash on Delivery is how checkout really takes
// payment (services/payment.ts).
const items: { icon: typeof ShieldCheck | "flag"; title: MessageKey; description: MessageKey }[] = [
  { icon: Truck, title: "home.trust.fastTitle", description: "home.trust.fastText" },
  { icon: ShieldCheck, title: "home.trust.secureTitle", description: "home.trust.secureText" },
  { icon: Banknote, title: "home.trust.codTitle", description: "home.trust.codText" },
  { icon: "flag", title: "home.trust.localTitle", description: "home.trust.localText" },
]

// The two shown on phones: the most concrete, a delivery and a way to pay.
const phoneItems = [items[0], items[2]]

// Desktop: a full-width subtle band with four equal cells divided by
// hairlines, the icon beside a 13px title and a 12px line. Phones: one soft
// burgundy card on the home page's white sheet, split in two by a hairline,
// each half a burgundy title with its icon over a grey line.
async function TrustSection() {
  const t = await getT()

  return (
    <section aria-label={t("home.trustLabel")} className="relative left-1/2 w-screen -translate-x-1/2 lg:bg-subtle">
      <Container>
        <ul className="grid grid-cols-2 divide-x divide-brand/15 rounded-xl bg-brand-soft py-2.5 lg:hidden">
          {phoneItems.map((item) => (
            <li key={item.title} className="min-w-0 px-3">
              <p className="flex items-center gap-1.5 text-[13px] leading-tight font-bold text-brand-ink">
                {item.icon !== "flag" && <item.icon aria-hidden className="size-4 shrink-0" strokeWidth={2} />}
                <span className="truncate">{t(item.title)}</span>
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted-text">{t(item.description)}</p>
            </li>
          ))}
        </ul>

        {/* Desktop: 4-column full-width subtle band */}
        <ul className="hidden divide-x divide-border lg:grid lg:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.title}
              className="flex items-center justify-center gap-3.5 px-4 py-5 text-left"
            >
              {item.icon === "flag" ? (
                <span className="flex size-7 items-center justify-center">
                  <EthiopiaFlag className="h-3.5 w-7" />
                </span>
              ) : (
                <item.icon aria-hidden className="size-7 shrink-0 text-brand" strokeWidth={1.5} />
              )}
              <div className="min-w-0">
                <p className="line-clamp-2 text-[13px] leading-tight font-semibold text-charcoal">
                  {t(item.title)}
                </p>
                <p className="mt-0.5 text-xs text-muted-text">{t(item.description)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

export { TrustSection }
