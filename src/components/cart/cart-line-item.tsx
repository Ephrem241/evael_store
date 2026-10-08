"use client"

import Link from "next/link"
import { Heart, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { categoryNameOf, nameOf } from "@/lib/i18n/content"
import { useT } from "@/lib/i18n/provider"
import type { CartLine } from "@/lib/store/cart"
import { useCartStore } from "@/lib/store/cart"
import { useFavoritesStore } from "@/lib/store/favorites"
import type { ProductWithCategory } from "@/lib/services/catalog"
import { isOnSale } from "@/lib/services/catalog"
import { getCategoryIcon } from "@/components/product/category-icons"
import { ImagePlaceholder } from "@/components/product/image-placeholder"
import { Price } from "@/components/product/price"
import { DiscountBadge } from "@/components/product/discount-badge"
import { QuantitySelector } from "@/components/product/quantity-selector"
import { Button } from "@/components/ui/button"

// Phones: each small button is 32px with an invisible ::after reaching 44px.
const smallButton = "relative size-8 text-muted-text after:absolute after:-inset-1.5 hover:text-brand-ink"

// One cart line as a white card: the photo on the left (72px on phones,
// 96px from `sm`); the name, category and prices; the red "% OFF" pill in the
// top-right corner with the heart under it ("Save for later": the item moves
// to the wishlist and leaves the cart); and the quantity stepper with the
// line's total and the remove button along the bottom. Removing says so in a
// toast whose Undo puts the item back.
function CartLineItem({ line, product }: { line: CartLine; product: ProductWithCategory }) {
  const t = useT()
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()
  const isFavorited = useFavoritesStore((s) => s.ids.includes(line.productId))
  const toggleFavorite = useFavoritesStore((s) => s.toggle)
  const Icon = getCategoryIcon(product.categorySlug)
  const hasDiscount = isOnSale(product)
  const lineSubtotal = product.price * line.quantity
  const name = nameOf(product, t.locale)

  function moveToWishlist() {
    if (!isFavorited) toggleFavorite(product.id)
    removeItem(product.id)
    toast.success(t("cart.movedToWishlist"), {
      action: { label: t("cart.viewWishlist"), onClick: () => router.push("/account/favorites") },
    })
  }

  function remove() {
    const quantity = line.quantity
    removeItem(product.id)
    toast(t("cart.removed", { name }), {
      action: { label: t("cart.undo"), onClick: () => addItem(product.id, quantity) },
    })
  }

  return (
    <article className="flex gap-3 rounded-card border border-border bg-surface p-3 shadow-soft sm:gap-4 sm:p-4">
      <Link
        href={`/product/${product.slug}`}
        tabIndex={-1}
        aria-hidden
        className="size-[72px] shrink-0 self-start overflow-hidden rounded-image bg-subtle sm:size-24"
      >
        <ImagePlaceholder
          seed={product.id}
          icon={Icon}
          label={name}
          decorative
          imageUrl={product.image_url}
          sizes="96px"
          aspectClassName="size-full"
          className="rounded-none"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/product/${product.slug}`}
              className="line-clamp-2 rounded-sm text-sm font-medium text-charcoal outline-none hover:text-brand-ink focus-visible:ring-2 focus-visible:ring-ring sm:text-[15px]"
            >
              {name}
            </Link>
            <p className="text-xs text-muted-text">{categoryNameOf(product, t.locale)}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <DiscountBadge price={product.price} compareAtPrice={product.compare_at_price} t={t} variant="sale" />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={moveToWishlist}
              aria-label={t("cart.moveItemToWishlist", { name })}
              className={smallButton}
            >
              <Heart aria-hidden className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-2">
          <Price amount={product.price} t={t} className="text-[0.9375rem] lg:text-base" />
          {hasDiscount && <Price amount={product.compare_at_price!} t={t} variant="compare" />}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1.5">
          <QuantitySelector value={line.quantity} onChange={(q) => setQuantity(product.id, q)} max={product.stock} />
          <div className="flex items-center gap-1.5">
            <Price amount={lineSubtotal} t={t} className="text-sm text-charcoal" />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={remove}
              aria-label={t("cart.removeItem", { name })}
              className={smallButton}
            >
              <Trash2 aria-hidden className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export { CartLineItem }
