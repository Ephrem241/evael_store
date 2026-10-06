"use client"

import { FavoritesSkeleton } from "@/components/feedback/skeletons"
import Link from "next/link"
import { Heart } from "lucide-react"

import { useT } from "@/lib/i18n/provider"
import { useRequireAuth } from "@/lib/hooks/use-require-auth"
import { useFavoritesStore } from "@/lib/store/favorites"
import { resolveFavoriteProducts } from "@/lib/favorites-math"
import { useProductsByIds } from "@/lib/hooks/use-products-by-ids"
import { ProductCard } from "@/components/product/product-card"
import { EmptyState } from "@/components/feedback/empty-state"
import { Button } from "@/components/ui/button"

function AccountFavoritesContent() {
  const t = useT()
  const { user, ready } = useRequireAuth("/login?redirect=/account/favorites")
  const hasHydrated = useFavoritesStore((s) => s.hasHydrated)
  const ids = useFavoritesStore((s) => s.ids)
  const { products: loadedProducts, loading } = useProductsByIds(ids)

  if (!ready || !user || !hasHydrated || loading) return <FavoritesSkeleton />

  const products = resolveFavoriteProducts(ids, loadedProducts)

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title={t("account.favorites.emptyTitle")}
        description={t("account.favorites.emptyText")}
        action={
          <Button asChild>
            <Link href="/shop">{t("account.favorites.browse")}</Link>
          </Button>
        }
      />
    )
  }

  return (
    // The same card as everywhere else: it carries its own Add to cart, and
    // its heart removes the product from this list.
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          t={t}
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 31vw, 47vw"
        />
      ))}
    </div>
  )
}

export { AccountFavoritesContent }
