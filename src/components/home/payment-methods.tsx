import { Banknote } from "lucide-react"
import { cn } from "cn"

import { getT } from "@/lib/i18n/server"
import { cashOnDeliveryProvider } from "@/lib/services/payment"

// The Ethiopian banks and wallets shoppers ask about. They are NOT payment
// providers yet (checkout and the database's place_order take cash on delivery
// only), so they are shown as "coming soon" — never as accepted. When one is
// wired into src/lib/services/payment.ts, set `available` here.
//
// Plain styled wordmarks, not the institutions' logo files. The names are
// proper nouns and read the same in both languages.
const METHODS: { name: string; colorClass: string; available: boolean }[] = [
  { name: "CBE", colorClass: "text-[#1771A8]", available: false },
  { name: "telebirr", colorClass: "text-[#12804F]", available: false },
  { name: "Awash Bank", colorClass: "text-[#9A6A12]", available: false },
  { name: "Bank of Abyssinia", colorClass: "text-[#2360A8]", available: false },
  { name: "Dashen Bank", colorClass: "text-[#196B49]", available: false },
]

const tileClass =
  "flex h-[68px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-4 text-center sm:min-w-[150px]"

// The "Pay your way" strip, part of the Why Evael band (why-evael.tsx).
async function PaymentMethods() {
  const t = await getT()
  const codAvailable = cashOnDeliveryProvider.enabled
  const upcoming = METHODS.filter((method) => !method.available)

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 id="payments-heading" className="text-lg font-bold tracking-tight text-charcoal">
          {t("home.payments.title")}
        </h3>
        <p className="max-w-xl text-sm leading-relaxed text-muted-text">{t("home.payments.text")}</p>
      </div>
      {/* Phones: a tile per bank stacked three rows of near-identical
          "coming soon" cards. Here Cash on Delivery keeps its own (shorter)
          tile, and the banks share one card with a single caption. Only one
          of the two lists is displayed, so screen readers hear it once. */}
      <ul aria-labelledby="payments-heading" className="space-y-3 sm:hidden">
        <li className={cn(tileClass, "h-14 border-success/40 bg-success/5")}>
          <span className="flex items-center gap-2 text-base font-bold text-charcoal">
            <Banknote aria-hidden className="size-5 text-success" strokeWidth={1.75} />
            {t("home.payments.cod")}
          </span>
          <span className="text-[11px] font-semibold text-success">
            {codAvailable ? t("home.payments.available") : t("home.payments.comingSoon")}
          </span>
        </li>
        {METHODS.filter((method) => method.available).map((method) => (
          <li key={method.name} className={cn(tileClass, "h-14")}>
            <span className={cn("text-base font-bold tracking-tight", method.colorClass)}>{method.name}</span>
            <span className="text-[11px] font-medium text-muted-text">{t("home.payments.available")}</span>
          </li>
        ))}
        {upcoming.length > 0 && (
          <li className="space-y-2.5 rounded-xl border border-border bg-card px-3 py-3 text-center">
            <p className="text-[11px] font-medium text-muted-text">{t("home.payments.comingSoon")}</p>
            <ul className="flex flex-wrap justify-center gap-2">
              {upcoming.map((method) => (
                <li
                  key={method.name}
                  className={cn(
                    "rounded-lg border border-border px-2.5 py-1 text-sm font-bold tracking-tight",
                    method.colorClass
                  )}
                >
                  {method.name}
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>

      <ul aria-labelledby="payments-heading" className="hidden flex-wrap gap-3 sm:flex">
        <li className={cn(tileClass, "border-success/40 bg-success/5")}>
          <span className="flex items-center gap-2 text-base font-bold text-charcoal">
            <Banknote aria-hidden className="size-5 text-success" strokeWidth={1.75} />
            {t("home.payments.cod")}
          </span>
          <span className="text-[11px] font-semibold text-success">
            {codAvailable ? t("home.payments.available") : t("home.payments.comingSoon")}
          </span>
        </li>
        {METHODS.map((method) => (
          <li key={method.name} className={tileClass}>
            {/* Not faded for "coming soon": fading brand-coloured text to 70% drops it to
                2.8-3.3:1 (WCAG AA needs 4.5:1), and the caption below already says it in words. */}
            <span className={cn("line-clamp-1 text-base font-bold tracking-tight", method.colorClass)}>
              {method.name}
            </span>
            <span className="text-[11px] font-medium text-muted-text">
              {method.available ? t("home.payments.available") : t("home.payments.comingSoon")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { PaymentMethods }
