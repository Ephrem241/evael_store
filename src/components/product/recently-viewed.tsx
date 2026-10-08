"use client"

import { useEffect, useMemo } from "react"

import { useT } from "@/lib/i18n/provider"
import { useProductsByIds } from "@/lib/hooks/use-products-by-ids"
import { useRecentlyViewedStore } from "@/lib/store/recently-viewed"
import { ProductCard } from "@/components/product/product-card"

const SHOWN = 4

// Remembers this product as viewed, and shows the others this browser looked
// at before it (newest first). Nothing at all until there is something to
// show: no heading over an empty row, and nothing for a first-time visitor.
function RecentlyViewed({ productId }: { productId: string }) {
  const t = useT()
  const ids = useRecentlyViewedStore((s) => s.ids)
  const record = useRecentlyViewedStore((s) => s.record)

  useEffect(() => {
    record(productId)
  }, [productId, record])

  const others = useMemo(() => ids.filter((id) => id !== productId).slice(0, SHOWN), [ids, productId])
  const { products } = useProductsByIds(others)
  // In viewing order, not the order the database returned them in.
  const ordered = others.flatMap((id) => products.filter((p) => p.id === id))

  if (ordered.length === 0) return null

  return (
    <section aria-labelledby="recently-viewed-heading" className="space-y-5">
      <h2 id="recently-viewed-heading" className="font-display text-2xl font-bold tracking-tight text-charcoal">
        {t("product.recentlyViewed")}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {ordered.map((product) => (
          <ProductCard key={product.id} product={product} t={t} hideAddToCart />
        ))}
      </div>
    </section>
  )
}

export { RecentlyViewed }
