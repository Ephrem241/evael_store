"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

import { useT } from "@/lib/i18n/provider"
import type { ProductWithCategory } from "@/lib/services/catalog"
import { Button, buttonVariants } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { FEED_CARD_SIZES, FEED_GRID_CLASS } from "@/components/home/feed-grid"

// "View more" under the For You feed: adds the next page of the catalogue
// (recommended order, from /api/products) below what is shown. Once the last
// page is in, the button becomes a link to the full shop with its filters.
// After a load, keyboard focus moves to the first new product, without
// scrolling: the new cards appear where the button was.
function ForYouMore({ page, totalPages }: { page: number; totalPages: number }) {
  const t = useT()
  const [items, setItems] = useState<ProductWithCategory[]>([])
  const [lastPage, setLastPage] = useState(page)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const focusFrom = useRef<number | null>(null)

  useEffect(() => {
    if (focusFrom.current == null) return
    const firstNew = listRef.current?.children[focusFrom.current]
    firstNew?.querySelector<HTMLAnchorElement>("a[href]")?.focus({ preventScroll: true })
    focusFrom.current = null
  }, [items])

  async function loadMore() {
    setLoading(true)
    setFailed(false)
    try {
      const response = await fetch(`/api/products?page=${lastPage + 1}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`) // i18n-ignore: never shown
      const data: { products: ProductWithCategory[]; page: number } = await response.json()
      focusFrom.current = items.length
      setItems((shown) => {
        const seen = new Set(shown.map((p) => p.id))
        return [...shown, ...data.products.filter((p) => !seen.has(p.id))]
      })
      setLastPage(data.page)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {items.length > 0 && (
        <div ref={listRef} className={FEED_GRID_CLASS}>
          {items.map((product) => (
            <ProductCard key={product.id} product={product} t={t} sizes={FEED_CARD_SIZES} />
          ))}
        </div>
      )}
      <div className="flex flex-col items-center gap-3 pt-2">
        {failed && (
          <p role="alert" className="text-center text-sm text-error">
            {t("catalog.pagination.loadFailed")}
          </p>
        )}
        {lastPage < totalPages ? (
          <Button variant="outline" size="lg" className="w-full max-w-xs" disabled={loading} onClick={loadMore}>
            {loading ? (
              <>
                <Loader2 aria-hidden className="animate-spin" />
                {t("catalog.pagination.loading")}
              </>
            ) : (
              t("home.forYouMore")
            )}
          </Button>
        ) : (
          <Link href="/shop" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full max-w-xs" })}>
            {t("nav.shopAll")}
          </Link>
        )}
      </div>
    </>
  )
}

export { ForYouMore }
