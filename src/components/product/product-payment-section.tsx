import { Banknote } from "lucide-react"

import { getT } from "@/lib/i18n/server"
import { MobileCollapsible } from "@/components/ui/mobile-collapsible"

// How the product can be paid for — only what checkout really takes (cash on
// delivery, see services/payment.ts), with the bank and mobile-money options
// named as coming, never as available. Folds away below `lg` like its
// neighbours (see product-details-section.tsx for the padding).
async function ProductPaymentSection() {
  const t = await getT()
  const icon = <Banknote aria-hidden className="size-5 text-brand" strokeWidth={1.75} />

  return (
    <section className="space-y-4 rounded-card border border-border bg-card p-5 shadow-soft max-lg:space-y-0 max-lg:p-0 lg:p-6">
      <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-charcoal max-lg:hidden">
        {icon}
        {t("product.payment.title")}
      </h2>
      <MobileCollapsible id="product-payment" label={t("product.payment.title")} icon={icon} className="max-lg:px-5 max-lg:pb-5">
        <ul className="space-y-2.5 text-sm leading-relaxed text-muted-text">
          <li className="font-medium text-charcoal">{t("product.payment.cod")}</li>
          <li>{t("product.payment.more")}</li>
        </ul>
      </MobileCollapsible>
    </section>
  )
}

export { ProductPaymentSection }
