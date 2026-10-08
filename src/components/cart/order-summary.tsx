"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Truck } from "lucide-react"
import { cn } from "cn"

import { formatPrice } from "@/lib/currency"
import { useT } from "@/lib/i18n/provider"
import { getFreeDeliveryThreshold } from "@/lib/services/delivery"
import { Button } from "@/components/ui/button"
import { PaymentMethodGroups } from "@/components/checkout/payment-method-groups"

// The order summary card: the subtotal (with the number of items, in the
// cart), what the shopper saves, the delivery fee, then the total under a
// rule, and the "Proceed to Checkout" button. The cart adds "We accept" under
// the button (showPaymentMethods): the same list as the home page, so what it
// promises is what checkout takes.
function OrderSummary({
  subtotal,
  totalSavings,
  canCheckout,
  itemCount,
  deliveryFee,
  hideCta,
  showPaymentMethods,
  flatOnMobile,
  bare,
}: {
  subtotal: number
  totalSavings: number
  canCheckout: boolean
  /** How many items the subtotal is for (the quantities added up): "Subtotal (2 items)". */
  itemCount?: number
  /** Drop the card frame and heading — for use inside another card (checkout). */
  bare?: boolean
  /** Once known (checkout only), folded into Total instead of the
   * "Calculated at checkout" placeholder. Savings stay purely informational
   * either way — subtotal already reflects post-discount prices, so they're
   * never subtracted a second time. */
  deliveryFee?: number
  /** Checkout supplies its own "Place order" submit button instead. */
  hideCta?: boolean
  /** The cart: "We accept" and the payment methods under the button. */
  showPaymentMethods?: boolean
  /** Phones and tablets: no card, straight on the page under a hairline
   * (the cart, as in the mockup); the card from `lg` up. */
  flatOnMobile?: boolean
}) {
  const t = useT()
  const total = subtotal + (deliveryFee ?? 0)

  // The free-delivery offer, when the shop has one (store_settings). Read in
  // the browser like the fee itself; if it can't be loaded the hint is simply
  // not shown — checkout prices the order regardless.
  const [threshold, setThreshold] = useState<number | null>(null)
  useEffect(() => {
    let cancelled = false
    getFreeDeliveryThreshold()
      .then((value) => {
        if (!cancelled) setThreshold(value)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])
  const unlocked = threshold != null && subtotal > threshold
  // How far along the way to the offer the cart is (the bar), and how much is
  // still missing. The offer is "over" the threshold — strictly above it — so
  // at exactly the threshold nothing is "away", yet it is not unlocked either:
  // the plain offer line is shown then.
  const progress = threshold != null && threshold > 0 ? Math.min(100, (subtotal / threshold) * 100) : 0
  const remaining = threshold != null ? threshold - subtotal : 0

  return (
    <div
      className={cn(
        "space-y-4",
        !bare && "rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6",
        !bare &&
          flatOnMobile &&
          "max-lg:rounded-none max-lg:border-x-0 max-lg:border-b-0 max-lg:bg-transparent max-lg:px-0 max-lg:pb-0 max-lg:shadow-none"
      )}
    >
      {!bare && (
        <h2 className={cn("font-display text-xl font-bold text-charcoal", flatOnMobile && "max-lg:sr-only")}>
          {t("cart.summary.title")}
        </h2>
      )}

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted-text">
            {itemCount != null ? t.plural("cart.summary.subtotalItems", itemCount) : t("cart.summary.subtotal")}
          </span>
          <span className="text-charcoal tabular-nums">{formatPrice(subtotal, t)}</span>
        </div>
        {totalSavings > 0 && (
          <div className="flex justify-between gap-3">
            <span className="text-muted-text">{t("cart.summary.saving")}</span>
            <span className="text-success tabular-nums">-{formatPrice(totalSavings, t)}</span>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <span className="text-muted-text">{t("cart.summary.delivery")}</span>
          <span
            className={
              deliveryFee === 0
                ? "font-medium text-success"
                : deliveryFee != null
                  ? "text-charcoal tabular-nums"
                  : "text-right text-muted-text"
            }
          >
            {deliveryFee === 0
              ? t("cart.summary.free")
              : deliveryFee != null
                ? formatPrice(deliveryFee, t)
                : t("cart.summary.calculatedAtCheckout")}
          </span>
        </div>
      </div>

      {threshold != null && deliveryFee == null && (
        <div
          className={cn(
            "space-y-2.5 rounded-(--radius-control) px-3.5 py-3",
            unlocked ? "bg-success/10" : "bg-brand-soft"
          )}
        >
          <p className={cn("flex items-start gap-2 text-sm", unlocked ? "font-medium text-success" : "text-charcoal")}>
            <Truck aria-hidden className={cn("mt-0.5 size-4 shrink-0", !unlocked && "text-brand")} />
            {unlocked
              ? t("cart.summary.freeDeliveryUnlocked")
              : remaining > 0
                ? t("cart.summary.freeDeliveryAway", { amount: formatPrice(remaining, t) })
                : t("cart.summary.freeDeliveryOffer", { amount: formatPrice(threshold, t) })}
          </p>
          {/* The sentence above says it in words; the bar only shows it. */}
          <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-surface">
            <div
              className={cn("h-full rounded-full transition-[width] duration-500 ease-out", unlocked ? "bg-success" : "bg-brand")}
              style={{ width: `${unlocked ? 100 : progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-base font-bold text-charcoal">{t("cart.summary.total")}</span>
          <span className="text-lg font-bold text-charcoal tabular-nums lg:text-xl">{formatPrice(total, t)}</span>
        </div>
        {deliveryFee == null && <p className="mt-1 text-xs text-muted-text">{t("cart.summary.deliveryAdded")}</p>}
      </div>

      {hideCta ? null : canCheckout ? (
        <Button asChild size="lg" className="w-full">
          <Link href="/checkout">{t("cart.summary.continue")}</Link>
        </Button>
      ) : (
        // A disabled <a> isn't actually inert (the `disabled` attribute/CSS
        // pseudo-class don't apply to anchors), so a real, non-navigating
        // <button disabled> is used here instead of a Link-wrapped one.
        <Button size="lg" className="w-full" disabled>
          {t("cart.summary.continue")}
        </Button>
      )}

      {showPaymentMethods && (
        <div className="space-y-3 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-charcoal">{t("cart.weAccept")}</h3>
          <PaymentMethodGroups t={t} idPrefix="cart-payments" size="sm" className="gap-x-6 gap-y-3" />
        </div>
      )}
    </div>
  )
}

export { OrderSummary }
