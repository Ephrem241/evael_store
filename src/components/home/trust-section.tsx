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
// the icon beside a 13px title and a 12px line. Phones: the icon over the
// title (two lines at most), the line left out.
async function TrustSection() {
  const t = await getT()

  return (
    <section aria-label={t("home.trustLabel")} className="relative left-1/2 w-screen -translate-x-1/2 bg-subtle">
      <Container>
        <ul className="grid grid-cols-4 divide-x divide-border">
          {items.map((item) => (
            <li
              key={item.title}
              className="flex flex-col items-center gap-1.5 px-1 py-3.5 text-center lg:flex-row lg:justify-center lg:gap-3.5 lg:px-4 lg:py-5 lg:text-left"
            >
              {item.icon === "flag" ? (
                <span className="flex size-6 items-center justify-center lg:size-7">
                  <EthiopiaFlag className="h-3 w-6 lg:h-3.5 lg:w-7" />
                </span>
              ) : (
                <item.icon aria-hidden className="size-6 shrink-0 text-brand lg:size-7" strokeWidth={1.5} />
              )}
              <div className="min-w-0">
                <p className="line-clamp-2 text-[11px] leading-tight font-semibold text-charcoal lg:text-[13px]">
                  {t(item.title)}
                </p>
                <p className="mt-0.5 text-xs text-muted-text max-lg:hidden">{t(item.description)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

export { TrustSection }
