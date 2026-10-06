import { Truck } from "lucide-react"

import { formatPrice } from "@/lib/currency"
import { getT } from "@/lib/i18n/server"
import { getFreeDeliveryThreshold } from "@/lib/services/store-settings"
import { MobileCollapsible } from "@/components/ui/mobile-collapsible"

// No specific fee or day-count is stated here on purpose — spec Section 56
// requires delivery pricing to be configurable, not hardcoded. The one concrete
// promise it makes — free delivery above an amount — is shown only when that
// amount is actually configured (the same setting checkout applies).
//
// Below `lg` it folds away, like the details section beside it (see there for
// the `lg:p-6`).
async function ProductDeliverySection() {
  const [t, threshold] = await Promise.all([getT(), getFreeDeliveryThreshold()])
  const icon = <Truck aria-hidden className="size-5 text-brand" strokeWidth={1.75} />

  return (
    <section className="space-y-4 rounded-card border border-border bg-card p-5 shadow-soft max-lg:space-y-0 max-lg:p-0 lg:p-6">
      <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-charcoal max-lg:hidden">
        {icon}
        {t("product.delivery.title")}
      </h2>
      <MobileCollapsible id="product-delivery" label={t("product.delivery.title")} icon={icon} className="max-lg:px-5 max-lg:pb-5">
        <ul className="space-y-2.5 text-sm leading-relaxed text-muted-text">
          {threshold != null && (
            <li className="font-medium text-brand-ink">
              {t("cart.summary.freeDeliveryOffer", { amount: formatPrice(threshold, t) })}
            </li>
          )}
          <li>{t("product.delivery.fees")}</li>
          <li>{t("product.delivery.dispatch")}</li>
        </ul>
      </MobileCollapsible>
    </section>
  )
}

export { ProductDeliverySection }
