"use client"

import { ShoppingCart } from "lucide-react"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import { useAddToCart } from "@/lib/hooks/use-add-to-cart"
import { useIsAdmin } from "@/lib/store/auth"
import { Button } from "@/components/ui/button"

// The card's (and Quick View's) "Add to cart": a small client island (it needs
// the cart store and a toast) so the card around it can stay a Server
// Component. It reuses the same hook as the product page, so the confirmation
// toast ("Added to your cart" + View cart) is identical everywhere.
//
// A full-width labelled button at every width: on a phone's two-column grid
// the words fit, and a word is clearer than an icon alone. The card's size is
// 40px tall on desktop and 44px on phones (the Button's default).
function AddToCartButton({
  productId,
  outOfStock,
  size = "default",
  className,
}: {
  productId: string
  outOfStock?: boolean
  size?: "default" | "lg"
  className?: string
}) {
  const t = useT()
  const addToCart = useAddToCart()
  const isAdmin = useIsAdmin()

  // Admins don't shop (see useIsAdmin).
  if (isAdmin) return null

  return (
    <Button
      type="button"
      size={size}
      disabled={outOfStock}
      onClick={() => addToCart(productId)}
      className={cn(size === "default" && "text-[13px] max-lg:px-2 lg:text-sm", className)}
    >
      {!outOfStock && <ShoppingCart aria-hidden className="max-[359px]:hidden" />}
      {outOfStock ? t("product.stock.out") : t("product.addToCart")}
    </Button>
  )
}

export { AddToCartButton }
