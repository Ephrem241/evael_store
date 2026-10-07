"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Eye } from "lucide-react"
import { cn } from "cn"

import { categoryNameOf, descriptionOf, nameOf } from "@/lib/i18n/content"
import { useT } from "@/lib/i18n/provider"
import { getStockStatus, isOnSale, type ProductWithCategory } from "@/lib/services/catalog"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ImagePlaceholder } from "@/components/product/image-placeholder"
import { getCategoryIcon } from "@/components/product/category-icons"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { FavoriteButton } from "@/components/product/favorite-button"
import { DiscountBadge } from "@/components/product/discount-badge"
import { Price } from "@/components/product/price"
import { Rating } from "@/components/product/rating"

type State = { status: "idle" | "loading" | "missing" } | { status: "ready"; product: ProductWithCategory }

// The product card's "Quick view": a button over the photo (desktop, on hover
// or keyboard focus) that opens the product in a dialog — photo, price, stock,
// a short description, Add to cart and the heart — without leaving the page.
//
// Only the product's id crosses into the browser with the card; the product
// itself is loaded when the dialog opens (the same live read the cart uses),
// so a grid of cards stays light and the dialog never shows a stale price.
function QuickViewButton({
  productId,
  productName,
  className,
}: {
  productId: string
  productName: string
  className?: string
}) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<State>({ status: "idle" })

  function show() {
    setOpen(true)
    if (state.status === "ready" || state.status === "loading") return
    setState({ status: "loading" })
    // Loaded on first use, not with every page (it brings the Supabase client).
    import("@/lib/services/catalog-client")
      .then((m) => m.fetchProductsByIds([productId]))
      .then(([product]) => setState(product ? { status: "ready", product } : { status: "missing" }))
      .catch(() => setState({ status: "missing" }))
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        aria-label={t("product.quickView.open", { name: productName })}
        className={cn(
          "inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white/95 px-4 text-[13px] font-semibold text-charcoal shadow-lift ring-1 ring-black/5 backdrop-blur-sm transition-[opacity,transform,background-color,color] duration-200 outline-none hover:bg-white hover:text-brand-ink focus-visible:ring-3 focus-visible:ring-ring/60",
          className
        )}
      >
        <Eye aria-hidden className="size-4" />
        {t("product.quickView.label")}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] gap-0 overflow-y-auto rounded-hero p-0 sm:max-w-3xl">
          {state.status === "ready" ? (
            <QuickViewBody product={state.product} />
          ) : state.status === "missing" ? (
            <div className="space-y-2 p-8 text-center">
              <DialogTitle className="text-lg font-bold">{t("product.quickView.unavailable")}</DialogTitle>
              <DialogDescription>{productName}</DialogDescription>
            </div>
          ) : (
            <div aria-busy className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
              <DialogTitle className="sr-only">{productName}</DialogTitle>
              <Skeleton className="aspect-square w-full rounded-card" />
              <div className="space-y-3 pt-2">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-7 w-4/5" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function QuickViewBody({ product }: { product: ProductWithCategory }) {
  const t = useT()
  const name = nameOf(product, t.locale)
  const stock = getStockStatus(product.stock, t)

  return (
    <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
      <div className="relative">
        <ImagePlaceholder
          seed={product.id}
          icon={getCategoryIcon(product.categorySlug)}
          label={name}
          imageUrl={product.image_url}
          sizes="(min-width: 640px) 360px, 90vw"
          eager
          className="rounded-card"
        />
        <DiscountBadge
          price={product.price}
          compareAtPrice={product.compare_at_price}
          t={t}
          className="absolute top-3 left-3"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:pt-2 sm:pr-6">
        <p className="text-xs font-semibold tracking-[0.12em] text-brand-ink uppercase">
          {categoryNameOf(product, t.locale)}
        </p>
        <DialogTitle className="text-2xl leading-tight font-bold tracking-tight text-charcoal">{name}</DialogTitle>
        {product.rating != null && <Rating value={product.rating} t={t} />}
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <Price amount={product.price} t={t} className="text-2xl" />
          {isOnSale(product) && <Price amount={product.compare_at_price!} t={t} variant="compare" />}
        </div>
        <p className={cn("flex items-center gap-2 text-sm font-medium", stock.className)}>
          <span aria-hidden className="size-2 rounded-full bg-current" />
          {stock.label}
        </p>
        <DialogDescription className="line-clamp-4 text-sm leading-relaxed text-muted-text">
          {descriptionOf(product, t.locale)}
        </DialogDescription>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <AddToCartButton productId={product.id} outOfStock={product.stock <= 0} size="lg" className="flex-1" />
          <FavoriteButton productId={product.id} className="size-12 shrink-0 border border-border shadow-none" />
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="group inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-semibold text-brand-ink underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {t("product.quickView.details")}
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}

export { QuickViewButton }
