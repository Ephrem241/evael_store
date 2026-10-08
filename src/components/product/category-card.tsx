import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronRight, ShoppingBag } from "lucide-react"
import { cn } from "cn"

import { nameOf } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import type { CategoryWithCount } from "@/lib/services/catalog"
import { RemoteProductImage } from "@/components/product/remote-product-image"
import { getCategoryIcon } from "@/components/product/category-icons"

const tileClass =
  "group relative isolate block overflow-hidden rounded-card outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

// A category as a photo tile: the picture fills it, a dark gradient rises
// from the bottom, and over it sit the name and how many products it really
// holds (active products only; no line at all for an empty category), with a
// small white arrow circle on the right. The whole tile is one link. Hover:
// the photo grows 4% over 300ms. With no photo yet, the deep burgundy shows,
// with the category's icon faint in gold.
//
// The shape is the caller's: portrait 3:4 by default (the desktop home row),
// landscape on phones and the Categories page.
async function CategoryCard({
  category,
  sizes = "(min-width: 1024px) 180px, (min-width: 640px) 33vw, 50vw",
  aspectClassName = "aspect-[3/4]",
  className,
}: {
  category: CategoryWithCount
  /** How wide the photo really is on screen (an HTML `sizes` value). */
  sizes?: string
  aspectClassName?: string
  className?: string
}) {
  const t = await getT()
  const Icon = getCategoryIcon(category.slug)
  const name = nameOf(category, t.locale)

  return (
    <Link href={`/category/${category.slug}`} className={cn(tileClass, "bg-brand-banner", aspectClassName, className)}>
      <span aria-hidden className="absolute inset-0 -z-10 flex items-center justify-center">
        {/* getCategoryIcon is a pure lookup into a fixed module-level map (category-icons.ts) —
            the reference it returns is stable across renders, even though the linter can't see that. */}
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Icon className="size-10 text-gold/40" strokeWidth={1.5} />
      </span>
      {category.image_url && (
        <span className="absolute inset-0 -z-10 transition-transform duration-300 ease-out group-hover:scale-[1.04]">
          <RemoteProductImage src={category.image_url} alt="" sizes={sizes} />
        </span>
      )}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-black/65 via-black/25 via-35% to-transparent to-65%"
      />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <span className="min-w-0">
          <span className="block truncate text-[15px] leading-tight font-semibold text-white text-shadow-sm">{name}</span>
          {category.productCount > 0 && (
            <span className="mt-0.5 block text-xs text-white/85 text-shadow-sm">
              {t.plural("home.categoryProducts", category.productCount)}
            </span>
          )}
        </span>
        <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface text-charcoal">
          <ChevronRight className="size-4" />
        </span>
      </span>
    </Link>
  )
}

// The last tile of a category row: the shopping-bags photograph (bags and a
// gold tag on the right, calm table on the lower left), a deep burgundy fade
// from the lower-left corner, "Deals" over it in gold in the display face,
// "Save More" under it, and a gold arrow circle. Leads to /deals. Running
// corner to corner, the fade is mostly sideways on the wide phone tile and
// mostly upwards on the tall desktop one, so the bags stay clear on every
// shape. Measured against the photo behind the words, at its worst (the cream
// throw, two-across phone row): "Deals" 3.5:1 (large text), "Save More" 9.4:1.
// Hover: the photo grows 4% over 300ms, like the category tiles.
async function DealsTile({
  aspectClassName = "aspect-[3/4]",
  sizes = "(min-width: 1024px) 200px, (min-width: 640px) 25vw, 100vw",
  className,
}: {
  aspectClassName?: string
  /** How wide the photo really is on screen (an HTML `sizes` value). */
  sizes?: string
  className?: string
}) {
  const t = await getT()

  return (
    <Link href="/deals" className={cn(tileClass, "bg-brand-banner", aspectClassName, className)}>
      <span className="absolute inset-0 -z-10 transition-transform duration-300 ease-out group-hover:scale-[1.04]">
        <Image src="/images/home/deals-tile.jpg" alt="" fill sizes={sizes} className="object-cover object-[100%_35%]" />
      </span>
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-tr from-brand-banner from-15% via-brand-banner/70 via-40% to-transparent to-70%"
      />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <span className="min-w-0">
          <span className="block font-display text-xl leading-tight font-bold text-gold text-shadow-sm">{t("nav.deals")}</span>
          <span className="mt-0.5 block text-xs text-white/85 text-shadow-sm">{t("home.dealsTile.subtitle")}</span>
        </span>
        <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold text-brand-deepest">
          <ChevronRight className="size-4" />
        </span>
      </span>
    </Link>
  )
}

// The Categories page's full-width Deals row: deep burgundy, a gold shopping
// bag, "Deals" in gold in the display face, "Save More" in white and a gold
// circle with an arrow on the right. Leads to /deals.
async function DealsBanner({ className }: { className?: string }) {
  const t = await getT()

  return (
    <Link href="/deals" className={cn(tileClass, "flex items-center gap-4 bg-brand-banner px-5 py-4 lg:px-8 lg:py-5", className)}>
      <ShoppingBag aria-hidden className="size-10 shrink-0 text-gold lg:size-12" strokeWidth={1.5} />
      <span className="min-w-0 flex-1">
        <span className="block font-display text-2xl leading-tight font-bold text-gold lg:text-3xl">{t("nav.deals")}</span>
        <span className="block text-sm text-white/90">{t("home.dealsTile.subtitle")}</span>
      </span>
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold text-brand-deepest transition-transform duration-300 ease-out group-hover:translate-x-0.5"
      >
        <ArrowRight className="size-5" />
      </span>
    </Link>
  )
}

export { CategoryCard, DealsTile, DealsBanner }
