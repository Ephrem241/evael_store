import { Banknote, Landmark, Smartphone } from "lucide-react"
import { cn } from "cn"

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
  size,
  t,
}: {
  id: string
  label: string
  tone: "success" | "muted"
  methods: PaymentMethod[]
  size: "md" | "sm"
  t: Translator
}) {
  return (
    <div className="space-y-2">
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
              className={cn(
                "inline-flex items-center gap-2 rounded-(--radius-control) border border-border bg-surface font-medium text-charcoal",
                size === "md" ? "h-10 px-3 text-sm" : "h-8 px-2.5 text-xs"
              )}
            >
              <Icon
                aria-hidden
                className={cn(size === "md" ? "size-4" : "size-3.5", method.available ? "text-success" : "text-muted-text")}
                strokeWidth={1.5}
              />
              {methodName(method, t)}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// What can pay for an order: the methods checkout really takes ("Available")
// and those still to come ("Coming Soon"), from the one list in
// services/payment.ts. Used by the home page's "Pay your way" and the cart's
// "We accept", so the two can never disagree. Takes the translator as a prop,
// so server and client components can both render it. `idPrefix` keeps the
// label ids unique on a page.
function PaymentMethodGroups({
  t,
  idPrefix,
  size = "md",
  className,
}: {
  t: Translator
  idPrefix: string
  size?: "md" | "sm"
  className?: string
}) {
  const available = paymentMethods.filter((method) => method.available)
  const upcoming = paymentMethods.filter((method) => !method.available)

  return (
    <div className={cn("flex flex-wrap items-start gap-x-8 gap-y-4", className)}>
      {available.length > 0 && (
        <MethodGroup
          id={`${idPrefix}-available`}
          label={t("home.payments.available")}
          tone="success"
          methods={available}
          size={size}
          t={t}
        />
      )}
      {upcoming.length > 0 && (
        <MethodGroup
          id={`${idPrefix}-upcoming`}
          label={t("home.payments.comingSoon")}
          tone="muted"
          methods={upcoming}
          size={size}
          t={t}
        />
      )}
    </div>
  )
}

export { PaymentMethodGroups }
