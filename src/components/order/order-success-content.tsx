"use client"

import { CardListSkeleton } from "@/components/feedback/skeletons"
import Link from "next/link"
import { Check, PackageX } from "lucide-react"

import { useT } from "@/lib/i18n/provider"
import { useRequireAuth } from "@/lib/hooks/use-require-auth"
import { useOrder } from "@/lib/hooks/use-orders"
import { getPaymentProvider } from "@/lib/services/payment"
import { cityLabel } from "@/lib/services/delivery"
import { formatPrice } from "@/lib/currency"
import { EmptyState } from "@/components/feedback/empty-state"
import { Button } from "@/components/ui/button"

// The confirmation after placing an order: a green tick, the heading in the
// display face, the order number in a soft burgundy pill, what was ordered to
// where (total, payment, address) on the subtle well, and two ways on: the
// order's own page, or back to the shop.
function OrderSuccessContent({ orderId }: { orderId: string }) {
  const t = useT()
  const { user, ready } = useRequireAuth(`/login?redirect=/order/success/${orderId}`)
  const { data: order, loading } = useOrder(user ? orderId : undefined)

  // Render nothing until the order has actually been looked up — otherwise
  // a real order would briefly show as "not found" before it arrives.
  if (!ready || !user || loading) return <CardListSkeleton rows={1} />

  if (!order) {
    return (
      <EmptyState
        titleAs="h1"
        icon={PackageX}
        title={t("order.notFound")}
        description={t("order.notFoundShort")}
        action={
          <Button asChild>
            <Link href="/shop">{t("order.success.continue")}</Link>
          </Button>
        }
      />
    )
  }

  const provider = getPaymentProvider(order.payment_method)
  const address = order.delivery_address

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-card border border-border bg-surface p-6 text-center shadow-soft sm:p-8">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10">
        <Check aria-hidden className="size-8 text-success" strokeWidth={2.5} />
      </span>
      <div className="space-y-3">
        <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">{t("order.success.title")}</h1>
        <p className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-ink">
          {t("order.title", { number: order.order_number })}
        </p>
      </div>

      <div className="space-y-3 rounded-(--radius-control) bg-subtle p-4 text-left text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted-text">{t("cart.summary.total")}</span>
          <span className="font-bold text-charcoal tabular-nums">{formatPrice(order.total, t)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-text">{t("checkout.payment.title")}</span>
          <span className="text-right text-charcoal">{provider ? t(provider.label) : order.payment_method}</span>
        </div>
        <div className="border-t border-border pt-3">
          <p className="text-muted-text">{t("order.address.title")}</p>
          <p className="leading-relaxed text-charcoal">
            {address.full_name}, {address.phone}
            <br />
            {address.address}, {address.woreda}, {address.sub_city}, {cityLabel(address.city, t)}
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-text">{t("order.success.next")}</p>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Button variant="outline" size="lg" asChild className="sm:flex-1">
          <Link href={`/orders/${order.id}`}>{t("order.success.track")}</Link>
        </Button>
        <Button size="lg" asChild className="sm:flex-1">
          <Link href="/shop">{t("order.success.continue")}</Link>
        </Button>
      </div>
    </div>
  )
}

export { OrderSuccessContent }
