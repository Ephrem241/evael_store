"use client"

import { CartSkeleton } from "@/components/feedback/skeletons"
import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, ShoppingBag } from "lucide-react"

import { useT } from "@/lib/i18n/provider"
import { useCartStore } from "@/lib/store/cart"
import { useIsAdmin } from "@/lib/store/auth"
import { useProductsByIds } from "@/lib/hooks/use-products-by-ids"
import { resolveCartLines, computeCartTotals } from "@/lib/cart-math"
import { EmptyState } from "@/components/feedback/empty-state"
import { Button } from "@/components/ui/button"
import { CartLineItem } from "@/components/cart/cart-line-item"
import { ClearCartButton } from "@/components/cart/clear-cart-button"
import { OrderSummary } from "@/components/cart/order-summary"

// The cart: the item cards, then the summary (on desktop the items take the
// left two thirds and the summary card stays in view on the right). Phones
// clear the cart from the trash in the page bar; desktop from the small
// "Clear cart" under the items, across from "Continue shopping".
function CartContents() {
  const t = useT()
  const items = useCartStore((s) => s.items)
  const hasHydrated = useCartStore((s) => s.hasHydrated)
  const removeItem = useCartStore((s) => s.removeItem)
  const { products, loading } = useProductsByIds(items.map((i) => i.productId))
  const isAdmin = useIsAdmin()
  const router = useRouter()

  // /cart is a public page, so the proxy can't keep admins out of it: they
  // don't shop, so send them to the dashboard (checkout is refused in proxy.ts).
  useEffect(() => {
    if (isAdmin) router.replace("/admin")
  }, [isAdmin, router])

  if (isAdmin) return <CartSkeleton />

  // Render nothing until persist finishes reading localStorage — otherwise
  // a user with a real saved cart would briefly see the empty-cart state
  // before it flips to their actual items.
  if (!hasHydrated) return <CartSkeleton />

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title={t("cart.emptyTitle")}
        description={t("cart.emptyText")}
        action={
          <Button asChild size="lg">
            <Link href="/shop">{t("cart.startShopping")}</Link>
          </Button>
        }
      />
    )
  }

  // Product details are looked up from the database; don't judge any line
  // "unavailable" until that lookup has actually come back.
  if (loading) return <CartSkeleton />

  const { resolvedLines, unavailableLines } = resolveCartLines(items, products)
  const { subtotal, savings: totalSavings } = computeCartTotals(resolvedLines)
  const itemCount = resolvedLines.reduce((count, { line }) => count + line.quantity, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="space-y-3">
        {resolvedLines.map(({ line, product }) => (
          <CartLineItem key={product.id} line={line} product={product} />
        ))}
        {unavailableLines.map((line) => (
          <div
            key={line.productId}
            className="flex items-center gap-4 rounded-card border border-dashed border-border bg-surface p-4 text-sm text-muted-text"
          >
            <Package aria-hidden className="size-8 shrink-0" />
            <p className="flex-1">{t("cart.unavailable")}</p>
            <Button variant="ghost" size="sm" onClick={() => removeItem(line.productId)}>
              {t("cart.remove")}
            </Button>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-brand-ink underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring max-lg:min-h-11"
          >
            <ArrowLeft aria-hidden className="size-4" />
            {t("cart.continueShopping")}
          </Link>
          <ClearCartButton variant="text" className="max-lg:hidden" />
        </div>
      </div>

      <div className="lg:sticky lg:top-36">
        <OrderSummary
          subtotal={subtotal}
          totalSavings={totalSavings}
          itemCount={itemCount}
          canCheckout={resolvedLines.length > 0}
          showPaymentMethods
          flatOnMobile
        />
      </div>
    </div>
  )
}

export { CartContents }
