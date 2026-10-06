import Link from "next/link"
import { cn } from "cn"

import { nameOf } from "@/lib/i18n/content"
import type { Translator } from "@/lib/i18n/translator"
import type { ProductWithCategory } from "@/lib/services/catalog"
import { ImagePlaceholder } from "@/components/product/image-placeholder"
import { getCategoryIcon } from "@/components/product/category-icons"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { FavoriteButton } from "@/components/product/favorite-button"
import { QuickViewButton } from "@/components/product/quick-view"
import { Price } from "@/components/product/price"
import { DiscountBadge } from "@/components/product/discount-badge"
import { Rating } from "@/components/product/rating"

// The one product card, everywhere a product is listed:
//
//   ┌──────────────────────┐
//   │ -30%              ♡  │   discount (real compare-at price) · heart
//   │        PHOTO         │   [Quick view] slides up on desktop hover/focus
//   ├──────────────────────┤
//   │ Name (2 lines)       │
//   │ ★★★★☆ 4.6            │   only if the product has a rating
//   │ 1,299 ETB  1,850 ETB │
//   │ [   Add to cart    ] │
//   └──────────────────────┘
//
// Renders on the server (shop, home) and in the browser (favorites) alike:
// it takes the translator as a prop instead of reading it from context, which
// is what lets it stay a Server Component. Only the heart, Quick view and Add
// to cart are client islands, and they get the product's id — not the whole
// record serialized into the page.
//
// Hover (desktop): the card lifts, the photo zooms slightly and Quick view
// appears. Nothing depends on hover: on touch screens everything that matters
// (the heart, Add to cart, the link to the product) is always visible.
//
// One link per product: the name. Its ::after is stretched over the whole
// card, so the photo (and anywhere else on the card) opens the product too,
// while keyboard and screen-reader users meet a single link instead of two.
// The photo itself stays a labelled image (also when it fails to load: the
// placeholder carries the name). The buttons sit above the stretched link (z-10).
function ProductCard({
  product,
  t,
  badge,
  eager,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  compact = false,
  className,
}: {
  product: ProductWithCategory
  t: Translator
  badge?: string
  // The card is among the first things on screen: load its photo right away.
  eager?: boolean
  /** How wide the photo really is on screen (an HTML `sizes` value). The
   * default fits the 4-column shop grid; a wider or narrower grid should say so. */
  sizes?: string
  /** No Add to cart button: for the "more like this" rows on a product page,
   * where the page's own buttons are the ones that buy (the mockup's related
   * products show the photo, name and price only). */
  compact?: boolean
  className?: string
}) {
  const Icon = getCategoryIcon(product.categorySlug)
  const href = `/product/${product.slug}`
  const name = nameOf(product, t.locale)
  const onSale = !!product.compare_at_price && product.compare_at_price > product.price

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-soft transition-[box-shadow,transform,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-charcoal/10 hover:shadow-lift",
        className
      )}
    >
      <div className="relative overflow-hidden bg-subtle">
        <ImagePlaceholder
          seed={product.id}
          icon={Icon}
          label={name}
          imageUrl={product.image_url}
          sizes={sizes}
          eager={eager}
          className="rounded-none transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        {/* The badges and buttons are siblings of the Link (not nested inside
            it) — a <button> inside an <a> is invalid HTML and unreliable for
            keyboard/screen-reader users. */}
        <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1.5">
          {product.stock <= 0 && (
            <span className="inline-flex h-6 items-center rounded-md bg-charcoal px-2 text-[11px] font-semibold tracking-wide text-white">
              {t("product.stock.out")}
            </span>
          )}
          <DiscountBadge price={product.price} compareAtPrice={product.compare_at_price} />
          {badge && (
            <span className="inline-flex h-6 items-center rounded-md bg-charcoal px-2 text-[11px] font-semibold tracking-wide text-white">
              {badge}
            </span>
          )}
        </div>
        {/* Phones: a 32px heart whose invisible ::after reaches the 44px tap size. */}
        <FavoriteButton
          productId={product.id}
          className="absolute top-2.5 right-2.5 z-10 max-lg:size-8 max-lg:after:absolute max-lg:after:-inset-1.5"
        />
        {/* Desktop only, and only once the card is hovered or a key reaches it. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 hidden justify-center lg:flex">
          <QuickViewButton
            productId={product.id}
            productName={name}
            className="pointer-events-auto translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 lg:gap-2 lg:p-3.5">
        <Link
          href={href}
          className="line-clamp-2 min-h-10 text-sm leading-5 font-medium text-charcoal transition-colors outline-none group-hover:text-brand-ink after:absolute after:inset-0 after:rounded-card focus-visible:after:ring-3 focus-visible:after:ring-ring/60 lg:min-h-[2.7rem] lg:text-[15px] lg:leading-[1.35rem]"
        >
          {name}
        </Link>
        {product.rating != null && <Rating value={product.rating} t={t} />}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-1">
          <Price amount={product.price} t={t} className="text-base lg:text-lg" />
          {onSale && <Price amount={product.compare_at_price!} t={t} variant="compare" className="text-xs" />}
        </div>
        {!compact && (
          <AddToCartButton productId={product.id} outOfStock={product.stock <= 0} className="relative z-10 mt-1 w-full" />
        )}
      </div>
    </article>
  )
}

export { ProductCard }
