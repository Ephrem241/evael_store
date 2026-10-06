import Link from "next/link"

import { nameOf } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import type { CategoryWithCount } from "@/lib/services/catalog"
import { ImagePlaceholder } from "@/components/product/image-placeholder"
import { getCategoryIcon } from "@/components/product/category-icons"

// A photo card: the category's picture filling the top of a white card, its
// name, and how many products it really holds (the count comes from the
// catalog query, active products only). The whole card is the link. Used on
// the home page (a row of six) and on /categories.
async function CategoryCard({
  category,
  sizes = "(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw",
}: {
  category: CategoryWithCount
  /** How wide the photo really is on screen (an HTML `sizes` value). */
  sizes?: string
}) {
  const t = await getT()
  const Icon = getCategoryIcon(category.slug)
  const name = nameOf(category, t.locale)

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group block overflow-hidden rounded-card border border-border bg-card shadow-soft transition-[box-shadow,transform,border-color] duration-300 outline-none hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lift focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="overflow-hidden">
        <ImagePlaceholder
          seed={category.id}
          icon={Icon}
          label={name}
          decorative
          imageUrl={category.image_url || null}
          sizes={sizes}
          aspectClassName="aspect-[4/3]"
          className="rounded-none transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-0.5 px-3.5 pt-3 pb-3.5">
        <p className="line-clamp-1 text-[15px] font-semibold text-charcoal transition-colors group-hover:text-brand-ink">
          {name}
        </p>
        {/* An empty category says nothing rather than "0 items"; the blank line
            keeps the cards in a row the same height. */}
        <p className="min-h-4 text-xs text-muted-text">
          {category.productCount > 0 && t.plural("home.categoryItems", category.productCount)}
        </p>
      </div>
    </Link>
  )
}

export { CategoryCard }
