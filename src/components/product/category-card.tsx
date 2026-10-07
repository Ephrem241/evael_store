import Link from "next/link"
import { ChevronRight, Tag } from "lucide-react"
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

// The last tile of a category row: deep burgundy, a gold sale tag, "Deals" in
// the display face (gold on deep burgundy, 6.0:1), "Save More" under it, and a
// gold arrow circle. Leads to /deals.
async function DealsTile({
  aspectClassName = "aspect-[3/4]",
  className,
}: {
  aspectClassName?: string
  className?: string
}) {
  const t = await getT()

  return (
    <Link href="/deals" className={cn(tileClass, "flex flex-col justify-between bg-brand-banner p-3", aspectClassName, className)}>
      <Tag aria-hidden className="size-9 text-gold transition-transform duration-300 ease-out group-hover:scale-[1.04]" strokeWidth={1.5} />
      <span className="flex items-end justify-between gap-2">
        <span className="min-w-0">
          <span className="block font-display text-xl leading-tight font-bold text-gold">{t("nav.deals")}</span>
          <span className="mt-0.5 block text-xs text-white/85">{t("home.dealsTile.subtitle")}</span>
        </span>
        <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold text-brand-deepest">
          <ChevronRight className="size-4" />
        </span>
      </span>
    </Link>
  )
}

export { CategoryCard, DealsTile }
