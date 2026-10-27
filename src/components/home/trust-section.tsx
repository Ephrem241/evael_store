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

// A full-width subtle band with four equal cells divided by hairlines. Desktop:
// the icon beside a 13px title and a 12px line. Phones: 2x2 quadrant with 144px
// per cell so text doesn't squash, switching to 4 columns from `sm`.
async function TrustSection() {
  const t = await getT()

  return (
    <section aria-label={t("home.trustLabel")} className="relative left-1/2 w-screen -translate-x-1/2 bg-subtle">
      <Container>
        {/* Phones: two side-by-side perk cards matching reference screenshot */}
        <div className="grid grid-cols-2 gap-2.5 py-3 lg:hidden">
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-surface p-2.5 shadow-xs">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
              <Truck aria-hidden className="size-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-charcoal">{t("home.trust.fastTitle")}</p>
              <p className="truncate text-[10px] text-muted-text">{t("home.trust.fastText")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-surface p-2.5 shadow-xs">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
              <ShieldCheck aria-hidden className="size-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-charcoal">{t("home.trust.localTitle")}</p>
              <p className="truncate text-[10px] text-muted-text">{t("home.trust.localText")}</p>
            </div>
          </div>
        </div>

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
