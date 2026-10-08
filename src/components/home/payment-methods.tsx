import { getT } from "@/lib/i18n/server"
import { PaymentMethodGroups } from "@/components/checkout/payment-method-groups"

// "Pay your way": the heading on the left, then what works today and what is
// coming, from the one list in services/payment.ts (shared with the cart's
// "We accept"). Honest by construction: only a method checkout really takes
// is "Available".
async function PaymentMethods() {
  const t = await getT()

  return (
    <section
      aria-labelledby="payments-heading"
      className="grid gap-5 rounded-card border border-border bg-surface p-5 shadow-soft lg:grid-cols-[17rem_1fr] lg:items-center lg:gap-10 lg:px-8 lg:py-6"
    >
      <div className="space-y-1.5">
        <h2 id="payments-heading" className="type-section text-charcoal">
          {t("home.payments.title")}
        </h2>
        <p className="text-sm leading-relaxed text-muted-text">{t("home.payments.text")}</p>
      </div>
      <PaymentMethodGroups t={t} idPrefix="payments" className="gap-x-10 gap-y-5" />
    </section>
  )
}

export { PaymentMethods }
