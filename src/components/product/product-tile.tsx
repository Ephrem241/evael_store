import Link from "next/link"

import { nameOf } from "@/lib/i18n/content"
import type { Translator } from "@/lib/i18n/translator"
import type { ProductWithCategory } from "@/lib/services/catalog"
import { ImagePlaceholder } from "@/components/product/image-placeholder"
import { getCategoryIcon } from "@/components/product/category-icons"
import { FavoriteButton } from "@/components/product/favorite-button"
import { Price } from "@/components/product/price"

// A lighter product card for the New Arrivals row: the photo in a 4:3 subtle
// well with the heart in its corner, and the name and price under it (always
// shown, so a tile is never a mystery). No Add to cart — the tile is a way in,
// and the whole tile opens the product (the name's link is stretched over it;
// the heart sits above that).
function ProductTile({
  product,
  t,
  sizes = "(min-width: 1280px) 200px, (min-width: 1024px) 23vw, 44vw",
}: {
  product: ProductWithCategory
  t: Translator
  sizes?: string
}) {
  const name = nameOf(product, t.locale)

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-card shadow-soft transition-shadow duration-200 ease-out hover:shadow-lift">
      <div className="relative overflow-hidden bg-subtle">
        <ImagePlaceholder
          seed={product.id}
          icon={getCategoryIcon(product.categorySlug)}
          label={name}
          imageUrl={product.image_url}
          sizes={sizes}
          fit="contain"
          aspectClassName="aspect-[4/3]"
          className="rounded-none transition-transform duration-200 ease-out group-hover:scale-[1.03]"
        />
        <FavoriteButton
          productId={product.id}
          className="absolute top-2 right-2 z-10 size-8 border-transparent bg-surface/85 shadow-none max-lg:size-8 [&_svg]:size-4"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 px-3 py-2.5">
        <Link
          href={`/product/${product.slug}`}
          title={name}
          className="truncate text-[13px] font-medium text-charcoal outline-none group-hover:text-brand-ink after:absolute after:inset-0 after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-ring"
        >
          {name}
        </Link>
        <Price amount={product.price} t={t} className="text-sm" />
      </div>
    </article>
  )
}

export { ProductTile }
