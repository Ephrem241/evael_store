"use client"

import { useFormContext } from "react-hook-form"
import { Banknote, Landmark } from "lucide-react"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import { paymentProviders } from "@/lib/services/payment"
import { CheckoutStep } from "@/components/checkout/checkout-step"
import type { CheckoutValues } from "@/components/checkout/checkout-schema"

// Cash on delivery shows a banknote; any other provider a bank.
const ICONS: Record<string, typeof Banknote> = { cod: Banknote }

// Each provider is a card with its icon, name and a line about it; the chosen
// one has a burgundy border on the soft burgundy tint. One not taken yet is
// greyed out with a "Coming soon" pill after its name (the radio stays real, so the group
// reads correctly).
function CheckoutPaymentSection() {
  const t = useT()
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutValues>()

  return (
    <CheckoutStep number={2} title={t("checkout.payment.title")}>
      {/* One group for the options, named by the step heading ("Payment method"). */}
      <div
        role="radiogroup"
        aria-labelledby="checkout-step-2"
        aria-required="true"
        aria-describedby={errors.paymentMethod ? "payment-error" : undefined}
        className="space-y-2.5"
      >
        {paymentProviders.map((provider) => {
          const Icon = ICONS[provider.id] ?? Landmark
          return (
            <label
              key={provider.id}
              className={cn(
                "flex items-center gap-3 rounded-(--radius-control) border border-border bg-surface p-3.5 text-sm transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring sm:p-4",
                provider.enabled ? "cursor-pointer hover:border-brand/50" : "cursor-not-allowed"
              )}
            >
              <input
                type="radio"
                value={provider.id}
                disabled={!provider.enabled}
                className="size-[18px] shrink-0 accent-brand outline-none"
                {...register("paymentMethod")}
              />
              <span
                aria-hidden
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full",
                  provider.enabled ? "bg-brand-soft text-brand-ink" : "bg-subtle text-muted-text"
                )}
              >
                <Icon className="size-5" strokeWidth={1.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className={cn("font-medium", provider.enabled ? "text-charcoal" : "text-muted-text")}>
                    {t(provider.label)}
                  </span>
                  {!provider.enabled && (
                    <span className="rounded-full bg-subtle px-2 py-0.5 text-[11px] font-semibold text-muted-text">
                      {t("home.payments.comingSoon")}
                    </span>
                  )}
                </span>
                {provider.description && <span className="block text-muted-text">{t(provider.description)}</span>}
              </span>
            </label>
          )
        })}
      </div>
      {errors.paymentMethod && (
        <p id="payment-error" role="alert" className="text-xs text-error">
          {errors.paymentMethod.message}
        </p>
      )}
    </CheckoutStep>
  )
}

export { CheckoutPaymentSection }
