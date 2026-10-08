"use client"

import { useT } from "@/lib/i18n/provider"
import { Button } from "@/components/ui/button"

// The product page's Buy Now on phones and tablets: one full-width burgundy
// button pinned to the bottom of the screen in BottomNav's place (BottomNav is
// not shown on product pages), clear of the iPhone home indicator. Add to Cart
// sits beside the quantity on the page itself. ProductPurchaseActions renders
// this and hands it its handler, so it buys the quantity chosen on the page.
function MobilePurchaseBar({ outOfStock, onBuyNow }: { outOfStock: boolean; onBuyNow: () => void }) {
  const t = useT()

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pt-3 pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(0.75rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] shadow-up backdrop-blur-md lg:hidden">
      <Button size="lg" className="mx-auto flex w-full max-w-xl" disabled={outOfStock} onClick={onBuyNow}>
        {outOfStock ? t("product.stock.out") : t("product.buyNow")}
      </Button>
    </div>
  )
}

export { MobilePurchaseBar }
