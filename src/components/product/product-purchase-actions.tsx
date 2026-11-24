"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, ShoppingCart } from "lucide-react"

import { useT } from "@/lib/i18n/provider"
import type { ProductWithCategory } from "@/lib/services/catalog"
import { useAddToCart } from "@/lib/hooks/use-add-to-cart"
import { useCartStore } from "@/lib/store/cart"
import { useIsAdmin } from "@/lib/store/auth"
import { Button } from "@/components/ui/button"
import { QuantitySelector } from "@/components/product/quantity-selector"
import { MobilePurchaseBar } from "@/components/product/mobile-purchase-bar"
import { SizeSelector } from "@/components/product/size-selector"
import { availableStock, hasSizes } from "@/lib/product-sizes"

// The buy box: the quantity stepper beside a wide Add to Cart; on desktop an
// outline Buy Now follows, on phones and tablets Buy Now is the bar pinned to
// the bottom of the screen (MobilePurchaseBar).
//
// Buy Now puts the chosen quantity in the cart and goes straight to checkout
// (a signed-out shopper is asked to sign in first, by the checkout's own
// redirect, and comes back to it). Sold out: both buttons are disabled and
// say so; there is no quantity to choose.
//
// A product sold in sizes shows the size picker first. Nothing is added until
// a size is chosen: trying to says "Please choose a size" under the picker.
// The quantity is then limited to that size's stock.
function ProductPurchaseActions({ product }: { product: ProductWithCategory }) {
  const t = useT()
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState(false)
  const router = useRouter()
  const addToCart = useAddToCart()
  const addItem = useCartStore((s) => s.addItem)
  const outOfStock = product.stock <= 0
  const isAdmin = useIsAdmin()
  const sized = hasSizes(product)
  const max = sized ? (size ? availableStock(product, size) : 1) : product.stock

  function chooseSize(label: string) {
    setSize(label)
    setSizeError(false)
    setQuantity((q) => Math.min(q, Math.max(1, availableStock(product, label))))
  }

  // Whether the shopper may go ahead; if a size is missing, says so instead.
  function ready(): boolean {
    if (sized && !size) {
      setSizeError(true)
      // On a phone Buy Now is pinned to the bottom, far from the picker.
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" })
      return false
    }
    return true
  }

  function handleAddToCart() {
    if (ready()) addToCart(product.id, quantity, size ?? undefined)
  }

  function handleBuyNow() {
    if (!ready()) return
    addItem(product.id, quantity, size ?? undefined)
    router.push("/checkout")
  }

  // An admin is here to see how the product looks, not to buy it: no
  // quantity, cart or buy buttons (nor the phone buy bar) — a way to edit it.
  if (isAdmin) {
    return (
      <div className="space-y-3 rounded-card border border-brand/30 bg-brand-soft/60 p-4">
        <p className="text-sm text-charcoal">{t("product.adminNotice")}</p>
        <Button asChild variant="outline" size="lg">
          <Link href={`/admin/products/${product.id}/edit`}>
            <Pencil aria-hidden className="size-4" />
            {t("product.editProduct")}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {/* Fixed, so it takes no room here; it comes first so that it is never
          the "last child" `space-y` spaces. */}
      <MobilePurchaseBar outOfStock={outOfStock} onBuyNow={handleBuyNow} />
      {sized && !outOfStock && (
        <div id="size-picker" className="scroll-mt-24 pb-1.5">
          <SizeSelector sizes={product.sizes!} value={size} onChange={chooseSize} error={sizeError} />
        </div>
      )}
      <div className="flex items-center gap-3">
        {!outOfStock && (
          <QuantitySelector value={quantity} onChange={setQuantity} max={max} className="h-11 shrink-0 max-lg:h-11" />
        )}
        <Button className="h-11 min-w-0 flex-1 max-lg:h-11" disabled={outOfStock} onClick={handleAddToCart}>
          {!outOfStock && <ShoppingCart aria-hidden />}
          {outOfStock ? t("product.stock.out") : t("product.addToCart")}
        </Button>
      </div>
      <Button variant="outline" className="hidden h-11 w-full lg:inline-flex" disabled={outOfStock} onClick={handleBuyNow}>
        {t("product.buyNow")}
      </Button>
    </div>
  )
}

export { ProductPurchaseActions }
