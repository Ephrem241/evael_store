import { Banknote, Landmark, Smartphone } from "lucide-react"
import { cn } from "cn"

import { getT } from "@/lib/i18n/server"
import type { Translator } from "@/lib/i18n/translator"
import { paymentMethods, type PaymentMethod } from "@/lib/services/payment"

const ICONS = { cash: Banknote, wallet: Smartphone, bank: Landmark } as const

function methodName(method: PaymentMethod, t: Translator): string {
  return "key" in method.label ? t(method.label.key) : method.label.name
}

// One group of methods under a small label pill: "Available" in the success
// colour, "Coming Soon" in the secondary one. Each method is a white chip with
// a line icon and its name (no logos until their owners allow it).
function MethodGroup({
  id,
  label,
  tone,
  methods,
  t,
}: {
  id: string
  label: string
  tone: "success" | "muted"
  methods: PaymentMethod[]
  t: Translator
}) {
  return (
    <div className="space-y-2.5">
      <p
        id={id}
        className={cn(
          "inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold",
          tone === "success" ? "bg-success/10 text-success" : "bg-subtle text-muted-text"
        )}
      >
        {label}
      </p>
      <ul aria-labelledby={id} className="flex flex-wrap gap-2">
        {methods.map((method) => {
          const Icon = ICONS[method.kind]
          return (
            <li
              key={method.id}
              className="inline-flex h-10 items-center gap-2 rounded-(--radius-control) border border-border bg-surface px-3 text-sm font-medium text-charcoal"
            >
              <Icon aria-hidden className={cn("size-4", method.available ? "text-success" : "text-muted-text")} strokeWidth={1.5} />
              {methodName(method, t)}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// "Pay your way": the heading on the left, then what works today and what is
// coming, from the one list in services/payment.ts (shared with the cart).
// Honest by construction: only a method checkout really takes is "Available".
async function PaymentMethods() {
  const t = await getT()
  const available = paymentMethods.filter((method) => method.available)
  const upcoming = paymentMethods.filter((method) => !method.available)

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
      <div className="flex flex-wrap items-start gap-x-10 gap-y-5">
        {available.length > 0 && (
          <MethodGroup id="payments-available" label={t("home.payments.available")} tone="success" methods={available} t={t} />
        )}
        {upcoming.length > 0 && (
          <MethodGroup id="payments-upcoming" label={t("home.payments.comingSoon")} tone="muted" methods={upcoming} t={t} />
        )}
      </div>
    </section>
  )
}

export { PaymentMethods }
